import { Request, Response } from 'express';
import stripe from '../config/stripe';
import pool from '../config/database';
import netLicensingService from '../services/netLicensingService';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const productsResult = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY created_at ASC'
    );

    res.json({
      success: true,
      data: {
        products: productsResult.rows
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products'
    });
  }
};

export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { productId, subscriptionType } = req.body;
    const currentUser = req.user as any;

    if (!productId || !subscriptionType || !['monthly', 'annual'].includes(subscriptionType)) {
      res.status(400).json({
        success: false,
        message: 'Product ID and valid subscription type (monthly/annual) are required'
      });
      return;
    }

    // Get product details
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );

    if (productResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    const product = productResult.rows[0];
    const subscriptionTypes = product.subscription_types;
    const amount = subscriptionTypes[subscriptionType];

    if (!amount) {
      res.status(400).json({
        success: false,
        message: 'Invalid subscription type for this product'
      });
      return;
    }

    // Create Stripe payment intent for subscription
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        userId: currentUser.id,
        productId: productId,
        subscriptionType: subscriptionType,
        userEmail: currentUser.email,
        productName: product.name
      },
      description: `${product.name} - ${subscriptionType} subscription`
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: 'usd',
        productName: product.name,
        subscriptionType: subscriptionType
      }
    });
    console.log("~~~~paymentIntent", paymentIntent);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
};

export const confirmSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { paymentIntentId, ccToken } = req.body;
    const currentUser = req.user as any;

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
    if (paymentIntent.metadata.userId !== currentUser.id) {
      res.status(403).json({
        success: false,
        message: 'Payment verification failed'
      });
      return;
    }

    const { productId, subscriptionType } = paymentIntent.metadata;

    // Get product details including license template
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    const product = productResult.rows[0];

    // Calculate subscription dates
    const now = new Date();
    // 3 months trial
    const trialExpiryDate = new Date(now.getTime() + (3 * 30 * 24 * 60 * 60 * 1000)); 
    
    let subscriptionExpiryDate = new Date();
    if (subscriptionType === 'monthly') {
      subscriptionExpiryDate.setMonth(subscriptionExpiryDate.getMonth() + 1);
    } else {
      subscriptionExpiryDate.setFullYear(subscriptionExpiryDate.getFullYear() + 1);
    }

    // Generate license if product has license template
    let licenseeNumber: string | null = null;
    let licenseNumber: string | null = null;
    
    if (product.product_license_template) {
      try {
        // Get the correct license template based on subscription type
        const licenseTemplateNumber = product.product_license_template[subscriptionType];
        if (!licenseTemplateNumber) {
          throw new Error(`No license template found for ${subscriptionType} subscription type`);
        }
        
        console.log(`🎫 Generating license for user ${currentUser.email} with template ${licenseTemplateNumber} (${subscriptionType})`);
        const licenseData = await netLicensingService.generateUserLicense(
          currentUser.email,
          licenseTemplateNumber
        );
        console.log("~~licenseData", licenseData);
        licenseeNumber = licenseData.licenseeNumber;
        licenseNumber = licenseData.licenseNumber;
        console.log(`✅ License generated successfully: ${licenseNumber}`);
      } catch (error) {
        console.error('❌ Failed to generate license:', error);
        // Continue with subscription creation even if license generation fails
        // This ensures payment processing isn't blocked by licensing issues
      }
    }

    // Record payment
    const paymentResult = await pool.query(
      'INSERT INTO payments (user_id, product_id, stripe_payment_id, stripe_payment_intent_id, amount, currency, status, product_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
      [currentUser.id, productId, paymentIntentId, paymentIntentId, paymentIntent.amount, paymentIntent.currency, 'completed', 'subscription']
    );

    // Create or update user subscription
    const subscriptionData = {
      ccTokenUsed: ccToken || null,
      subscriptionId: paymentResult.rows[0].id,
      subscriptionStatus: 'trial',
      subscriptionType: subscriptionType,
      subscriptionTrialExpiryDate: trialExpiryDate.toISOString(),
      subscriptionExpiryDate: subscriptionExpiryDate.toISOString(),
      errorObj: null,
      autoRenewal: true,
      productId: productId,
      createdAt: now.toISOString(),
      licenseeNumber: licenseeNumber,
      licenseNumber: licenseNumber
    };

    // Check if user already has subscriptions
    const existingUserSub = await pool.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [currentUser.id]
    );

    if (existingUserSub.rows.length > 0) {
      // Update existing subscriptions
      const currentSubscriptions = existingUserSub.rows[0].subscriptions || [];
      currentSubscriptions.push(subscriptionData);
      
      await pool.query(
        'UPDATE user_subscriptions SET subscriptions = $1, licensee_number = $2, license_number = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
        [JSON.stringify(currentSubscriptions), licenseeNumber, licenseNumber, currentUser.id]
      );
    } else {
      // Create new user subscription record
      await pool.query(
        'INSERT INTO user_subscriptions (user_id, subscriptions, licensee_number, license_number) VALUES ($1, $2, $3, $4)',
        [currentUser.id, JSON.stringify([subscriptionData]), licenseeNumber, licenseNumber]
      );
    }

    res.json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        payment: paymentResult.rows[0],
        subscription: subscriptionData
      }
    });
  } catch (error) {
    console.error('Confirm subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm subscription'
    });
  }
};

export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const currentUser = req.user as any;
    console.log(`🔍 getUserSubscriptions called for user: ${currentUser.id} (${currentUser.email})`);
    
    const userSubResult = await pool.query(
      'SELECT subscriptions FROM user_subscriptions WHERE user_id = $1',
      [currentUser.id]
    );

    console.log(`📊 Found ${userSubResult.rows.length} subscription records for user ${currentUser.id}`);
    const subscriptions = userSubResult.rows.length > 0 ? userSubResult.rows[0].subscriptions : [];
    console.log(`📋 Returning subscriptions:`, subscriptions);

    res.json({
      success: true,
      data: {
        subscriptions: subscriptions
      }
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user subscriptions'
    });
  }
};