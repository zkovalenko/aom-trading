import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
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

const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedType, setSelectedType] = useState<'monthly' | 'annual'>('annual');
  const [billingType, setBillingType] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get('/subscriptions/products');
        if (response.data.success) {
          setProducts(response.data.data.products);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleSubscribe = (product: Product) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    setSelectedProduct(product);
    setSelectedType(billingType);
  };

  const handleSubscriptionSuccess = () => {
    setSelectedProduct(null);
    // Could redirect to a success page or show a success message
  };

  const handleSubscriptionCancel = () => {
    setSelectedProduct(null);
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

        <div className="cta-section">
          <h2>Ready to Start Trading?</h2>
          <p>
            Join thousands of traders who have improved their results with our proven methodology. 
            <br />
            <br />
          </p>
          {!user && (
            <div className="auth-buttons">
              <Link to="/signup" className="cta-button primary">Create Account</Link>
              <Link to="/login" className="cta-button secondary">Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;