import pool from '../config/database';

async function testMySubscriptionsAPI() {
  try {
    const userId = '290d70eb-f41c-440a-8378-7c4118ae0638'; // zhenya+2@minkovich.com

    console.log('\n📋 Testing /subscriptions/my-subscriptions API response:\n');

    const result = await pool.query(
      'SELECT subscriptions FROM user_subscriptions WHERE user_id = $1',
      [userId]
    );

    const subscriptions = result.rows.length > 0 ? result.rows[0].subscriptions : [];

    console.log('API would return:');
    console.log(JSON.stringify({
      success: true,
      data: {
        subscriptions: subscriptions
      }
    }, null, 2));

    console.log('\n\n📊 Active Subscriptions (filtered):');
    const activeOrTrial = subscriptions.filter((sub: any) =>
      sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial'
    );

    activeOrTrial.forEach((sub: any) => {
      console.log(`\n  Product: ${sub.productName}`);
      console.log(`  Status: ${sub.subscriptionStatus}`);
      console.log(`  Type: ${sub.subscriptionType}`);
      console.log(`  Trial Expiry: ${sub.trialExpiryDate || 'N/A'}`);
    });

    // Show which subscription would be selected as "active"
    const activeSubscription = activeOrTrial.find((sub: any) => sub.subscriptionStatus === 'active');
    const selectedSub = activeSubscription || activeOrTrial.find((sub: any) => sub.subscriptionStatus === 'trial');

    console.log('\n\n✅ Frontend would show this subscription:');
    console.log(`  Product: ${selectedSub?.productName}`);
    console.log(`  Status: ${selectedSub?.subscriptionStatus}`);
    console.log(`  Trial Expiry: ${selectedSub?.trialExpiryDate || 'N/A'}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testMySubscriptionsAPI();
