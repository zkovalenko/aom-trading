import { Request, Response } from 'express';
import pool from '../config/database';

interface LicenseValidationRequest {
  email: string;
  productNumber: string; // This should be the product template ID (e.g., E6RYSASXI)
  deviceId: string;
}

interface DeviceInfo {
  deviceId: string;
  lastSeen: string;
}

/**
 * Validate a software license using user_subscriptions table
 * POST /api/license/validate
 */
export const validateLicense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, productNumber, deviceId }: LicenseValidationRequest = req.body;

    // Validate required fields
    if (!email || !productNumber || !deviceId) {
      res.status(400).json({
        valid: false,
        message: 'Email, productNumber, and deviceId are required'
      });
      return;
    }

    // Find user with their subscription and get product info for template matching
    const userResult = await pool.query(
      `SELECT u.id, us.subscriptions, us.device_ids, us.max_devices
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
    const matchingSubscription = subscriptions.find(sub => 
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

    // Get current device list
    const deviceIds: DeviceInfo[] = user.device_ids || [];
    const maxDevices = user.max_devices || 2;

    // Check if device already exists
    const existingDeviceIndex = deviceIds.findIndex(device => device.deviceId === deviceId);

    if (existingDeviceIndex !== -1) {
      // Update last seen timestamp for existing device
      deviceIds[existingDeviceIndex].lastSeen = new Date().toISOString();
    } else {
      // Check device limit
      if (deviceIds.length >= maxDevices) {
        res.status(200).json({
          valid: false,
          message: `Maximum devices limit reached (${maxDevices} devices)`,
          isBasic: isBasic,
          isPremium: isPremium,
          expiresUtc: isInTrial ? trialExpiryDate.toISOString() : expiryDate.toISOString(),
          subscriptionStatus: currentStatus
        });
        return;
      }

      // Add new device
      deviceIds.push({
        deviceId: deviceId,
        lastSeen: new Date().toISOString()
      });
    }

    // Update device list in database
    await pool.query(
      'UPDATE user_subscriptions SET device_ids = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(deviceIds), user.id]
    );

    // Return successful validation
    res.status(200).json({
      valid: true,
      isBasic: isBasic,
      isPremium: isPremium,
      expiresUtc: isInTrial ? trialExpiryDate.toISOString() : expiryDate.toISOString(),
      subscriptionStatus: currentStatus,
      message: 'License valid',
      devicesUsed: deviceIds.length,
      maxDevices: maxDevices
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Release a device from a software license using user_subscriptions table
 * POST /api/license/releaseDevice
 */
export const releaseDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, productNumber, deviceId }: LicenseValidationRequest = req.body;

    // Validate required fields
    if (!email || !productNumber || !deviceId) {
      res.status(400).json({
        message: 'Email, productNumber, and deviceId are required',
        error: 'Missing required fields'
      });
      return;
    }

    // Find user with their subscription
    const userResult = await pool.query(
      `SELECT u.id, us.subscriptions, us.device_ids
       FROM users u
       LEFT JOIN user_subscriptions us ON u.id = us.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        message: 'User not found',
        error: 'User does not exist'
      });
      return;
    }

    const user = userResult.rows[0];
    
    if (!user.subscriptions) {
      res.status(404).json({
        message: 'No subscription found',
        error: 'User has no subscriptions'
      });
      return;
    }

    // Find matching subscription by license number (productNumber)
    const subscriptions = user.subscriptions || [];
    const matchingSubscription = subscriptions.find(sub => 
      sub.licenseNumber === productNumber
    );

    if (!matchingSubscription) {
      res.status(404).json({
        message: 'License not found',
        error: 'License does not exist for this user and product'
      });
      return;
    }

    const deviceIds: DeviceInfo[] = user.device_ids || [];

    // Find and remove the device
    const deviceIndex = deviceIds.findIndex(device => device.deviceId === deviceId);

    if (deviceIndex === -1) {
      res.status(404).json({
        message: 'Device not found',
        error: 'Device is not registered for this license'
      });
      return;
    }

    // Remove the device from the array
    deviceIds.splice(deviceIndex, 1);

    // Update device list in database
    await pool.query(
      'UPDATE user_subscriptions SET device_ids = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [JSON.stringify(deviceIds), user.id]
    );

    // Return success response
    res.status(200).json({
      message: 'OK',
      error: null
    });

  } catch (error) {
    console.error('Release device error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: 'Failed to release device'
    });
  }
};