# Backend Testing Documentation

This document describes the test suite for the AOM Trading backend, focusing on subscription management, license validation, and trial prevention.

## Test Files

### 1. subscriptionRenewal.test.ts
Tests subscription renewal logic to ensure subscriptions are properly updated rather than duplicated.

**Key Test Scenarios:**
- Finding existing subscriptions by productId
- Updating existing subscriptions (renewals)
- Preventing duplicate subscriptions
- Adding new subscriptions for different products
- Status transitions (expired → trial, expired → active)
- Product ID preservation across renewals
- License validation after renewal

**Run Command:**
```bash
npm run test:renewal
```

### 2. trialPrevention.test.ts
Tests that users don't receive multiple trials for the same product.

**Key Test Scenarios:**
- Previous trial detection (expired, cancelled, trial statuses)
- Trial eligibility determination
- Subscription status assignment (trial vs active)
- Payment status matching subscription status
- Trial expiry date handling
- Multiple products (trials are product-specific)
- Real-world scenarios:
  - User had trial, let it expire, now purchasing → should get **active** status
  - User cancelled during trial, re-purchasing → should get **active** status
  - Brand new user, first purchase → should get **trial** status
  - User with active subscription (edge case)

**Run Command:**
```bash
npm run test:trial
```

### 3. license.test.ts
Tests NetLicensing integration and license lifecycle management.

**Key Test Scenarios:**
- NetLicensing API key formatting (apiKey:KEY)
- Base64 encoding for Basic authentication
- Licensee creation and validation
- License generation and validation
- License template selection (monthly vs annual)
- Request validation (email, product number)
- Status validation (active, trial, expired)
- Product template matching
- Validation response formats
- License renewal with existing licensee/license numbers
- NetLicensing module validation

**Run Command:**
```bash
npm run test:license
```

### 4. licenseValidation.test.ts
Integration tests for license validation functionality.

**Run Command:**
```bash
npm test
```

## Running Tests

### Run All Tests
```bash
npm run test:all
```

This runs all test files in sequence:
1. Subscription Renewal Tests
2. Trial Prevention Tests
3. License Management Tests
4. License Validation Tests

### Run Individual Tests
```bash
npm run test:renewal    # Subscription renewal tests
npm run test:trial      # Trial prevention tests
npm run test:license    # License management tests
npm test                # License validation tests
```

## Test Architecture

All tests use Node.js built-in `assert` module for assertions. Tests are written using TypeScript and executed with `ts-node --transpile-only` for fast execution without type checking.

### Test Pattern
```typescript
import assert from 'node:assert/strict';

console.log('🧪 Running Tests...\n');

console.log('Testing Feature...');
// Test logic
assert.equal(actual, expected, 'Description');
console.log('✓ Feature correct\n');

console.log('✅ All tests passed!');
```

## Critical Business Logic

### Trial Prevention Logic
The subscription system implements trial prevention to ensure users only receive one free trial per product:

```typescript
// Check if user has had a previous trial for this product
const hasHadPreviousTrial = subscriptions.some((sub: any) =>
  sub.productId === productId &&
  (sub.subscriptionStatus === 'trial' ||
   sub.subscriptionStatus === 'cancelled' ||
   sub.subscriptionStatus === 'expired')
);

// Determine subscription status
const shouldGiveTrial = !hasHadPreviousTrial;
const subscriptionStatus = shouldGiveTrial ? 'trial' : 'active';
```

**Key Points:**
- First-time customers get `status: 'trial'` with 3-month free trial
- Returning customers (renewals) get `status: 'active'` with immediate billing
- Trial detection checks for expired, cancelled, or trial statuses
- Trials are product-specific (user can have trial for Product A and Product B separately)

### Subscription Renewal Logic
When processing a subscription purchase, the system checks for existing subscriptions:

```typescript
const existingSubIndex = currentSubscriptions.findIndex(
  (sub: any) => sub.productId === productId
);

if (existingSubIndex !== -1) {
  // Update existing subscription (renewal)
  currentSubscriptions[existingSubIndex] = subscriptionData;
} else {
  // Add new subscription (different product)
  currentSubscriptions.push(subscriptionData);
}
```

**Key Points:**
- Prevents duplicate subscriptions for the same product
- Allows multiple subscriptions for different products
- Preserves licensee and license numbers during renewals

## Test Coverage

The test suite covers:
- ✅ Subscription creation and renewal
- ✅ Trial eligibility and prevention
- ✅ License generation and validation
- ✅ NetLicensing API integration
- ✅ Status transitions
- ✅ Duplicate prevention
- ✅ Multiple product handling
- ✅ Edge cases and error scenarios

## CI/CD Integration

To integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm run test:all
```

## Debugging Failed Tests

If a test fails:

1. **Check the assertion message** - provides context about what failed
2. **Review the test scenario** - understand what business logic is being tested
3. **Check related code** - look at the actual implementation in `src/controllers/subscriptionController.ts`
4. **Run individual test** - isolate the failing test with specific npm command

## Adding New Tests

When adding new subscription or license features:

1. Add test scenarios to the appropriate test file
2. Follow the existing test pattern
3. Use descriptive assertion messages
4. Test both success and failure cases
5. Include edge cases and boundary conditions
6. Update this documentation

## Test Maintenance

- Review and update tests when business logic changes
- Keep test scenarios aligned with real-world use cases
- Ensure tests remain independent and can run in any order
- Update documentation when adding new test files
