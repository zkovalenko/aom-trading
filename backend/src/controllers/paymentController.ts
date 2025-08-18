import { Request, Response } from 'express';
import stripe from '../config/stripe';
import pool from '../config/database';

const SELF_STUDY_COURSE_ID = 'df44da9d-48ad-4fa9-989d-0b2b7029ee2d';
const COURSE_PRICE = 50000; // $500 in cents
const ACCESS_DAYS = 90;

export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { productId, courseId } = req.body;
    const actualCourseId = courseId || productId;

    // Validate course ID (currently only supporting self-study course)
    if (actualCourseId !== SELF_STUDY_COURSE_ID) {
      res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
      return;
    }

    // Check if user already has access to this course
    const currentUser = req.user as any;
    const existingAccessResult = await pool.query(
      'SELECT id, expires_at FROM user_courses WHERE user_id = $1 AND course_id = $2 AND expires_at > CURRENT_TIMESTAMP',
      [currentUser.id, courseId]
    );

    if (existingAccessResult.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'You already have active access to this course',
        data: {
          expiresAt: existingAccessResult.rows[0].expires_at
        }
      });
      return;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: COURSE_PRICE,
      currency: 'usd',
      metadata: {
        userId: currentUser.id,
        courseId: actualCourseId,
        userEmail: currentUser.email
      },
      description: 'AOM Trading Self-Study Course Access'
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: COURSE_PRICE,
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

    if (!paymentIntentId) {
      res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
      return;
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

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

    const courseId = paymentIntent.metadata.courseId;

    // Begin database transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Record payment in database
      const paymentResult = await client.query(
        'INSERT INTO payments (user_id, course_id, stripe_payment_intent_id, amount, currency, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) RETURNING *',
        [currentUser.id, courseId, paymentIntentId, paymentIntent.amount, paymentIntent.currency, 'completed']
      );

      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ACCESS_DAYS);

      // Grant course access
      const userCourseResult = await client.query(
        'INSERT INTO user_courses (user_id, course_id, purchased_at, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP, $3) ON CONFLICT (user_id, course_id) DO UPDATE SET purchased_at = CURRENT_TIMESTAMP, expires_at = $3 RETURNING *',
        [currentUser.id, courseId, expiresAt]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Payment confirmed and course access granted',
        data: {
          payment: paymentResult.rows[0],
          courseAccess: userCourseResult.rows[0]
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
        p.course_id,
        p.stripe_payment_intent_id,
        p.amount,
        p.currency,
        p.status,
        p.created_at,
        c.name as course_name,
        c.description as course_description
      FROM payments p
      LEFT JOIN courses c ON p.course_id = c.id
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