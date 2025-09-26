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
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);

  useEffect(() => {
    const loadUserSubscriptions = async () => {
      if (!token) {
        console.log('⏳ Waiting for token - user:', !!user, 'token:', !!token);
        return;
      }
      
      console.log('✅ Loading subscriptions for authenticated user');
      console.log('🔍 Token value:', token ? 'Token exists' : 'No token');
      console.log('🔍 Token length:', token ? token.length : 0);
      
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
  }, [token]);

  useEffect(() => {
    const checkMethodologyDisclaimer = async () => {
      if (!token) return;
      
      try {
        const response = await apiCall('/auth/profile', { method: 'GET' }, token);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            if (!data.data.user.methodology_disclaimer_viewed) {
              setShowMethodologyModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to check methodology disclaimer status:', error);
      }
    };

    checkMethodologyDisclaimer();
  }, [token]);

  // Helper function to check if user has active subscription
  const hasActiveSubscription = () => {
    return userSubscriptions.some(sub => sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial');
  };

  // Helper function to get active subscription
  const getActiveSubscription = () => {
    return userSubscriptions.find(sub => sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial');
  };

  // Helper function to determine user's subscription tier
  const getSubscriptionTier = () => {
    const activeSubscription = getActiveSubscription();
    if (!activeSubscription) return null;

    // Check if it's premium based on subscription type or product name
    const subscriptionType = activeSubscription.subscriptionType?.toLowerCase() || '';
    const productName = activeSubscription.product?.name?.toLowerCase() || '';

    if (subscriptionType.includes('premium') || productName.includes('premium')) {
      return 'premium';
    }

    return 'basic';
  };

  // Handle methodology disclaimer acknowledgment (only when user agrees)
  const handleMethodologyDisclaimerAcknowledge = async () => {
    if (!token) {
      console.log('No token available');
      return;
    }
    
    console.log('Acknowledging methodology disclaimer...');
    try {
      const response = await apiCall('/auth/methodology-disclaimer', { 
        method: 'POST' 
      }, token);
      
      console.log('API response:', response.ok, response.status);
      if (response.ok) {
        console.log('Successfully acknowledged disclaimer, closing modal');
        setShowMethodologyModal(false);
      } else {
        console.error('API call failed with status:', response.status);
        // Close modal anyway for better UX
        setShowMethodologyModal(false);
      }
    } catch (error) {
      console.error('Failed to update methodology disclaimer status:', error);
      // Close modal anyway for better UX
      setShowMethodologyModal(false);
    }
  };

  // Handle methodology disclaimer dismiss (close without updating database)
  const handleMethodologyDisclaimerDismiss = () => {
    setShowMethodologyModal(false);
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscapePress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMethodologyModal) {
        handleMethodologyDisclaimerDismiss();
      }
    };

    document.addEventListener('keydown', handleEscapePress);
    return () => {
      document.removeEventListener('keydown', handleEscapePress);
    };
  }, [showMethodologyModal]);

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
            <a href="/learn-to-trade" className="subscribe-button">View Subscription Plans</a>
          </div>
        </div>
      </div>
    );
  }

  const activeSubscription = getActiveSubscription();
  const subscriptionTier = getSubscriptionTier();

  return (
    <div className="my-subscriptions-page">
      <div className="container">
        <div className="subscription-status-section">
          <div className="subscription-header">
            <h2>Your Subscription</h2>
            {subscriptionTier && (
              <span className={`tier-badge ${subscriptionTier === 'premium' ? 'tier-premium' : 'tier-basic'}`}>
                {subscriptionTier === 'premium' ? 'Premium' : 'Basic'}
              </span>
            )}
          </div>
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
              <Link to="/trading-rooms" className="feature-access-button">Enter Trading Room</Link>
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

        {/* Methodology Disclaimer Modal */}
        {showMethodologyModal && (
          <div className="modal-overlay" onClick={handleMethodologyDisclaimerDismiss}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Trading Methodology Disclaimer</h2>
                <button 
                  className="modal-close-btn"
                  onClick={handleMethodologyDisclaimerDismiss}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="disclaimer-content">
                  <div className="disclaimer-sections">
                  CFTC RULE 4.41 HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE INHERENT LIMITATIONS. UNLIKE AN ACTUAL PERFORMANCE RECORD, 
                  SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING. ALSO, SINCE THE TRADES HAVE NOT BEEN EXECUTED, 
                  THE RESULTS MAY HAVE UNDER-OR-OVER COMPENSATED FOR THE IMPACT, IF ANY, OF CERTAIN MARKET FACTORS, SUCH AS LACK OF LIQUIDITY. 
                  SIMULATED TRADING PROGRAMS IN GENERAL ARE ALSO SUBJECT TO THE FACT THAT THEY ARE DESIGNED WITH THE BENEFIT OF HINDSIGHT. 
                  NO REPRESENTATION IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO ACHIEVE PROFIT OR LOSSES SIMILAR TO THOSE SHOWN.

                  <p>Trading contains substantial risk and is not for every investor. An investor could potentially lose all or more than the initial investment. 
                    Risk capital is money that can be lost without jeopardizing one’s financial security or lifestyle. 
                    Only risk capital should be used for trading and only those with sufficient risk capital should consider trading. 
                    Past performance is not necessarily indicative of future results. All Software provided or purchased is strictly for educational purposes only. 
                    Any presentation (live or recorded) is for educational purposes only and the opinions expressed are those of the presenter only. 
                    Testimonials may not be representative of the experience of other clients or customers and is not a guarantee of future performance or success.
                  </p>
                  </div>
                  
                  <div className="disclaimer-agreement">
                    <p><strong>By proceeding, you acknowledge that you have read, understood, and agree to these terms.</strong></p>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="modal-btn primary" 
                  onClick={handleMethodologyDisclaimerAcknowledge}
                >
                  I Understand and Agree
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptions;
