import { Request, Response } from 'express';
import pool from '../config/database';

interface LicenseValidationRequest {
  email: string;
  productNumber: string; // This should be the product template ID (e.g., E6RYSASXI)
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validateLicenseRequestBody = (body: Partial<LicenseValidationRequest>): ValidationResult => {
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email) {
    return {
      valid: false,
      message: 'Email is required'
    };
  }

  const productNumber = typeof body.productNumber === 'string' ? body.productNumber.trim() : '';
  if (!productNumber) {
    return {
      valid: false,
      message: 'Product number is required'
    };
  }

  return {
    valid: true
  };
};

/**
 * Validate a software license using user_subscriptions table
 * POST /api/license/validate
 */
export const validateLicense = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateLicenseRequestBody(req.body);

    if (!validation.valid) {
      res.status(400).json({
        valid: false,
        message: validation.message || 'Invalid request payload'
      });
      return;
    }

    const email = (req.body.email as string).trim();
    const productNumber = (req.body.productNumber as string).trim();

    // Find user with their subscription and get product info for template matching
    const userResult = await pool.query(
      `SELECT u.id, us.subscriptions
       FROM users u
       LEFT JOIN user_subscriptions us ON u.id = us.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        valid: false,
        message: 'User not found'
      });
      return;
    }

    const user = userResult.rows[0];
    
    if (!user.subscriptions || user.subscriptions.length === 0) {
      res.status(404).json({
        valid: false,
        message: 'No active subscription found'
      });
      return;
    }

    // Get product template mapping to find which product this template belongs to
    const productResult = await pool.query(
      `SELECT id, name, product_license_template 
       FROM products 
       WHERE is_active = true AND (
         product_license_template->>'monthly' = $1 OR 
         product_license_template->>'annual' = $1
       )`,
      [productNumber]
    );

    if (productResult.rows.length === 0) {
      res.status(404).json({
        valid: false,
        message: 'Invalid product template'
      });
      return;
    }

    const product = productResult.rows[0];
    console.log(`🔍 Validating license for product: ${product.name}, template: ${productNumber}`);

    // Find matching subscription for this product
    const subscriptions = user.subscriptions || [];
    const matchingSubscription = subscriptions.find((sub: any) =>
      sub.productId === product.id
    );

    if (!matchingSubscription) {
      res.status(404).json({
        valid: false,
        message: 'No subscription found for this product'
      });
      return;
    }

    // Check if subscription has expired
    const now = new Date();
    const expiryDate = new Date(matchingSubscription.subscriptionExpiryDate);
    const trialExpiryDate = new Date(matchingSubscription.subscriptionTrialExpiryDate);
    
    // Determine subscription type for proper response
    const isPremium = product.name.toLowerCase().includes('premium') || 
                      matchingSubscription.subscriptionType === 'premium';
    const isBasic = !isPremium;
    
    // Check if both trial and subscription have expired
    const isTrialExpired = now > trialExpiryDate;
    const isSubscriptionExpired = now > expiryDate;
    
    if (isTrialExpired && isSubscriptionExpired) {
      res.status(200).json({
        valid: false,
        message: 'License has expired',
        isBasic: isBasic,
        isPremium: isPremium,
        expiresUtc: Math.max(trialExpiryDate.getTime(), expiryDate.getTime()) > trialExpiryDate.getTime() ? 
                   expiryDate.toISOString() : trialExpiryDate.toISOString(),
        subscriptionStatus: 'expired'
      });
      return;
    }
    
    // Determine current status (trial or active subscription)
    const isInTrial = !isTrialExpired && matchingSubscription.subscriptionStatus === 'trial';
    const currentStatus = isInTrial ? 'trial' : 'active';

    // Return successful validation
    res.status(200).json({
      valid: true,
      isBasic: isBasic,
      isPremium: isPremium,
      expiresUtc: isInTrial ? trialExpiryDate.toISOString() : expiryDate.toISOString(),
      subscriptionStatus: currentStatus,
      message: 'License valid',
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error'
    });
  }
};

export const releaseDevice = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Device tracking is currently disabled; no action required.'
  });
};
