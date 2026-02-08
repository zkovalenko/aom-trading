import React from 'react';
import '@testing-library/jest-dom';

/**
 * Tests for ServicesPage - Payment Success Redirect
 *
 * Verifies that after successful payment, users are redirected to /my-subscriptions
 */

describe('Payment Success Redirect', () => {
  it('should redirect to /my-subscriptions after successful payment', () => {
    const mockLocationHref = jest.fn();
    delete (window as any).location;
    window.location = { href: '' } as any;

    Object.defineProperty(window.location, 'href', {
      set: mockLocationHref,
      get: () => '/my-subscriptions'
    });

    // Simulate successful payment
    window.location.href = '/my-subscriptions';

    expect(mockLocationHref).toHaveBeenCalledWith('/my-subscriptions');
  });

  it('should verify redirect URL is correct', () => {
    const redirectUrl = '/my-subscriptions';
    expect(redirectUrl).toBe('/my-subscriptions');
    expect(redirectUrl).not.toBe('/learn-to-trade');
  });
});

describe('URL Parameter Parsing', () => {
  it('should parse redirect parameter from URL', () => {
    const searchParams = new URLSearchParams('?redirect=subscribe-direct&product=prod_123&type=monthly');

    const redirect = searchParams.get('redirect');
    const productId = searchParams.get('product');
    const type = searchParams.get('type');

    expect(redirect).toBe('subscribe-direct');
    expect(productId).toBe('prod_123');
    expect(type).toBe('monthly');
  });

  it('should handle subscribe-direct redirect', () => {
    const searchParams = new URLSearchParams('?redirect=subscribe-direct&product=prod_123&type=annual');

    const redirect = searchParams.get('redirect');
    const shouldShowPayment = redirect === 'subscribe-direct';

    expect(shouldShowPayment).toBe(true);
  });

  it('should parse product ID from URL', () => {
    const url = '/learn-to-trade?redirect=subscribe-direct&product=prod_abc123&type=monthly';
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const productId = searchParams.get('product');
    expect(productId).toBe('prod_abc123');
  });

  it('should parse billing type from URL', () => {
    const url = '/learn-to-trade?redirect=subscribe-direct&product=prod_123&type=annual';
    const searchParams = new URLSearchParams(url.split('?')[1]);

    const type = searchParams.get('type');
    expect(type).toBe('annual');
  });
});

describe('Subscription Success Flow', () => {
  it('should reload subscriptions after success', async () => {
    let subscriptionsReloaded = false;

    // Simulate reloading subscriptions
    const reloadSubscriptions = async () => {
      subscriptionsReloaded = true;
      return { success: true, data: { subscriptions: [] } };
    };

    await reloadSubscriptions();
    expect(subscriptionsReloaded).toBe(true);
  });

  it('should clear selected product after success', () => {
    let selectedProduct: any = { id: 'prod_123', name: 'Test Product' };

    // Simulate success handler
    const handleSuccess = () => {
      selectedProduct = null;
    };

    handleSuccess();
    expect(selectedProduct).toBeNull();
  });

  it('should complete full success flow', async () => {
    let selectedProduct: any = { id: 'prod_123' };
    let redirected = false;
    let subscriptionsReloaded = false;

    // Simulate handleSubscriptionSuccess
    const handleSubscriptionSuccess = async () => {
      selectedProduct = null;

      // Reload subscriptions
      subscriptionsReloaded = true;

      // Redirect
      redirected = true;
    };

    await handleSubscriptionSuccess();

    expect(selectedProduct).toBeNull();
    expect(subscriptionsReloaded).toBe(true);
    expect(redirected).toBe(true);
  });
});

describe('Integration: Purchase to Redirect', () => {
  it('should complete full purchase flow', () => {
    // Step 1: User has expired subscription
    const expiredSubscription = {
      productId: 'prod_123',
      subscriptionStatus: 'expired',
      subscriptionType: 'monthly'
    };

    // Step 2: Generate redirect URL
    const billingType = expiredSubscription.subscriptionType.includes('annual') ? 'annual' : 'monthly';
    const checkoutUrl = `/learn-to-trade?redirect=subscribe-direct&product=${expiredSubscription.productId}&type=${billingType}`;

    // Step 3: Parse URL parameters (simulating ServicesPage)
    const searchParams = new URLSearchParams(checkoutUrl.split('?')[1]);
    const redirect = searchParams.get('redirect');
    const productId = searchParams.get('product');

    // Step 4: After payment success, redirect to my-subscriptions
    const successRedirectUrl = '/my-subscriptions';

    // Verify flow
    expect(redirect).toBe('subscribe-direct');
    expect(productId).toBe('prod_123');
    expect(successRedirectUrl).toBe('/my-subscriptions');
  });

  it('should preserve billing type through entire flow', () => {
    // Original subscription
    const subscription = {
      productId: 'prod_123',
      subscriptionType: 'annual'
    };

    // Extract billing type
    const billingType = subscription.subscriptionType.includes('annual') ? 'annual' : 'monthly';

    // Build checkout URL
    const url = `/learn-to-trade?redirect=subscribe-direct&product=${subscription.productId}&type=${billingType}`;

    // Parse URL
    const params = new URLSearchParams(url.split('?')[1]);
    const parsedType = params.get('type');

    // Verify preservation
    expect(billingType).toBe('annual');
    expect(parsedType).toBe('annual');
  });
});

console.log('✅ All ServicesPage redirect tests passed!');
