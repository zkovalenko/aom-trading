import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function cancelDuplicateBasicSubscription() {
  try {
    // The old Basic monthly subscription that should have been upgraded
    const oldBasicSubId = 'sub_1T2edoEhB3qBcR2wULDLslRr';

    console.log(`\n🔍 Fetching subscription details for: ${oldBasicSubId}`);

    const sub = await stripe.subscriptions.retrieve(oldBasicSubId);

    console.log(`\n📋 Subscription Details:`);
    console.log(`  ID: ${sub.id}`);
    console.log(`  Status: ${sub.status}`);
    console.log(`  Customer: ${sub.customer}`);
    console.log(`  Created: ${new Date(sub.created * 1000).toISOString()}`);
    console.log(`  Items:`, sub.items.data.map(item => ({
      price: item.price.id,
      product: item.price.product
    })));

    console.log(`\n❌ Canceling subscription immediately...`);

    const canceledSub = await stripe.subscriptions.cancel(oldBasicSubId);

    console.log(`\n✅ Subscription canceled successfully!`);
    console.log(`  Status: ${canceledSub.status}`);
    console.log(`  Canceled at: ${new Date(canceledSub.canceled_at! * 1000).toISOString()}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

cancelDuplicateBasicSubscription();
