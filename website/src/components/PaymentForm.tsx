import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import './PaymentForm.css';

// Enhanced Stripe loading with fallback options
const loadStripeWithFallback = async (): Promise<Stripe | null> => {
  try {
    // First attempt: Load Stripe normally
    const stripe = await loadStripe(
      process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key',
      {
        // Additional options for better compatibility
        apiVersion: '2023-10-16',
        stripeAccount: undefined,
      }
    );
    
    if (stripe) {
      console.log('Stripe loaded successfully');
      return stripe;
    }
  } catch (error) {
    console.warn('Primary Stripe loading failed:', error);
  }

  try {
    // Fallback: Try loading with manual script injection
    console.log('Attempting Stripe fallback loading...');
    
    // Check if Stripe is already loaded globally
    if (window?.Stripe) {
      return window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');
    }

    // Manually inject Stripe script if not loaded
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        if (window.Stripe) {
          const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');
          console.log('Stripe loaded via fallback');
          resolve(stripe);
        } else {
          console.error('Stripe failed to load even with fallback');
          resolve(null);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Stripe script');
        resolve(null);
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Stripe fallback loading failed:', error);
    return null;
  }
};

const stripePromise = loadStripeWithFallback();

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
                  fontSize: '18px', // Larger font size for better touch experience
                  color: '#333',
                  lineHeight: '1.5', // Better line height for touch
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  // Touch-specific optimizations
                  iconColor: '#666',
                  ':-webkit-autofill': {
                    color: '#333',
                    backgroundColor: 'transparent',
                  },
                },
                invalid: {
                  color: '#e74c3c',
                  iconColor: '#e74c3c',
                },
                complete: {
                  color: '#28a745',
                  iconColor: '#28a745',
                },
              },
              hidePostalCode: false,
              disabled: false,
              // iOS Safari specific fixes
              classes: {
                focus: 'card-element-focus',
                empty: 'card-element-empty',
                invalid: 'card-element-invalid',
              },
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
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(true);

  useEffect(() => {
    const initializeStripe = async () => {
      setIsStripeLoading(true);
      try {
        const stripeInstance = await stripePromise;
        if (stripeInstance) {
          setStripe(stripeInstance);
          setStripeError(null);
        } else {
          setStripeError('Unable to load payment system. Please check your browser settings and disable ad blockers, then refresh the page.');
        }
      } catch (error) {
        console.error('Stripe initialization error:', error);
        setStripeError('Payment system blocked. Please disable ad blockers and browser extensions, then refresh the page.');
      } finally {
        setIsStripeLoading(false);
      }
    };

    initializeStripe();
  }, []);

  if (isStripeLoading) {
    return (
      <div className="payment-form">
        <div className="stripe-loading">
          <div className="loading-spinner"></div>
          <p>Loading secure payment system...</p>
          <small>If this takes too long, please disable ad blockers and refresh the page.</small>
        </div>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="payment-form">
        <div className="stripe-error">
          <h3>Payment System Unavailable</h3>
          <p>{stripeError}</p>
          <div className="troubleshooting-steps">
            <h4>Troubleshooting Steps:</h4>
            <ul>
              <li>Disable ad blockers (uBlock Origin, AdBlock, etc.)</li>
              <li>Disable browser extensions temporarily</li>
              <li>Try using an incognito/private window</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try a different browser (Chrome, Firefox, Safari)</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry Payment System
          </button>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripe}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default PaymentForm;