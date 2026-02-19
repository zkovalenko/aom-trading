import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function cancelTrialingPremium() {
  try {
    const trialingSubId = 'sub_1T2eeEEhB3qBcR2w4R0jzcr7';

    console.log(`\n❌ Canceling trialing Premium subscription: ${trialingSubId}`);

    const canceledSub = await stripe.subscriptions.cancel(trialingSubId);

    console.log(`\n✅ Subscription canceled successfully!`);
    console.log(`  Status: ${canceledSub.status}`);
    console.log(`  Canceled at: ${new Date(canceledSub.canceled_at! * 1000).toISOString()}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

cancelTrialingPremium();
