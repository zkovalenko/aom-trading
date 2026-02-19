import Stripe from 'stripe';
import { loadEnvironmentVariables } from './env';

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe instance - lazy loaded to avoid build-time environment variable issues
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    // Load environment variables if not already loaded
    loadEnvironmentVariables();
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required but not found in environment variables');
    }
    
    console.log('🔐 Initializing Stripe with secret key...');
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-08-16',
      typescript: true,
      maxNetworkRetries: 2, // Limit network retries (default is 3)
      // Only retry on network errors, not on card errors
      // Card errors (4xx) will not be retried automatically
    });
  }
  
  return stripeInstance;
}

// Export default for backward compatibility, but this will be lazy-loaded
export default { get stripe() { return getStripe(); } };