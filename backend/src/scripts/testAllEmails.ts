import {
  sendSubscriptionEmail,
  sendSubscriptionUpgradeEmail,
  sendSubscriptionCancellationEmail
} from '../services/mailgunService';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function testAllEmails() {
  const testEmail = 'zhenya+2@minkovich.com'; // Replace with your test email
  const testName = 'Zhenya';

  try {
    console.log('\n📧 Testing all email templates...\n');

    // 1. Test Welcome Email with Trial (Basic)
    console.log('1️⃣  Testing Welcome Email (Basic with Trial)...');
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 3);

    await sendSubscriptionEmail({
      email: testEmail,
      firstName: testName,
      tier: 'basic',
      subscriptionType: 'monthly',
      billingAmount: 7900, // $79.00 in cents
      trialEndsAt: trialEndDate.toISOString(),
    });
    console.log('   ✅ Basic with trial email sent!\n');

    // 2. Test Welcome Email without Trial (Premium)
    console.log('2️⃣  Testing Welcome Email (Premium without Trial)...');
    await sendSubscriptionEmail({
      email: testEmail,
      firstName: testName,
      tier: 'premium',
      subscriptionType: 'annual',
      billingAmount: 74800, // $748.00 in cents
      trialEndsAt: undefined,
    });
    console.log('   ✅ Premium without trial email sent!\n');

    // 3. Test Upgrade Email (Basic to Premium)
    console.log('3️⃣  Testing Upgrade Email (Basic to Premium)...');
    await sendSubscriptionUpgradeEmail({
      email: testEmail,
      firstName: testName,
      subscriptionType: 'annual',
      billingAmount: 74800, // $748.00 in cents
      upgradeDate: new Date().toISOString(),
      billingNote: 'Your billing has been prorated, and your new billing cycle has been adjusted accordingly.',
    });
    console.log('   ✅ Upgrade email sent!\n');

    // 4. Test Cancellation Email (Premium)
    console.log('4️⃣  Testing Cancellation Email (Premium)...');
    await sendSubscriptionCancellationEmail({
      email: testEmail,
      firstName: testName,
      tier: 'premium',
      subscriptionType: 'annual',
      billingAmount: 74800, // $748.00 in cents
      cancelledAt: new Date().toISOString(),
    });
    console.log('   ✅ Premium cancellation email sent!\n');

    // 5. Test Cancellation Email (Basic)
    console.log('5️⃣  Testing Cancellation Email (Basic)...');
    await sendSubscriptionCancellationEmail({
      email: testEmail,
      firstName: testName,
      tier: 'basic',
      subscriptionType: 'monthly',
      billingAmount: 7900, // $79.00 in cents
      cancelledAt: new Date().toISOString(),
    });
    console.log('   ✅ Basic cancellation email sent!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All email templates tested successfully!');
    console.log('📬 Check your email inbox for 5 test emails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error sending test emails:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAllEmails();
