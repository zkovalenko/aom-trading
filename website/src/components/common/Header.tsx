import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, apiCall } from '../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout, token } = useAuth();
  console.log("~~user",  user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const checkSubscriptions = async () => {
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
    };

    checkSubscriptions();
  }, [user, token]);

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-squares">
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
            <div className="square"></div>
          </div>
          <div className="logo-text">
            <span className="aom">AOM</span>
            <span className="trading">TRADING</span>
          </div>
        </Link>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <Link to="/learn-to-trade" className="nav-link" onClick={closeMenu}>Learn to Trade</Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>Contact Us</Link>
          
          {user ? (
            <div className="user-menu">
              {hasActiveSubscription && (
                <Link to="/my-subscriptions" className="nav-link" onClick={closeMenu}>
                  My Subscriptions
                </Link>
              )}
              <button onClick={() => { logout(); closeMenu(); }} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="nav-link signup-btn" onClick={closeMenu}>Sign Up</Link>
            </div>
          )}
        </nav>
        
        {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      </div>
    </header>
  );
};

export default Header;