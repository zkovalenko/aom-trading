import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  console.log("~~user",  user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                Dashboard
              </Link>
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