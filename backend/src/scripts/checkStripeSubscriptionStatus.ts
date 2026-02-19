import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function checkSubscriptionStatus() {
  try {
    const subIds = [
      'sub_1T2edoEhB3qBcR2wULDLslRr', // Basic monthly (should be canceled)
      'sub_1T2eeoEhB3qBcR2w8Yy51yio', // Premium annual (should be active)
    ];

    for (const subId of subIds) {
      try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`Subscription: ${subId}`);
        console.log('='.repeat(80));

        const sub = await stripe.subscriptions.retrieve(subId);
        const product = await stripe.products.retrieve(sub.items.data[0].price.product as string);

        console.log(`Product: ${product.name}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Trial End: ${sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : 'N/A'}`);
        console.log(`Current Period: ${new Date(sub.current_period_start * 1000).toISOString()} to ${new Date(sub.current_period_end * 1000).toISOString()}`);
        console.log(`Canceled At: ${sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : 'Not canceled'}`);

      } catch (error: any) {
        console.log(`❌ Error fetching ${subId}: ${error.message}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkSubscriptionStatus();
