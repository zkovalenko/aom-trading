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
import './SubscriptionForm.css';

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

      const { clientSecret, paymentIntentId } = data.data;
      console.log("~~~~paymentIntentId", paymentIntentId);
      
      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm subscription on backend
        const paymentMethodId = typeof paymentIntent.payment_method === 'string' 
          ? paymentIntent.payment_method 
          : paymentIntent.payment_method?.id;
          
        const confirmResponse = await apiCall('/subscriptions/confirm', {
          method: 'POST',
          body: JSON.stringify({
            paymentIntentId: paymentIntentId,
            ccToken: paymentMethodId
          })
        }, token);

        const confirmData = await confirmResponse.json();

        if (confirmResponse.ok && confirmData.success) {
          toast.success('Subscription created successfully!');
          onSuccess?.();
        } else {
          throw new Error(confirmData.message || 'Failed to confirm subscription');
        }
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