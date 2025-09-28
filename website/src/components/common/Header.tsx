import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, apiCall } from '../../contexts/AuthContext';
import LoginModal from '../../components/auth/LoginModal';
import SignupModal from '../../components/auth/SignupModal';

const Header: React.FC = () => {
  const { 
    user, 
    logout, 
    token,
    isLoginModalOpen,
    isSignupModalOpen,
    openLoginModal,
    openSignupModal,
    closeAuthModals,
    switchToSignupModal,
    switchToLoginModal
  } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const checkSubscriptions = useCallback(async () => {
    if (!user || !token) {
      setHasActiveSubscription(false);
      return;
    }

    try {
      const response = await apiCall('/subscriptions/my-subscriptions', { method: 'GET' }, token);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const subscriptions = data.data.subscriptions || [];
          const hasActive = subscriptions.some((sub: any) =>
            sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial'
          );
          setHasActiveSubscription(hasActive);
        }
      }
    } catch (error) {
      console.error('Failed to check subscriptions:', error);
      setHasActiveSubscription(false);
    }
  }, [token, user]);

  useEffect(() => {
    checkSubscriptions();
  }, [checkSubscriptions]);

  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      checkSubscriptions();
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, [checkSubscriptions]);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo"></Link>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <Link to="/learn-to-trade" className="nav-link" onClick={closeMenu}>Learn to Trade</Link>
          
          {user ? (
            <div className="user-menu">
              {hasActiveSubscription && (
                <>
                  <Link to="/my-subscriptions" className="nav-link" onClick={closeMenu}>
                    My Subscriptions
                  </Link>
                  <Link to="/trading-rooms" className="nav-link" onClick={closeMenu}>
                    Trading Rooms
                  </Link>
                  <Link to="/support" className="nav-link" onClick={closeMenu}>Support</Link>
                </>
              )}
              <button onClick={() => { logout(); closeMenu(); }} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <button
                type="button"
                className="nav-link signup-btn"
                onClick={() => { closeMenu(); openLoginModal(); }}
              >
                Login
              </button>
            </div>
          )}
        </nav>
        
        {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      </div>
      
      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeAuthModals}
        onSwitchToSignup={switchToSignupModal}
        onSuccess={() => {
          // Optional: redirect to a specific page after login
          navigate('/learn-to-trade');
        }}
      />
      
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={closeAuthModals}
        onSwitchToLogin={switchToLoginModal}
        onSuccess={() => {
          // Optional: redirect to a specific page after signup
          navigate('/learn-to-trade');
        }}
      />
    </header>
  );
};

export default Header;
