import pool from '../config/database';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

async function syncDatabaseWithStripe() {
  try {
    const userId = '290d70eb-f41c-440a-8378-7c4118ae0638'; // zhenya+2@minkovich.com

    console.log('\n🔄 Syncing database with Stripe...\n');

    // Get current database subscriptions
    const result = await pool.query(
      'SELECT subscriptions FROM user_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('❌ No subscriptions found for user');
      process.exit(1);
    }

    let subscriptions = result.rows[0].subscriptions || [];

    console.log('📋 Current database subscriptions:', subscriptions.length);

    // Update each subscription with Stripe status
    for (let i = 0; i < subscriptions.length; i++) {
      const sub = subscriptions[i];
      const stripeSubId = sub.stripeSubscriptionId;

      if (!stripeSubId) {
        console.log(`⚠️  Subscription ${i + 1} has no Stripe ID, skipping`);
        continue;
      }

      try {
        console.log(`\n🔍 Checking Stripe subscription: ${stripeSubId}`);

        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const product = await stripe.products.retrieve(stripeSub.items.data[0].price.product as string);

        console.log(`   Product: ${product.name}`);
        console.log(`   Stripe Status: ${stripeSub.status}`);
        console.log(`   DB Status: ${sub.subscriptionStatus}`);

        // Update subscription with Stripe data
        subscriptions[i] = {
          ...sub,
          subscriptionStatus: stripeSub.status,
          productName: product.name,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          currentPeriodStart: new Date(stripeSub.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000).toISOString(),
          trialExpiryDate: stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000).toISOString() : null,
        };

        console.log(`   ✅ Updated to status: ${stripeSub.status}`);

      } catch (error: any) {
        if (error.code === 'resource_missing') {
          console.log(`   ❌ Subscription not found in Stripe, marking as canceled`);
          subscriptions[i].subscriptionStatus = 'canceled';
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }

    // Update database
    console.log('\n💾 Updating database...');

    await pool.query(
      'UPDATE user_subscriptions SET subscriptions = $1, updated_at = NOW() WHERE user_id = $2',
      [JSON.stringify(subscriptions), userId]
    );

    console.log('✅ Database updated successfully!\n');

    // Show final state
    console.log('📋 Final subscriptions:');
    subscriptions.forEach((sub: any, i: number) => {
      console.log(`\n  ${i + 1}. ${sub.productName}`);
      console.log(`     Status: ${sub.subscriptionStatus}`);
      console.log(`     Type: ${sub.subscriptionType}`);
      console.log(`     Stripe ID: ${sub.stripeSubscriptionId}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

syncDatabaseWithStripe();
