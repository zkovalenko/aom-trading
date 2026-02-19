import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function getSubscriptionDetails() {
  try {
    const subIds = [
      'sub_1T2eeoEhB3qBcR2w8Yy51yio', // Premium annual
      'sub_1T2eeEEhB3qBcR2w4R0jzcr7', // Trialing
    ];

    for (const subId of subIds) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Subscription: ${subId}`);
      console.log('='.repeat(60));

      const sub = await stripe.subscriptions.retrieve(subId);
      const product = await stripe.products.retrieve(sub.items.data[0].price.product as string);

      console.log(`Status: ${sub.status}`);
      console.log(`Product Name: ${product.name}`);
      console.log(`Product ID: ${product.id}`);
      console.log(`Price: $${sub.items.data[0].price.unit_amount! / 100}`);
      console.log(`Interval: ${sub.items.data[0].price.recurring?.interval}`);
      console.log(`Customer: ${sub.customer}`);
      console.log(`Created: ${new Date(sub.created * 1000).toISOString()}`);
      console.log(`Current period: ${new Date(sub.current_period_start * 1000).toISOString()} to ${new Date(sub.current_period_end * 1000).toISOString()}`);

      if (sub.status === 'trialing') {
        console.log(`Trial end: ${new Date(sub.trial_end! * 1000).toISOString()}`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

getSubscriptionDetails();
