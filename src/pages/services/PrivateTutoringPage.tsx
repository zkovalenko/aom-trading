import React from 'react';
import { Link } from 'react-router-dom';
import './PrivateTutoringPage.css';

const PrivateTutoringPage: React.FC = () => {
  return (
    <div className="private-tutoring-page">
      <div className="container">
        <h1>Private Tutoring</h1>
        
        <div className="service-intro">
          <div className="service-video">
            <div className="video-placeholder">
              <div className="aom-logo">AOM TRADING</div>
              <div className="play-button">
                <span>Private Tutoring Overview</span>
                <div className="play-icon">▶</div>
              </div>
            </div>
          </div>
          
          <div className="service-description">
            <h2>One-on-One Private Tutoring</h2>
            <p>
              Get personalized training with our expert traders. This intensive program provides direct access to professional mentorship, customized learning plans, and real-time trading guidance tailored to your specific needs and goals.
            </p>
            <Link to="/signup" className="signup-button">Get Started</Link>
          </div>
        </div>

        <div className="service-details">
          <div className="what-included">
            <h2>What's Included</h2>
            <div className="included-content">
              <div className="included-list">
                <ul>
                  <li>✓ Weekly 1-on-1 sessions with expert trader</li>
                  <li>✓ Personalized trading strategy development</li>
                  <li>✓ Real-time market analysis and guidance</li>
                  <li>✓ Custom risk management plan</li>
                  <li>✓ Direct access via phone/email support</li>
                  <li>✓ Progress tracking and performance review</li>
                  <li>✓ Access to exclusive trading tools</li>
                  <li>✓ Flexible scheduling to fit your needs</li>
                </ul>
              </div>
              <div className="included-image">&nbsp;</div>
            </div>
          </div>

          <div className="program-structure">
            <h2>Program Structure</h2>
            <div className="structure-grid">
              <div className="structure-item">
                <div className="structure-icon">📈</div>
                <h3>Assessment Phase</h3>
                <p>Comprehensive evaluation of your current trading skills, goals, and risk tolerance to create a personalized learning path.</p>
              </div>
              
              <div className="structure-item">
                <div className="structure-icon">🎯</div>
                <h3>Strategy Development</h3>
                <p>Work directly with your mentor to develop and refine trading strategies that match your personality and market style.</p>
              </div>
              
              <div className="structure-item">
                <div className="structure-icon">📊</div>
                <h3>Live Trading Sessions</h3>
                <p>Practice trading in real-time with your mentor, receiving immediate feedback and guidance on your decisions.</p>
              </div>
              
              <div className="structure-item">
                <div className="structure-icon">🔄</div>
                <h3>Continuous Improvement</h3>
                <p>Regular performance reviews and strategy adjustments to ensure consistent progress and profitability.</p>
              </div>
            </div>
          </div>

          <div className="benefits-section">
            <h2>Benefits of Private Tutoring</h2>
            <div className="benefits-content">
              <div className="benefits-image">&nbsp;</div>
              <ul className="benefits-list">
                <li>🚀 Accelerated learning with personalized attention</li>
                <li>💡 Direct access to professional trading insights</li>
                <li>⚡ Real-time feedback and course corrections</li>
                <li>🎯 Customized strategies for your trading style</li>
                <li>📞 Ongoing support and mentorship</li>
                <li>📈 Faster path to consistent profitability</li>
              </ul>
            </div>
          </div>

          <div className="pricing-section">
            <div className="pricing-info">
              <h3>Private Tutoring Packages</h3>
              <div className="pricing-tiers">
                <div className="pricing-tier">
                  <h4>Starter Package</h4>
                  <div className="price">$2,500/month</div>
                  <ul>
                    <li>✓ 4 one-hour sessions per month</li>
                    <li>✓ Email support</li>
                    <li>✓ Trading plan development</li>
                    <li>✓ Performance tracking</li>
                  </ul>
                  <Link to="/signup" className="signup-button">Choose Plan</Link>
                </div>
                
                <div className="pricing-tier featured">
                  <div className="featured-badge">Most Popular</div>
                  <h4>Professional Package</h4>
                  <div className="price">$4,000/month</div>
                  <ul>
                    <li>✓ 8 one-hour sessions per month</li>
                    <li>✓ Phone & email support</li>
                    <li>✓ Live trading sessions</li>
                    <li>✓ Custom strategy development</li>
                    <li>✓ Market analysis reports</li>
                  </ul>
                  <Link to="/signup" className="signup-button">Choose Plan</Link>
                </div>
                
                <div className="pricing-tier">
                  <h4>Elite Package</h4>
                  <div className="price">$6,500/month</div>
                  <ul>
                    <li>✓ Unlimited sessions</li>
                    <li>✓ 24/7 support access</li>
                    <li>✓ Daily market briefings</li>
                    <li>✓ Advanced strategy development</li>
                    <li>✓ Portfolio management guidance</li>
                  </ul>
                  <Link to="/signup" className="signup-button">Choose Plan</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateTutoringPage;