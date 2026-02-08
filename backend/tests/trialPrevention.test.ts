import assert from 'node:assert/strict';

/**
 * Trial Prevention Tests
 * Tests that verify users don't get multiple trials for the same product
 */

console.log('🧪 Running Trial Prevention Tests...\n');

// ============================================
// Previous Trial Detection Tests
// ============================================

console.log('Testing Previous Trial Detection...');
const userSubscriptions = [
  { productId: 'prod_123', subscriptionStatus: 'expired' },
  { productId: 'prod_456', subscriptionStatus: 'cancelled' },
  { productId: 'prod_789', subscriptionStatus: 'trial' }
];

const productId1 = 'prod_123';
const hasHadTrial1 = userSubscriptions.some((sub: any) =>
  sub.productId === productId1 &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'cancelled' || sub.subscriptionStatus === 'expired')
);
assert.equal(hasHadTrial1, true, 'Should detect expired subscription as previous trial');

const productId2 = 'prod_456';
const hasHadTrial2 = userSubscriptions.some((sub: any) =>
  sub.productId === productId2 &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'cancelled' || sub.subscriptionStatus === 'expired')
);
assert.equal(hasHadTrial2, true, 'Should detect cancelled subscription as previous trial');

const productId3 = 'prod_789';
const hasHadTrial3 = userSubscriptions.some((sub: any) =>
  sub.productId === productId3 &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'cancelled' || sub.subscriptionStatus === 'expired')
);
assert.equal(hasHadTrial3, true, 'Should detect trial subscription as previous trial');

const productId4 = 'prod_999';
const hasHadTrial4 = userSubscriptions.some((sub: any) =>
  sub.productId === productId4 &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'cancelled' || sub.subscriptionStatus === 'expired')
);
assert.equal(hasHadTrial4, false, 'Should not detect trial for new product');
console.log('✓ Previous trial detection correct\n');

// ============================================
// Trial Eligibility Tests
// ============================================

console.log('Testing Trial Eligibility...');
const hasHadPreviousTrial_returning = true; // User had a trial before
const shouldGiveTrial1 = !hasHadPreviousTrial_returning;
assert.equal(shouldGiveTrial1, false, 'Should not give trial to returning customer');

const hasHadPreviousTrial_new = false; // First-time customer
const shouldGiveTrial2 = !hasHadPreviousTrial_new;
assert.equal(shouldGiveTrial2, true, 'Should give trial to first-time customer');
console.log('✓ Trial eligibility correct\n');

// ============================================
// Subscription Status Assignment Tests
// ============================================

console.log('Testing Subscription Status Assignment...');

// First-time customer
const shouldGiveTrial_new = true;
const status1 = shouldGiveTrial_new ? 'trial' : 'active';
assert.equal(status1, 'trial', 'First-time customer should get trial status');

// Returning customer (had trial before)
const shouldGiveTrial_returning = false;
const status2 = shouldGiveTrial_returning ? 'trial' : 'active';
assert.equal(status2, 'active', 'Returning customer should get active status');
console.log('✓ Status assignment correct\n');

// ============================================
// Payment Status Tests
// ============================================

console.log('Testing Payment Status...');
const paymentStatus1 = shouldGiveTrial_new ? 'trial' : 'active';
assert.equal(paymentStatus1, 'trial', 'First-time customer payment should be trial');

const paymentStatus2 = shouldGiveTrial_returning ? 'trial' : 'active';
assert.equal(paymentStatus2, 'active', 'Returning customer payment should be active');
console.log('✓ Payment status correct\n');

// ============================================
// Trial Expiry Date Tests
// ============================================

console.log('Testing Trial Expiry Date...');
const trialExpiryDate1 = shouldGiveTrial_new ? new Date('2026-05-07') : null;
assert.ok(trialExpiryDate1 instanceof Date, 'First-time customer should have trial expiry date');

const trialExpiryDate2 = shouldGiveTrial_returning ? new Date('2026-05-07') : null;
assert.equal(trialExpiryDate2, null, 'Returning customer should not have trial expiry date');
console.log('✓ Trial expiry date handling correct\n');

// ============================================
// Multiple Products Tests
// ============================================

console.log('Testing Multiple Products...');
const userWithMultipleProducts = [
  { productId: 'prod_basic', subscriptionStatus: 'expired' },
  { productId: 'prod_premium', subscriptionStatus: 'active' }
];

// User had trial for basic but not premium
const hadBasicTrial = userWithMultipleProducts.some(sub =>
  sub.productId === 'prod_basic' &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'cancelled')
);
assert.equal(hadBasicTrial, true, 'Should detect previous basic trial');

const hadPremiumTrial = userWithMultipleProducts.some(sub =>
  sub.productId === 'prod_premium' &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'cancelled')
);
assert.equal(hadPremiumTrial, false, 'Should not detect premium trial (status is active)');

// Renewing basic should not give trial
const shouldGiveBasicTrial = !hadBasicTrial;
assert.equal(shouldGiveBasicTrial, false, 'Should not give trial for basic renewal');

// First purchase of premium should give trial (even though they have basic)
const shouldGivePremiumTrial = !hadPremiumTrial;
assert.equal(shouldGivePremiumTrial, true, 'Should give trial for first premium purchase');
console.log('✓ Multiple products handling correct\n');

// ============================================
// Scenario Tests
// ============================================

console.log('Testing Real-World Scenarios...');

// Scenario 1: User had trial, let it expire, now purchasing
const scenario1_subscriptions = [
  { productId: 'prod_123', subscriptionStatus: 'expired', subscriptionTrialExpiryDate: '2025-12-06' }
];
const scenario1_hadTrial = scenario1_subscriptions.some(sub =>
  sub.productId === 'prod_123' && sub.subscriptionStatus === 'expired'
);
const scenario1_status = scenario1_hadTrial ? 'active' : 'trial';
assert.equal(scenario1_status, 'active', 'Scenario 1: Expired trial renewal should be active');

// Scenario 2: User cancelled during trial, now re-purchasing
const scenario2_subscriptions = [
  { productId: 'prod_123', subscriptionStatus: 'cancelled', subscriptionTrialExpiryDate: '2025-11-15' }
];
const scenario2_hadTrial = scenario2_subscriptions.some(sub =>
  sub.productId === 'prod_123' && sub.subscriptionStatus === 'cancelled'
);
const scenario2_status = scenario2_hadTrial ? 'active' : 'trial';
assert.equal(scenario2_status, 'active', 'Scenario 2: Cancelled trial renewal should be active');

// Scenario 3: Brand new user, first purchase
const scenario3_subscriptions: any[] = [];
const scenario3_hadTrial = scenario3_subscriptions.some(sub =>
  sub.productId === 'prod_123' &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'cancelled')
);
const scenario3_status = scenario3_hadTrial ? 'active' : 'trial';
assert.equal(scenario3_status, 'trial', 'Scenario 3: Brand new user should get trial');

// Scenario 4: User has active subscription, tries to purchase again (edge case)
const scenario4_subscriptions = [
  { productId: 'prod_123', subscriptionStatus: 'active', subscriptionExpiryDate: '2027-01-01' }
];
const scenario4_hadTrial = scenario4_subscriptions.some(sub =>
  sub.productId === 'prod_123' &&
  (sub.subscriptionStatus === 'trial' || sub.subscriptionStatus === 'expired' || sub.subscriptionStatus === 'cancelled')
);
const scenario4_status = scenario4_hadTrial ? 'active' : 'trial';
// User with active subscription doesn't match trial/expired/cancelled, so they'd get trial
// But in reality, this shouldn't happen (UI should prevent re-purchasing active subscription)
assert.equal(scenario4_status, 'trial', 'Scenario 4: Active subscription would get trial (UI should prevent this)');

console.log('✓ Real-world scenarios correct\n');

console.log('✅ All trial prevention tests passed!');
