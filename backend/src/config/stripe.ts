import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
// In production, Render provides env vars directly
// In development, load from .env.development
if (process.env.NODE_ENV !== 'production') {
  const env = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${env}` });
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
  typescript: true,
});

export default stripe;