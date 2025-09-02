import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, apiCall } from '../contexts/AuthContext';
import SubscriptionForm from '../components/SubscriptionForm';
import './ServicesPage.css';

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

interface UserSubscription {
  id: string;
  user_id: string;
  productId: string;
  createdAt: string;
  subscriptionExpiryDate: string;
  subscriptionStatus: string;
  subscriptionTrialExpiryDate: string;
  subscriptionType: string;
  product?: Product;
}

const ServicesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedType, setSelectedType] = useState<'monthly' | 'annual'>('annual');
  const [billingType, setBillingType] = useState<'monthly' | 'annual'>('annual');
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Loading products..., user:', user);
        const response = await apiCall('/subscriptions/products', { method: 'GET' });
        const data = await response.json();
        console.log('Products response:', data);
        if (response.ok && data.success) {
          console.log("~~~~products loaded:", data.data.products);
          setProducts(data.data.products);
        } else {
          console.error('Products request failed:', data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [user]);

  // Handle subscription redirect after login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    const productId = urlParams.get('product');
    const type = urlParams.get('type');

    console.log("~~~~user", user);

    if ((redirect === 'subscribe' || redirect === 'subscribe-direct') && productId && user && products.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setSelectedType(type as 'monthly' | 'annual' || 'annual');
        setBillingType(type as 'monthly' | 'annual' || 'annual');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // If it's subscribe-direct (from learn-to-trade), immediately show payment form
        if (redirect === 'subscribe-direct') {
          // The payment form will show automatically because selectedProduct is set
          console.log("Auto-triggering payment for learn-to-trade user");
        }
      }
    }
  }, [user, products]);

  // Load user subscriptions when user is available
  useEffect(() => {
    const loadUserSubscriptions = async () => {
      if (!user) return;
      
      setSubscriptionsLoading(true);
      try {
        handleSubscriptionSuccess(); 
      } catch (error) {
        console.error('Failed to load user subscriptions:', error);
      } finally {
        setSubscriptionsLoading(false);
      }
    };

    loadUserSubscriptions();
  }, [user]);

  const handleSubscribe = (product: Product) => {
    if (!user) {
      // Check if we're on learn-to-trade page to determine redirect behavior
      const isFromLearnToTrade = window.location.pathname === '/learn-to-trade';
      const redirectParam = isFromLearnToTrade ? 'subscribe-direct' : 'subscribe';
      window.location.href = `/login?redirect=${redirectParam}&product=${product.id}&type=${billingType}`;
      return;
    }
    setSelectedProduct(product);
    setSelectedType(billingType);
  };

  const handleSubscriptionSuccess = async () => {
    setSelectedProduct(null);
    // Reload user subscriptions to show updated content
    if (user) {
      try {
        const response = await apiCall('/subscriptions/my-subscriptions', { method: 'GET' }, token);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log("~~~~setUserSubscriptions", data.data.subscriptions);
            setUserSubscriptions(data.data.subscriptions);
          }
        }
      } catch (error) {
        console.error('Failed to reload subscriptions:', error);
      }
    }
  };

  const handleSubscriptionCancel = () => {
    setSelectedProduct(null);
  };

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
    return userSubscriptions.some(sub => sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial');
  };

  // Helper function to get active subscription
  const getActiveSubscription = () => {
    return userSubscriptions.find(sub => sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial');
  };

  if (selectedProduct) {
    return (
      <div className="services-page">
        <div className="container">
          <SubscriptionForm
            product={selectedProduct}
            subscriptionType={selectedType}
            onSuccess={handleSubscriptionSuccess}
            onCancel={handleSubscriptionCancel}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="services-page">
        <div className="container">
          <div className="loading">Loading subscription plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="container">
        <h1 className="pt-10">Trade with confidence</h1>
        
        <div className="content-section">
          <div className="content-left content-image">&nbsp;</div>
          
          <div className="content-right">
              {/* <h3>Expertise Simplified</h3> */}
              <p>
                Years of market research, real-time data analysis, and tested strategies distilled into a practical way to learn and trade with confidence.
              </p>
            
              {/* <h3>Powerful Tools & Live Learning</h3> */}
              <p>
                Access our patented trading software and live trading rooms to learn in real time, ask questions, and see strategies in action.
              </p>
            
              {/* <h3>For Every Trader</h3> */}
              <p>
                Whether you're just starting out or looking to sharpen your edge, our advanced tools and expert-backed methodology help you trade stocks, futures, forex, and more.
              </p>
          </div>
        </div>

        {/* Show subscription selection for users without active subscription */}
        {(!user || !hasActiveSubscription()) && (
          <div className="subscription-features">
            <h2>Choose Your Subscription</h2>

            <div className="billing-toggle">
              <span className={billingType === 'monthly' ? 'active' : ''}>Monthly</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={billingType === 'annual'}
                  onChange={(e) => setBillingType(e.target.checked ? 'annual' : 'monthly')}
                />
                <span className="slider"></span>
              </label>
              <span className={billingType === 'annual' ? 'active' : ''}>
                Annual 
                <span className="save-badge">Save up to $72!</span>
              </span>
            </div>
            
            <div className="services-grid">
              {products.map((product, index) => (
                <div key={product.id} className="service-card">
                  <h3>{product.name}</h3>
                 
                  {product.name.includes('Basic') && 
                      <div className="feature-item-description">
                        <p>Spot high probability trades for intraday and swing trading</p>
                        <p>State of the art trading software and analytics</p>
                        <p>Access to our live trading rooms</p>
                        <p></p>
                      </div>
                  }
                  {product.name.includes('Premium') && 
                      <div className="feature-item-description">
                        <p>Spot high probability trades for intraday and swing trading</p>
                        <p>State of the art trading software and analytics</p>
                        <p>Access to our live trading rooms</p>
                        <p><strong>Semi-automated trading</strong> with our trusted trading software</p>
                      </div>
                  }
                 
                  <div className="pricing-section">
                    <div className="current-price">
                      <span className="amount">
                        ${(product.subscription_types[billingType] / 100).toFixed(0)}
                      </span>
                      <span className="period">/{billingType === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {billingType === 'annual' && (
                      <div className="monthly-equivalent">
                        ${((product.subscription_types.annual / 12) / 100).toFixed(0)}/month when billed annually
                      </div>
                    )}
                  </div>

                  <button 
                    className="service-button"
                    onClick={() => handleSubscribe(product)}
                  >
                    GET STARTED
                  </button>
                </div>
              ))}
            </div>

            <div className="subscription-features">
              <h2>What's Included</h2>
              <div className="features-grid">
                <div className="feature-item">
                  <h3>Expert Mentorship</h3>
                  <p>Learn from experienced traders with proven track records</p>
                </div>
                <div className="feature-item">
                  <h3>Trading Methodology</h3>
                  <p>Access to our comprehensive AOM Trading strategy</p>
                </div>
                <div className="feature-item">
                  <h3>Ongoing Support</h3>
                  <p>24/7 access to our community and support resources</p>
                </div>
                <div className="feature-item">
                  <h3>Flexible Billing</h3>
                  <p>Choose monthly or annual billing with automatic renewal</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Protected Content Section for Subscribed Users */}
        {user && hasActiveSubscription() && (
          <div className="protected-content-section">
            <h2>Welcome to AOM Trading - Premium Content</h2>
            <p className="welcome-message">
              Congratulations! You now have access to our exclusive trading resources and live trading rooms.
            </p>
            
            <div className="protected-features-grid">
              <div className="protected-feature-item">
                <h3>Educational Materials</h3>
                <p>Access comprehensive trading guides, market analysis reports, and strategy documentation.</p>
                <button className="feature-access-button">Access Materials</button>
              </div>
              
              <div className="protected-feature-item">
                <h3>Trading Software</h3>
                <p>Download and access our proprietary trading software with real-time market data and analysis tools.</p>
                <button className="feature-access-button">Download Software</button>
              </div>
              
              <div className="protected-feature-item">
                <h3>Live Trading Rooms</h3>
                <p>Join our live trading sessions where you can watch expert traders in action and ask questions in real-time.</p>
                <button className="feature-access-button">Enter Trading Room</button>
              </div>
              
              {getActiveSubscription()?.product?.name?.includes('Premium') && (
                <div className="protected-feature-item premium-feature">
                  <h3>Semi-Automated Trading</h3>
                  <p>Access our advanced semi-automated trading features with preset strategies and risk management.</p>
                  <button className="feature-access-button premium">Access Premium Tools</button>
                </div>
              )}
            </div>
          </div>
        )}

        {!user || !hasActiveSubscription() && (
        <div className="cta-section">
          <h2>Ready to Start Trading?</h2>
          <p>
            Join thousands of traders who have improved their results with our proven methodology. 
            <br />
            <br />
          </p>
            <div className="auth-buttons">
              <Link to="/signup" className="cta-button primary">Create Account</Link>
              <Link to="/login" className="cta-button secondary">Sign In</Link>
            </div>
          </div>
        )} 
      </div>
    </div>
  );
};

export default ServicesPage;