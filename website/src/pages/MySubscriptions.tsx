import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, apiCall } from '../contexts/AuthContext';
import './MySubscriptions.css';

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
  subscriptionType: string;  //trial, basic, premium
  autoRenewal?: boolean;
  purchaseDate?: string;
  product?: Product;
}

const MySubscriptions: React.FC = () => {
  const { user, token } = useAuth();
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserSubscriptions = async () => {
      if (!user) return;
      
      try {
        const response = await apiCall('/subscriptions/my-subscriptions', { method: 'GET' }, token);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserSubscriptions(data.data.subscriptions);
          }
        }
      } catch (error) {
        console.error('Failed to load user subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserSubscriptions();
  }, [user]);

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
    return userSubscriptions.some(sub => sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial');
  };

  // Helper function to get active subscription
  const getActiveSubscription = () => {
    return userSubscriptions.find(sub => sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial');
  };

  if (loading) {
    return (
      <div className="my-subscriptions-page">
        <div className="container">
          <div className="loading">Loading your subscriptions...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-subscriptions-page">
        <div className="container">
          <div className="no-access">Please log in to view your subscriptions.</div>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription()) {
    return (
      <div className="my-subscriptions-page">
        <div className="container">
          <div className="no-subscription">
            <h2>No Active Subscription</h2>
            <p>You don't have an active subscription yet. Subscribe to access our premium trading resources.</p>
            <a href="/services" className="subscribe-button">View Subscription Plans</a>
          </div>
        </div>
      </div>
    );
  }

  const activeSubscription = getActiveSubscription();
console.log("~~~activeSubscription", activeSubscription)
  return (
    <div className="my-subscriptions-page">
      <div className="container">
        <div className="subscription-status-section">
          <h2>Current Subscription Status</h2>
          <div className="subscription-details">
            <div className="subscription-detail-item">
              <span className="detail-label">Auto-renewal:</span>
              <span className="detail-value">
                {activeSubscription?.autoRenewal !== false ? 'On' : 'Off'}
              </span>
            </div>
            <div className="subscription-detail-item">
              <span className="detail-label">Next renewal Date:</span>
              <span className="detail-value">
                {new Date(activeSubscription?.subscriptionExpiryDate || '').toLocaleDateString()}
              </span>
            </div>
            <div className="subscription-detail-item">
              <span className="detail-label">Purchased:</span>
              <span className="detail-value">
                {new Date(activeSubscription?.purchaseDate || activeSubscription?.createdAt || '').toLocaleDateString()}
              </span>
            </div>
            <div className="subscription-detail-item">
              <div className="detail-label">
                Level:
              
                {/* capitalize first letter */}
                <strong>{activeSubscription?.subscriptionStatus ? 
                  activeSubscription.subscriptionStatus.charAt(0).toUpperCase() + activeSubscription.subscriptionStatus.slice(1) : 
                  ''
                }</strong>

                {activeSubscription?.subscriptionStatus?.includes('basic') && (
                  <button className="upgrade-button">Upgrade</button>
                )}

                {activeSubscription?.subscriptionStatus === 'trial' && 
                  activeSubscription?.subscriptionTrialExpiryDate && (
                    <div className="trial-end-date">
                      Trial ends: {new Date(activeSubscription.subscriptionTrialExpiryDate).toLocaleDateString()}
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>

        <div className="protected-content-section">
          <h2>Your Trading Resources</h2>
          <p className="welcome-message">
            Access all your premium trading resources and tools below.
          </p>
          
          <div className="protected-features-grid">
            <div className="protected-feature-item">
              <h3>Educational Materials</h3>
              <p>Access comprehensive trading guides, market analysis reports, and strategy documentation.</p>
              <Link to="/my-subscriptions/study-course" className="feature-access-button">Access Materials</Link>
            </div>
            
            <div className="protected-feature-item">
              <h3>Trading Software</h3>
              <p>Download and access our proprietary trading software with real-time market data and analysis tools.</p>
              <Link to="/my-subscriptions/software" className="feature-access-button">Download Software</Link>
            </div>
            
            <div className="protected-feature-item">
              <h3>Live Trading Rooms</h3>
              <p>Join our live trading sessions where you can watch expert traders in action and ask questions in real-time.</p>
              <button className="feature-access-button">Enter Trading Room</button>
            </div>
            
            {getActiveSubscription()?.productId && (
              <div className="protected-feature-item premium-feature">
                <h3>Semi-Automated Trading</h3>
                <p>Access our advanced semi-automated trading features with preset strategies and risk management.</p>
                <button className="feature-access-button premium">Access Premium Tools</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;