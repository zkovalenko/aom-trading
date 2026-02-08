# Testing Guide - Subscription Renewal System

## Overview

This document describes the test suite for the subscription renewal and purchase flow.

---

## Test Coverage

### Backend Tests

#### 1. **Subscription Renewal Logic** (`backend/tests/subscriptionRenewal.test.ts`)
Tests the core renewal logic to ensure:
- ✅ Existing expired subscriptions are **updated** (not duplicated)
- ✅ New subscriptions are created only for different products
- ✅ License information is properly stored
- ✅ Status transitions work correctly (expired → trial → active)

#### 2. **License Validation** (`backend/tests/licenseValidation.test.ts`)
Tests license validation after renewal:
- ✅ Renewed subscriptions validate as active
- ✅ Expired subscriptions are properly detected
- ✅ Product template matching works correctly

### Frontend Tests

#### 3. **MySubscriptions Component** (`website/src/pages/MySubscriptions.test.tsx`)
Tests Purchase and Renew button functionality:
- ✅ Trial expiration detection
- ✅ Subscription expiration detection
- ✅ Correct checkout URL generation
- ✅ Billing type preservation (monthly/annual)
- ✅ Display text changes (Trial ends → Trial ended)

#### 4. **ServicesPage Component** (`website/src/pages/ServicesPage.test.tsx`)
Tests payment success redirect:
- ✅ Redirect to `/my-subscriptions` after payment
- ✅ URL parameter parsing
- ✅ Subscription reload after success
- ✅ Full purchase flow integration

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm run test:all

# Run specific test suites
npm run test              # License validation tests
npm run test:renewal      # Subscription renewal tests
```

### Frontend Tests

```bash
cd website

# Run all tests
npm test

# Run specific test file
npm test MySubscriptions.test.tsx
npm test ServicesPage.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Test Scenarios Covered

### 1. Purchase Flow (Expired Trial)
```
User has expired trial
  ↓
Clicks "Purchase" button
  ↓
Redirected to checkout with:
  - Same product ID
  - Same billing type (monthly/annual)
  ↓
Completes payment
  ↓
Subscription updated (not duplicated)
  ↓
Redirected to /my-subscriptions
  ↓
Sees active subscription
```

### 2. Renewal Flow (Expired Subscription)
```
User has expired subscription
  ↓
Clicks "Renew" button
  ↓
Redirected to checkout with:
  - Same product ID
  - Same billing type
  ↓
Completes payment
  ↓
Existing subscription replaced
  ↓
Redirected to /my-subscriptions
  ↓
Sees renewed subscription
```

### 3. Duplicate Prevention
```
User with:
  - Expired subscription for Product A
  ↓
Purchases Product A again
  ↓
System checks for existing subscription
  ↓
Finds Product A subscription
  ↓
REPLACES old subscription
  ↓
Result: 1 subscription (not 2)
```

---

## Key Test Assertions

### Backend
- `findIndex` correctly locates existing subscription
- Subscription array length remains correct after renewal
- `subscriptionStatus` transitions properly
- Product ID matches after renewal

### Frontend
- `isTrialExpired()` correctly detects expired trials
- `isSubscriptionExpired()` correctly detects expired subscriptions
- Checkout URL includes correct parameters
- Billing type is preserved from original subscription
- Redirect goes to `/my-subscriptions` after success

---

## Adding New Tests

### Backend Test Template
```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const testData = { /* setup */ };

    // Act
    const result = functionUnderTest(testData);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Frontend Test Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('Component Name', () => {
  it('should render correctly', () => {
    // Arrange & Act
    render(<Component />);

    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

---

## Continuous Integration

To run tests automatically in CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run Backend Tests
  run: |
    cd backend
    npm install
    npm run test:all

- name: Run Frontend Tests
  run: |
    cd website
    npm install
    npm test -- --watchAll=false
```

---

## Test Maintenance

- Run tests before committing code
- Update tests when business logic changes
- Add tests for new features
- Keep test coverage above 80%

---

## Troubleshooting

### Backend tests fail
- Check database connection
- Verify environment variables
- Ensure TypeScript compiles

### Frontend tests fail
- Clear test cache: `npm test -- --clearCache`
- Check React Testing Library version
- Verify mock data matches actual API

---

## Contact

For questions about tests, see the test files for inline comments and examples.
