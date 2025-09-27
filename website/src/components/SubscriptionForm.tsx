import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { useAuth, apiCall } from '../contexts/AuthContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

interface Product {
  id: string;
  product_template_id: string;
  name: string;
  description: string;
  subscription_types: {
    monthly: number;
    annual: number;
  };
}

interface SubscriptionFormProps {
  product: Product;
  subscriptionType: 'monthly' | 'annual';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<SubscriptionFormProps> = ({
  product,
  subscriptionType,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, token } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = product.subscription_types[subscriptionType];
  const displayAmount = (amount / 100).toFixed(0);
  const period = subscriptionType === 'monthly' ? 'month' : 'year';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      toast.error('Payment system not ready or user not authenticated');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create subscription payment intent
      const response = await apiCall('/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          subscriptionType: subscriptionType
        })
      }, token);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      const { customerId } = data.data;

      if (!customerId) {
        throw new Error('Missing customer information from subscription setup');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const paymentMethodResult = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      });

      if (paymentMethodResult.error || !paymentMethodResult.paymentMethod) {
        throw new Error(paymentMethodResult.error?.message || 'Failed to create payment method');
      }

      const confirmResponse = await apiCall('/subscriptions/confirm', {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          productId: product.id,
          subscriptionType,
          paymentMethodId: paymentMethodResult.paymentMethod.id
        })
      }, token);

      const confirmData = await confirmResponse.json();

      if (confirmResponse.ok && confirmData.success) {
        const card = elements.getElement(CardElement);
        card?.clear();
        toast.success('Subscription created successfully!');
        onSuccess?.();
      } else {
        throw new Error(confirmData.message || 'Failed to confirm subscription');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during payment';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="subscription-form">
      <div className="form-header">
        <h2>Complete Your Subscription</h2>
        <div className="subscription-summary">
          <h3>{product.name}</h3>
          <div className="pricing-summary">
            <span className="amount">${displayAmount}</span>
            <span className="period">/{period}</span>
          </div>
          <p className="billing-info">
            {subscriptionType === 'annual' ? 'Billed annually' : 'Billed monthly'} • Auto-renewal enabled
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-section">
          <h4>Payment Information</h4>
          <div className="card-element-container">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="submit-button"
          >
            {processing ? 'Processing...' : `Subscribe for $${displayAmount}/${period}`}
          </button>
        </div>

        <div className="subscription-terms">
          <p>
            By subscribing, you agree to our terms of service. Your subscription will automatically 
            renew {subscriptionType === 'monthly' ? 'monthly' : 'annually'} unless cancelled.
          </p>
        </div>
      </form>
    </div>
  );
};

const SubscriptionForm: React.FC<SubscriptionFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default SubscriptionForm;
