import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function listUserSubscriptions() {
  try {
    // Get subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      limit: 10
    });

    console.log('\n📋 All Stripe Subscriptions:');
    subscriptions.data.forEach((sub: any) => {
      const productName = sub.items.data[0]?.price?.product?.name || 'Unknown';
      console.log(`\n  ID: ${sub.id}`);
      console.log(`  Product: ${productName}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Customer: ${sub.customer}`);
      console.log(`  Created: ${new Date(sub.created * 1000).toISOString()}`);
      console.log(`  Current period: ${new Date(sub.current_period_start * 1000).toISOString()} to ${new Date(sub.current_period_end * 1000).toISOString()}`);
      console.log(`  Cancel at period end: ${sub.cancel_at_period_end}`);
    });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

listUserSubscriptions();
