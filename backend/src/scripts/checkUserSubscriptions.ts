import pool from '../config/database';

async function checkUserSubscriptions() {
  try {
    // Query user_subscriptions table
    const result = await pool.query(
      `SELECT
        us.user_id,
        us.subscriptions,
        u.email
      FROM user_subscriptions us
      JOIN users u ON u.id = us.user_id
      ORDER BY us.updated_at DESC
      LIMIT 5`
    );

    console.log('\n📋 User Subscriptions in Database:\n');

    result.rows.forEach((row) => {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`User: ${row.email} (ID: ${row.user_id})`);
      console.log('='.repeat(80));

      const subscriptions = row.subscriptions || [];

      if (subscriptions.length === 0) {
        console.log('  No subscriptions found');
      } else {
        subscriptions.forEach((sub: any, index: number) => {
          console.log(`\n  Subscription ${index + 1}:`);
          console.log(`    Product: ${sub.productName || 'Unknown'}`);
          console.log(`    Status: ${sub.subscriptionStatus}`);
          console.log(`    Type: ${sub.subscriptionType}`);
          console.log(`    Stripe Sub ID: ${sub.stripeSubscriptionId}`);
          console.log(`    Start Date: ${sub.startDate}`);
          console.log(`    Expiry Date: ${sub.expiryDate}`);
          console.log(`    Trial Expiry: ${sub.trialExpiryDate || 'N/A'}`);
          console.log(`    Cancel at Period End: ${sub.cancelAtPeriodEnd || false}`);
        });
      }
    });

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUserSubscriptions();
