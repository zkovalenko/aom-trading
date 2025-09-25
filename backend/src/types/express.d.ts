import { User as UserType } from '../controllers/authController';

declare global {
  namespace Express {
    interface SubscriptionAccess {
      subscriptions: any[];
      hasAnyActiveSubscription: boolean;
      hasBasicAccess: boolean;
      hasPremiumAccess: boolean;
    }

    interface User {
      id: string;
      email: string;
      name: string;
      google_id?: string;
      created_at: Date;
      updated_at: Date;
    }

    interface Request {
      user?: User;
      subscriptionAccess?: SubscriptionAccess;
    }
  }
}

export {};
