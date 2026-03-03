import { Request, Response } from 'express';
import { getStripe } from '../config/stripe';
import pool from '../config/database';
import netLicensingService from '../services/netLicensingService';
import { sendSubscriptionEmail, sendSubscriptionUpgradeEmail, sendSubscriptionCancellationEmail } from '../services/mailgunService';

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
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    } catch (attachError: any) {
      console.error('❌ Failed to attach payment method:', attachError);

      // Handle card errors during payment method attachment
      if (attachError.type === 'StripeCardError') {
        const declineCode = attachError.decline_code;
        let userMessage = attachError.message || 'Payment method validation failed';

        if (declineCode === 'invalid_cvc' || declineCode === 'incorrect_cvc') {
          userMessage = 'The card verification code (CVC) is invalid. Please check your card and try again.';
        } else if (declineCode === 'expired_card') {
          userMessage = 'Your card has expired. Please use a different payment method.';
        } else if (declineCode === 'card_declined') {
          userMessage = 'Your card was declined. Please contact your bank or use a different payment method.';
        }

        res.status(402).json({
          success: false,
          message: userMessage,
          declineCode: declineCode
        });
        return;
      }

      throw attachError; // Re-throw if not a card error
    }

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

    // Check if user has had a previous trial for this product
    const existingUserSubs = await pool.query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [currentUser.id]
    );

    let hasHadPreviousTrial = false;
    let isUpgradingFromBasic = false;
    let activeBasicSubscription: any = null;

    if (existingUserSubs.rows.length > 0) {
      const subscriptions = existingUserSubs.rows[0].subscriptions || [];

      // Check if user has had previous trial for THIS product
      hasHadPreviousTrial = subscriptions.some((sub: any) =>
        sub.productId === productId &&
        (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'cancelled' || sub.subscriptionStatus === 'expired')
      );

      // Check if user is upgrading from Basic (trial or active) to Premium
      const isPremiumProduct = product.name?.toLowerCase().includes('premium') ||
                              product.product_template_id === 'premium-trading-plan';

      if (isPremiumProduct) {
        activeBasicSubscription = subscriptions.find((sub: any) => {
          const isBasic = sub.productName?.toLowerCase().includes('basic') ||
                         (sub.product?.product_template_id === 'basic-trading-plan');
          const isActiveOrTrial = sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial';
          return isBasic && isActiveOrTrial;
        });

        if (activeBasicSubscription) {
          isUpgradingFromBasic = true;
          console.log(`🔄 User is upgrading from Basic (${activeBasicSubscription.subscriptionStatus}) to Premium`);
          console.log(`📋 Existing Basic subscription:`, activeBasicSubscription.stripeSubscriptionId);
        }
      }
    }

    console.log(`🔍 User has had previous trial for this product: ${hasHadPreviousTrial}`);
    console.log(`🔍 Is upgrading from Basic: ${isUpgradingFromBasic}`);

    // Track if we're doing an upgrade (will update existing subscription instead of creating new)
    let isSubscriptionUpgrade = false;
    let existingStripeSubscriptionId: string | null = null;

    if (isUpgradingFromBasic && activeBasicSubscription?.stripeSubscriptionId) {
      isSubscriptionUpgrade = true;
      existingStripeSubscriptionId = activeBasicSubscription.stripeSubscriptionId;
      console.log(`🔄 Will upgrade existing subscription: ${existingStripeSubscriptionId}`);
      console.log(`📊 Stripe will calculate prorated charges automatically`);
    }

    // Calculate subscription dates
    const now = new Date();

    // Only give trial to first-time customers
    // Premium upgrades from Basic do NOT get a trial
    let shouldGiveTrial = !hasHadPreviousTrial && !isUpgradingFromBasic;
    let trialMonths = shouldGiveTrial ? 3 : 0;
    const trialExpiryDate = new Date();
    if (shouldGiveTrial) {
      trialExpiryDate.setMonth(trialExpiryDate.getMonth() + trialMonths);
    }

    if (shouldGiveTrial) {
      console.log(`🎁 Setting up ${trialMonths}-month free trial for ${subscriptionType} subscription`);
      console.log(`📅 Trial expires: ${trialExpiryDate.toISOString()}`);
    } else if (isUpgradingFromBasic) {
      console.log(`💳 Premium upgrade - no trial, immediate payment (upgrading from Basic)`);
    } else {
      console.log(`💳 No trial - immediate payment required (user had previous trial)`);
    }

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

    // Create or update Stripe subscription
    let subscription: any;

    try {
      if (isSubscriptionUpgrade && existingStripeSubscriptionId) {
        // Upgrade existing subscription
        console.log(`🔄 Upgrading existing subscription to Premium with proration`);

        // Get the existing subscription to find the item ID
        const existingSub = await stripe.subscriptions.retrieve(existingStripeSubscriptionId);
        const existingItemId = existingSub.items.data[0].id;

        subscription = await stripe.subscriptions.update(existingStripeSubscriptionId, {
          items: [{
            id: existingItemId,
            price: price.id
          }],
          proration_behavior: 'always_invoice', // Charge prorated amount immediately
          billing_cycle_anchor: 'unchanged', // Keep current billing cycle
          metadata: {
            userId: currentUser.id.toString(),
            productId: productId,
            subscriptionType: subscriptionType,
            isUpgrade: 'true',
            upgradedFrom: 'basic'
          },
          trial_end: 'now' // End trial immediately when upgrading
        });

        console.log(`✅ Upgraded Stripe subscription immediately: ${subscription.id}`);
        console.log(`📋 Subscription status: ${subscription.status}`);
        console.log(`💰 Prorated charge invoiced and charged immediately (mid-cycle upgrade)`);
      } else {
        // Create new subscription
        const subscriptionParams: any = {
          customer: customerId,
          items: [{
            price: price.id
          }],
          metadata: {
            userId: currentUser.id.toString(),
            productId: productId,
            subscriptionType: subscriptionType,
            isRenewal: hasHadPreviousTrial ? 'true' : 'false'
          }
        };

        // Only add trial_end if user gets a trial
        if (shouldGiveTrial) {
          const trialEndTimestamp = Math.floor(trialExpiryDate.getTime() / 1000);
          subscriptionParams.trial_end = trialEndTimestamp;
          console.log(`🔄 Creating Stripe subscription with trial end: ${trialEndTimestamp}`);
        } else {
          console.log(`🔄 Creating Stripe subscription with immediate billing (no trial)`);
        }

        subscription = await stripe.subscriptions.create(subscriptionParams);

        console.log(`✅ Created Stripe subscription: ${subscription.id}`);
        console.log(`📋 Subscription status: ${subscription.status}`);
      }
    } catch (subscriptionError: any) {
      console.error('❌ Failed to create/update subscription:', subscriptionError);

      // Handle card errors during subscription creation/update
      if (subscriptionError.type === 'StripeCardError') {
        const declineCode = subscriptionError.decline_code;
        let userMessage = subscriptionError.message || 'Payment failed';

        if (declineCode === 'invalid_cvc' || declineCode === 'incorrect_cvc') {
          userMessage = 'The card verification code (CVC) is invalid. Please check your card and try again.';
        } else if (declineCode === 'expired_card') {
          userMessage = 'Your card has expired. Please use a different payment method.';
        } else if (declineCode === 'insufficient_funds') {
          userMessage = 'Your card has insufficient funds. Please use a different payment method.';
        } else if (declineCode === 'card_declined') {
          userMessage = 'Your card was declined. Please contact your bank or use a different payment method.';
        }

        res.status(402).json({
          success: false,
          message: userMessage,
          declineCode: declineCode
        });
        return;
      }

      // Re-throw other errors to be caught by outer catch
      throw subscriptionError;
    }

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

    // Record initial subscription setup
    const paymentStatus = shouldGiveTrial ? 'trial' : 'active';
    const paymentResult = await pool.query(
      'INSERT INTO payments (user_id, product_id, stripe_payment_id, stripe_payment_intent_id, amount, currency, status, product_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
      [currentUser.id, productId, subscription.id, subscription.id, amount, 'usd', paymentStatus, 'subscription']
    );

    // Create or update user subscription
    if (shouldGiveTrial) {
      console.log(`🎁 Creating subscription with 3-month FREE trial for user ${currentUser.email}`);
      console.log(`📅 Free trial period: ${now.toISOString()} to ${trialExpiryDate.toISOString()}`);
    } else if (isUpgradingFromBasic) {
      console.log(`⚡ IMMEDIATE UPGRADE: Premium subscription activated for user ${currentUser.email}`);
      console.log(`💳 Prorated charge applied immediately (mid-cycle upgrade from Basic trial)`);
      console.log(`📅 Active until: ${subscriptionExpiryDate.toISOString()}`);
    } else {
      console.log(`💳 Creating active subscription for user ${currentUser.email} (renewal - no trial)`);
      console.log(`📅 Active until: ${subscriptionExpiryDate.toISOString()}`);
    }

    const subscriptionData = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: price.id,
      subscriptionId: paymentResult.rows[0].id,
      subscriptionStatus: shouldGiveTrial ? 'trial' : 'active',
      subscriptionType: subscriptionType,
      subscriptionTrialExpiryDate: shouldGiveTrial ? trialExpiryDate.toISOString() : null,
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
      // Check if user has an existing subscription for this product
      const currentSubscriptions = existingUserSub.rows[0].subscriptions || [];
      const existingSubIndex = currentSubscriptions.findIndex((sub: any) => sub.productId === productId);

      // If upgrading from Basic trial, mark the Basic trial as cancelled
      if (isUpgradingFromBasic && activeBasicSubscription) {
        console.log('🔄 Marking Basic trial subscription as cancelled in database');
        const basicTrialIndex = currentSubscriptions.findIndex((sub: any) =>
          sub.subscriptionId === activeBasicSubscription.subscriptionId ||
          sub.stripeSubscriptionId === activeBasicSubscription.stripeSubscriptionId
        );

        if (basicTrialIndex !== -1) {
          currentSubscriptions[basicTrialIndex] = {
            ...currentSubscriptions[basicTrialIndex],
            subscriptionStatus: 'cancelled',
            autoRenewal: false,
            cancelledAt: new Date().toISOString(),
            upgradeReason: 'Upgraded to Premium'
          };
          console.log('✅ Basic trial marked as cancelled');
        }
      }

      if (existingSubIndex !== -1) {
        // Update existing subscription (renewal/reactivation)
        console.log('🔄 Renewing existing subscription for product:', productId);
        currentSubscriptions[existingSubIndex] = subscriptionData;
      } else {
        // Add new subscription for different product
        console.log('➕ Adding new subscription for product:', productId);
        currentSubscriptions.push(subscriptionData);
      }

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

    // Prepare response message based on subscription type
    let responseMessage = 'Subscription created successfully';
    if (shouldGiveTrial) {
      responseMessage = 'Subscription created successfully with 3-month FREE trial';
    } else if (isUpgradingFromBasic) {
      responseMessage = 'Successfully upgraded to Premium! Your Basic trial has been cancelled and Premium subscription is now active.';
    } else {
      responseMessage = 'Subscription activated successfully';
    }

    const responseData: any = {
      payment: paymentResult.rows[0],
      subscription: subscriptionData,
      stripe: {
        customerId: customerId,
        subscriptionId: subscription.id,
        priceId: price.id,
        status: subscription.status
      }
    };

    // Only include trial info if trial was given
    if (shouldGiveTrial && subscription.trial_end) {
      responseData.stripe.trialEnd = new Date(subscription.trial_end * 1000).toISOString();
      responseData.trial = {
        isActive: true,
        endsAt: trialExpiryDate.toISOString(),
        daysRemaining: Math.ceil((trialExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      };
    }

    // Include upgrade info if applicable
    if (isUpgradingFromBasic) {
      responseData.upgrade = {
        fromProduct: 'Basic Trading Plan',
        toProduct: product.name,
        previousSubscription: activeBasicSubscription.subscriptionId
      };
    }

    res.json({
      success: true,
      message: responseMessage,
      data: responseData
    });

    // Send appropriate email notification
    if (isUpgradingFromBasic) {
      // Send upgrade email for Premium upgrades
      sendSubscriptionUpgradeEmail({
        email: currentUser.email,
        firstName: currentUser.first_name || currentUser.firstName || currentUser.email,
        subscriptionType: subscriptionType as 'monthly' | 'annual',
        billingAmount: amount,
        upgradeDate: new Date().toISOString(),
        billingNote: 'Your billing has been prorated, and your new billing cycle has been adjusted accordingly.',
      }).catch((emailErr) => {
        console.error('✉️  Failed to send upgrade email:', emailErr);
      });
    } else if (shouldGiveTrial) {
      // Send regular subscription email for new subscriptions with trial
      sendSubscriptionEmail({
        email: currentUser.email,
        firstName: currentUser.first_name || currentUser.firstName || currentUser.email,
        tier: product.name.toLowerCase().includes('premium') ? 'premium' : 'basic',
        subscriptionType: subscriptionType as 'monthly' | 'annual',
        billingAmount: amount,
        trialEndsAt: trialExpiryDate.toISOString()
      }).catch((emailErr) => {
        console.error('✉️  Failed to send subscription email:', emailErr);
      });
    }
  } catch (error: any) {
    console.error('Confirm subscription error:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      const declineCode = error.decline_code;
      const message = error.message || 'Payment failed';

      let userMessage = message;

      // Provide user-friendly messages for common decline codes
      if (declineCode === 'invalid_cvc' || declineCode === 'incorrect_cvc') {
        userMessage = 'The card verification code (CVC) is invalid. Please check your card and try again.';
      } else if (declineCode === 'expired_card') {
        userMessage = 'Your card has expired. Please use a different payment method.';
      } else if (declineCode === 'insufficient_funds') {
        userMessage = 'Your card has insufficient funds. Please use a different payment method.';
      } else if (declineCode === 'card_declined') {
        userMessage = 'Your card was declined. Please contact your bank or use a different payment method.';
      }

      res.status(402).json({
        success: false,
        message: userMessage,
        declineCode: declineCode
      });
      return;
    }

    // Handle other Stripe errors
    if (error.type?.startsWith('Stripe')) {
      res.status(400).json({
        success: false,
        message: error.message || 'Payment processing failed. Please try again.'
      });
      return;
    }

    // Generic error
    res.status(500).json({
      success: false,
      message: 'Failed to confirm subscription. Please try again or contact support.'
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
    let cancelAtPeriodEnd = false;
    let periodEnd: Date | null = null;

    if (subscriptionToCancel.stripeSubscriptionId) {
      console.log(`🗑️ Scheduling Stripe subscription cancellation at period end: ${subscriptionToCancel.stripeSubscriptionId}`);

      try {
        // Update subscription to cancel at the end of the billing period
        const stripeSubscription = await stripe.subscriptions.update(
          subscriptionToCancel.stripeSubscriptionId,
          {
            cancel_at_period_end: true
          }
        );

        cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        periodEnd = new Date(stripeSubscription.current_period_end * 1000);

        console.log(`✅ Stripe subscription will cancel at period end: ${periodEnd.toISOString()}`);
        console.log(`📋 Current status: ${stripeSubscription.status}, cancel_at_period_end: ${cancelAtPeriodEnd}`);
      } catch (stripeError) {
        console.error('❌ Failed to update Stripe subscription:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }

    // Update subscription status in database
    // Keep status as active/trial but mark for cancellation
    const updatedSubscriptions = subscriptions.map((sub: any) => {
      if (sub.subscriptionId === subscriptionId || sub.stripeSubscriptionId === subscriptionId) {
        return {
          ...sub,
          autoRenewal: false,
          cancelAtPeriodEnd: true,
          cancelledAt: new Date().toISOString(),
          periodEndDate: periodEnd ? periodEnd.toISOString() : sub.subscriptionExpiryDate
        };
      }
      return sub;
    });

    await pool.query(
      'UPDATE user_subscriptions SET subscriptions = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(updatedSubscriptions), currentUser.id]
    );

    console.log(`✅ Subscription will cancel at period end for user ${currentUser.email}`);

    const cancelledSubscription = updatedSubscriptions.find((sub: any) =>
      sub.subscriptionId === subscriptionId || sub.stripeSubscriptionId === subscriptionId
    );

    res.json({
      success: true,
      message: periodEnd
        ? `Subscription will remain active until ${periodEnd.toLocaleDateString()}`
        : 'Subscription cancellation scheduled',
      data: {
        cancelledSubscription: cancelledSubscription,
        remainsActiveUntil: periodEnd ? periodEnd.toISOString() : null
      }
    });

    // Get billing amount from Stripe subscription
    let billingAmount = 0;
    if (subscriptionToCancel.stripeSubscriptionId) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionToCancel.stripeSubscriptionId);
        billingAmount = stripeSubscription.items.data[0]?.price.unit_amount || 0;
      } catch (error) {
        console.error('Failed to get billing amount from Stripe:', error);
      }
    }

    sendSubscriptionCancellationEmail({
      email: currentUser.email,
      firstName: currentUser.first_name || currentUser.firstName || currentUser.email,
      tier: subscriptionToCancel.productName?.toLowerCase().includes('premium') ? 'premium' : 'basic',
      subscriptionType: subscriptionToCancel.subscriptionType || 'monthly',
      billingAmount: billingAmount,
      cancelledAt: new Date().toISOString(),
    }).catch((emailErr) => {
      console.error('✉️  Failed to send cancellation email:', emailErr);
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
};
