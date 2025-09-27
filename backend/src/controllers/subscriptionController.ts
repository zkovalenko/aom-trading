import { Request, Response } from 'express';
import { getStripe } from '../config/stripe';
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

    // Create or get Stripe customer
    const stripe = getStripe();

    let customer;
    try {
      // First try to find existing customer
      const customers = await stripe.customers.list({
        email: currentUser.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log(`✅ Found existing Stripe customer: ${customer.id}`);
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: currentUser.email,
          name: currentUser.name || currentUser.email,
          metadata: {
            userId: currentUser.id.toString()
          }
        });
        console.log(`✅ Created new Stripe customer: ${customer.id}`);
      }
    } catch (error) {
      console.error('❌ Failed to create/find Stripe customer:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set up customer account'
      });
      return;
    }

    // Calculate trial end date (3 months from now)
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);
    const trialEndTimestamp = Math.floor(trialEndDate.getTime() / 1000);

    console.log(`🎁 Setting up 3-month free trial until: ${trialEndDate.toISOString()}`);

    res.json({
      success: true,
      data: {
        customerId: customer.id,
        amount: amount,
        currency: 'usd',
        productName: product.name,
        subscriptionType: subscriptionType,
        trialEnd: trialEndTimestamp,
        trialEndDate: trialEndDate.toISOString()
      }
    });
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

    const { customerId, productId, subscriptionType, paymentMethodId } = req.body;
    const currentUser = req.user as any;

    if (!customerId || !productId || !subscriptionType || !paymentMethodId) {
      res.status(400).json({
        success: false,
        message: 'Customer ID, product ID, subscription type, and payment method are required'
      });
      return;
    }

    const stripe = getStripe();

    // Attach payment method to customer
    console.log(`💳 Attaching payment method ${paymentMethodId} to customer ${customerId}`);
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

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

    // For monthly subscriptions: 3 months free trial
    // For annual subscriptions: 3 months free trial
    let trialMonths = 3;
    const trialExpiryDate = new Date();
    trialExpiryDate.setMonth(trialExpiryDate.getMonth() + trialMonths);

    console.log(`🎁 Setting up ${trialMonths}-month free trial for ${subscriptionType} subscription`);
    console.log(`📅 Trial expires: ${trialExpiryDate.toISOString()}`);

    // Create Stripe Price for the subscription
    const amount = product.subscription_types[subscriptionType];
    const interval = subscriptionType === 'monthly' ? 'month' : 'year';

    console.log(`💰 Creating Stripe price: $${amount/100} per ${interval}`);

    const price = await stripe.prices.create({
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: interval
      },
      product_data: {
        name: `${product.name} (${subscriptionType})`
      }
    });

    // Create Stripe subscription with 3-month trial
    const trialEndTimestamp = Math.floor(trialExpiryDate.getTime() / 1000);

    console.log(`🔄 Creating Stripe subscription with trial end: ${trialEndTimestamp}`);

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price: price.id
      }],
      trial_end: trialEndTimestamp,
      metadata: {
        userId: currentUser.id.toString(),
        productId: productId,
        subscriptionType: subscriptionType
      }
    });

    console.log(`✅ Created Stripe subscription: ${subscription.id}`);
    console.log(`📋 Subscription status: ${subscription.status}`);

    // Set actual subscription expiry after trial
    let subscriptionExpiryDate = new Date(trialExpiryDate);
    if (subscriptionType === 'monthly') {
      subscriptionExpiryDate.setMonth(subscriptionExpiryDate.getMonth() + 1);
    } else {
      subscriptionExpiryDate.setFullYear(subscriptionExpiryDate.getFullYear() + 1);
    }

    // Generate license if product has license template
    let licenseeNumber: string | null = null;
    let licenseNumber: string | null = null;
    
    console.log('🔍 Product license template:', product.product_license_template);
    console.log('🔍 Subscription type:', subscriptionType);
    
    if (product.product_license_template) {
      try {
        // Get the correct license template based on subscription type
        const licenseTemplateNumber = product.product_license_template[subscriptionType];
        console.log('🔍 License template number:', licenseTemplateNumber);
        
        if (!licenseTemplateNumber) {
          throw new Error(`No license template found for ${subscriptionType} subscription type. Available templates: ${JSON.stringify(product.product_license_template)}`);
        }
        
        console.log(`🎫 Generating license for user ${currentUser.email} with template ${licenseTemplateNumber} (${subscriptionType})`);
        const licenseData = await netLicensingService.generateUserLicense(
          currentUser.email,
          licenseTemplateNumber
        );
        console.log("✅ License data received:", licenseData);
        
        licenseeNumber = licenseData.licenseeNumber;
        licenseNumber = licenseData.licenseNumber;
        
        console.log(`✅ License generated successfully: Licensee=${licenseeNumber}, License=${licenseNumber}`);
      } catch (error) {
        console.error('❌ Failed to generate license:', error);
        console.error('❌ License generation error stack:', (error as Error).stack);
        // Continue with subscription creation even if license generation fails
        // This ensures payment processing isn't blocked by licensing issues
      }
    } else {
      console.log('⚠️  No license template configured for this product');
    }

    // Record initial subscription setup (no payment yet during trial)
    const paymentResult = await pool.query(
      'INSERT INTO payments (user_id, product_id, stripe_payment_id, stripe_payment_intent_id, amount, currency, status, product_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
      [currentUser.id, productId, subscription.id, subscription.id, amount, 'usd', 'trial', 'subscription']
    );

    // Create or update user subscription with 3-month free trial
    console.log(`🎁 Creating subscription with 3-month FREE trial for user ${currentUser.email}`);
    console.log(`📅 Free trial period: ${now.toISOString()} to ${trialExpiryDate.toISOString()}`);

    const subscriptionData = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: price.id,
      subscriptionId: paymentResult.rows[0].id,
      subscriptionStatus: 'trial', // User starts with FREE 3-month trial
      subscriptionType: subscriptionType,
      subscriptionTrialExpiryDate: trialExpiryDate.toISOString(),
      subscriptionExpiryDate: subscriptionExpiryDate.toISOString(),
      errorObj: null,
      autoRenewal: true,
      productId: productId,
      productName: product.name,
      createdAt: now.toISOString(),
      licenseeNumber: licenseeNumber,
      licenseNumber: licenseNumber
    };
    
    console.log('📝 Subscription data to store:', subscriptionData);

    // Check if user already has subscriptions
    const existingUserSub = await pool.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [currentUser.id]
    );
    
    console.log(`🔍 Existing user subscriptions found: ${existingUserSub.rows.length}`);

    if (existingUserSub.rows.length > 0) {
      // Update existing subscriptions
      const currentSubscriptions = existingUserSub.rows[0].subscriptions || [];
      currentSubscriptions.push(subscriptionData);
      
      console.log('📝 Updating existing user subscriptions record');
      console.log('📝 Total subscriptions after update:', currentSubscriptions.length);
      
      await pool.query(
        'UPDATE user_subscriptions SET subscriptions = $1, licensee_number = $2, license_number = $3, updated_at = CURRENT_TIMESTAMP WHERE user_id = $4',
        [JSON.stringify(currentSubscriptions), licenseeNumber, licenseNumber, currentUser.id]
      );
      
      console.log('✅ Successfully updated user subscriptions record');
    } else {
      // Create new user subscription record
      console.log('📝 Creating new user subscriptions record');
      
      await pool.query(
        'INSERT INTO user_subscriptions (user_id, subscriptions, licensee_number, license_number) VALUES ($1, $2, $3, $4)',
        [currentUser.id, JSON.stringify([subscriptionData]), licenseeNumber, licenseNumber]
      );
      
      console.log('✅ Successfully created new user subscriptions record');
    }
    
    // Verify the data was stored correctly
    const verifyResult = await pool.query(
      'SELECT licensee_number, license_number, subscriptions FROM user_subscriptions WHERE user_id = $1',
      [currentUser.id]
    );
    
    if (verifyResult.rows.length > 0) {
      const stored = verifyResult.rows[0];
      console.log('🔍 Verification - Stored data:');
      console.log('   Licensee Number:', stored.licensee_number);
      console.log('   License Number:', stored.license_number);
      console.log('   Subscriptions count:', stored.subscriptions?.length || 0);
      console.log('   Latest subscription license:', stored.subscriptions?.[stored.subscriptions.length - 1]?.licenseNumber);
    } else {
      console.error('❌ Verification failed - no user subscription record found after creation/update');
    }

    res.json({
      success: true,
      message: 'Subscription created successfully with 3-month FREE trial',
      data: {
        payment: paymentResult.rows[0],
        subscription: subscriptionData,
        stripe: {
          customerId: customerId,
          subscriptionId: subscription.id,
          priceId: price.id,
          status: subscription.status,
          trialEnd: new Date(subscription.trial_end! * 1000).toISOString()
        },
        trial: {
          isActive: true,
          endsAt: trialExpiryDate.toISOString(),
          daysRemaining: Math.ceil((trialExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }
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

export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { subscriptionId } = req.body;
    const currentUser = req.user as any;

    if (!subscriptionId) {
      res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
      return;
    }

    // Get user's current subscriptions
    const userSubResult = await pool.query(
      'SELECT subscriptions FROM user_subscriptions WHERE user_id = $1',
      [currentUser.id]
    );

    
    console.log(`✅ Current subscriptions: ${userSubResult}`);
    if (userSubResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No subscriptions found for this user'
      });
      return;
    }

    const subscriptions = userSubResult.rows[0].subscriptions || [];
    const subscriptionToCancel = subscriptions.find((sub: any) =>
      sub.subscriptionId === subscriptionId || sub.stripeSubscriptionId === subscriptionId
    );

    console.log(`✅ Subscription to cancel: ${subscriptionToCancel}`);

    if (!subscriptionToCancel) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }

    // Cancel the subscription in Stripe if it has a Stripe subscription ID
    const stripe = getStripe();
    if (subscriptionToCancel.stripeSubscriptionId) {
      console.log(`🗑️ Cancelling Stripe subscription: ${subscriptionToCancel.stripeSubscriptionId}`);

      try {
        const stripeSubscription = await stripe.subscriptions.cancel(subscriptionToCancel.stripeSubscriptionId);
        console.log(`✅ Stripe subscription cancelled: ${stripeSubscription.id}, status: ${stripeSubscription.status}`);
      } catch (stripeError) {
        console.error('❌ Failed to cancel Stripe subscription:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Update subscription status in database
    const updatedSubscriptions = subscriptions.map((sub: any) => {
      if (sub.subscriptionId === subscriptionId || sub.stripeSubscriptionId === subscriptionId) {
        return {
          ...sub,
          subscriptionStatus: 'cancelled',
          autoRenewal: false,
          cancelledAt: new Date().toISOString()
        };
      }
      return sub;
    });

    await pool.query(
      'UPDATE user_subscriptions SET subscriptions = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(updatedSubscriptions), currentUser.id]
    );

    console.log(`✅ Subscription cancelled successfully for user ${currentUser.email}`);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        cancelledSubscription: {
          ...subscriptionToCancel,
          subscriptionStatus: 'cancelled',
          autoRenewal: false,
          cancelledAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};