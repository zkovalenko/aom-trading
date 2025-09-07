import { Request, Response } from 'express';
import { getStripe } from '../config/stripe';
import pool from '../config/database';

const PRODUCT_PRICE = 50000; // $500 in cents

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { productId } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
      return;
    }

    const currentUser = req.user as any;

    // Create payment intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRODUCT_PRICE,
      currency: 'usd',
      metadata: {
        userId: currentUser.id,
        productId: productId,
        userEmail: currentUser.email
      },
      description: 'AOM Trading Product Purchase'
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: PRODUCT_PRICE,
        currency: 'usd'
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
};

export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { paymentIntentId } = req.body;
    console.log("~~~~paymentIntent received", paymentIntentId);

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
      return;
    }

    // Retrieve payment intent from Stripe
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("~~~~paymentIntent retrieved", paymentIntent);
    
    if (paymentIntent.status !== 'succeeded') {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
      return;
    }

    // Verify payment belongs to current user
    const currentUser = req.user as any;
    if (paymentIntent.metadata.userId !== currentUser.id) {
      res.status(403).json({
        success: false,
        message: 'Payment verification failed'
      });
      return;
    }

    const productId = paymentIntent.metadata.productId;

    // Record payment in database
    const paymentResult = await pool.query(
      'INSERT INTO payments (user_id, product_id, stripe_payment_intent_id, amount, currency, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
      [currentUser.id, productId, paymentIntentId, paymentIntent.amount, paymentIntent.currency, 'completed']
    );

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        payment: paymentResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

export const getPaymentHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const currentUser = req.user as any;
    const paymentsResult = await pool.query(
      `SELECT 
        p.id,
        p.product_id,
        p.stripe_payment_intent_id,
        p.amount,
        p.currency,
        p.status,
        p.created_at
      FROM payments p
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC`,
      [currentUser.id]
    );

    res.json({
      success: true,
      data: {
        payments: paymentsResult.rows
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history'
    });
  }
};

// Stripe webhook handler
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update payment status in database
        await pool.query(
          'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = $2',
          ['completed', paymentIntent.id]
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        
        // Update payment status in database
        await pool.query(
          'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE stripe_payment_intent_id = $2',
          ['failed', failedPayment.id]
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};