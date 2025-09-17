import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

interface PaymentFormProps {
  productType: 'tutoring';
  productId: string;
  amount: number;
  productName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({
  productType,
  productId,
  amount,
  productName,
  onSuccess,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setPaymentError('');

    try {
      // Create payment intent
      const response = await fetch('/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType,
          productId,
          amount
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create payment');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${user?.firstName} ${user?.lastName}`,
              email: user?.email,
            },
          },
        }
      );

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        const confirmResponse = await fetch('/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.message || 'Payment confirmation failed');
        }

        toast.success(`Payment successful! Access granted to ${productName}`);
        
        // Refresh user profile to get updated courses/licenses
        await refreshProfile();
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Payment failed';
      setPaymentError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h2>Complete Your Purchase</h2>
        <div className="payment-summary">
          <div className="product-info">
            <h3>{productName}</h3>
            <p className="price">${amount.toFixed(2)}</p>
          </div>
          <div className="customer-info">
            <p><strong>Customer:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="card-element-container">
          <label>Card Information</label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  ':-webkit-autofill': {
                    color: '#333',
                  },
                },
                invalid: {
                  color: '#e74c3c',
                  iconColor: '#e74c3c',
                },
              },
              hidePostalCode: false,
              disabled: false,
            }}
            onReady={() => {
              console.log('CardElement ready');
              setCardReady(true);
            }}
            onChange={(event) => {
              console.log('CardElement change:', event);
              if (event.error) {
                setPaymentError(event.error.message || 'Card validation error');
              } else {
                setPaymentError('');
              }
            }}
          />
        </div>

        {paymentError && (
          <div className="payment-error">
            {paymentError}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="pay-button"
          >
            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
          </button>
        </div>
      </form>

      <div className="payment-security">
        <div className="security-badges">
          <div className="security-badge">
            🔒 SSL Encrypted
          </div>
          <div className="security-badge">
            💳 Stripe Secure
          </div>
          <div className="security-badge">
            🛡️ PCI Compliant
          </div>
        </div>
        <p className="security-text">
          Your payment information is processed securely. We do not store credit card details.
        </p>
      </div>
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;