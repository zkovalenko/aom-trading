import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

const ACTIVE_STATUSES = new Set(['active', 'trial']);

interface SubscriptionAccessResult {
  hasAnyActiveSubscription: boolean;
  hasBasicAccess: boolean;
  hasPremiumAccess: boolean;
}

const evaluateSubscriptionAccess = (subscriptions: any[]): SubscriptionAccessResult => {
  if (!Array.isArray(subscriptions)) {
    return {
      hasAnyActiveSubscription: false,
      hasBasicAccess: false,
      hasPremiumAccess: false
    };
  }

  const now = Date.now();
  let hasAnyActiveSubscription = false;
  let hasBasicAccess = false;
  let hasPremiumAccess = false;

  subscriptions.forEach((subscription) => {
    if (!subscription) {
      return;
    }

    const status = typeof subscription.subscriptionStatus === 'string'
      ? subscription.subscriptionStatus.toLowerCase()
      : '';

    if (!ACTIVE_STATUSES.has(status)) {
      return;
    }

    const expiryDate = subscription.subscriptionExpiryDate
      ? new Date(subscription.subscriptionExpiryDate).getTime()
      : null;
    const trialExpiryDate = subscription.subscriptionTrialExpiryDate
      ? new Date(subscription.subscriptionTrialExpiryDate).getTime()
      : null;

    let isCurrentlyActive = false;

    if (status === 'active') {
      isCurrentlyActive = !expiryDate || expiryDate >= now;
    } else if (status === 'trial') {
      isCurrentlyActive = !trialExpiryDate || trialExpiryDate >= now;
    }

    if (!isCurrentlyActive) {
      return;
    }

    hasAnyActiveSubscription = true;

    const productName = typeof subscription.productName === 'string'
      ? subscription.productName.toLowerCase()
      : '';
    const subscriptionType = typeof subscription.subscriptionType === 'string'
      ? subscription.subscriptionType.toLowerCase()
      : '';

    const isPremium = productName.includes('premium') || subscriptionType === 'premium';

    if (isPremium) {
      hasPremiumAccess = true;
      hasBasicAccess = true; // Premium plans can access basic meetings too
    } else {
      hasBasicAccess = true;
    }
  });

  return {
    hasAnyActiveSubscription,
    hasBasicAccess,
    hasPremiumAccess
  };
};

export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const result = await pool.query(
      'SELECT subscriptions, license_number, licensee_number FROM user_subscriptions WHERE user_id = $1',
      [(req.user as any)?.id]
    );

    if (result.rows.length === 0) {
      res.status(403).json({
        success: false,
        message: 'Subscription required'
      });
      return;
    }

    const record = result.rows[0];
    let subscriptions: any = record.subscriptions || [];

    if (typeof subscriptions === 'string') {
      try {
        subscriptions = JSON.parse(subscriptions);
      } catch (error) {
        console.warn('Failed to parse subscriptions JSON for user', (req.user as any)?.id, error);
        subscriptions = [];
      }
    }

    const subscriptionAccess = evaluateSubscriptionAccess(subscriptions);
    const hasLicense = Boolean(record.license_number || record.licensee_number);

    if (!subscriptionAccess.hasAnyActiveSubscription && !hasLicense) {
      res.status(403).json({
        success: false,
        message: 'Subscription required'
      });
      return;
    }

    (req as any).subscriptionAccess = {
      subscriptions: Array.isArray(subscriptions) ? subscriptions : [],
      hasAnyActiveSubscription: subscriptionAccess.hasAnyActiveSubscription || hasLicense,
      hasBasicAccess: subscriptionAccess.hasBasicAccess || hasLicense,
      hasPremiumAccess: subscriptionAccess.hasPremiumAccess || hasLicense
    };

    next();
  } catch (error) {
    console.error('Subscription check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription status'
    });
  }
};

export default requireActiveSubscription;
