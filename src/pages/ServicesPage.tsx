import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesPage.css';

const ServicesPage: React.FC = () => {
  return (
    <div className="services-page">
      <div className="container">
        <h1>Self-Study Course</h1>
        
        <div className="course-intro">
          <div className="course-video">
            <div className="video-placeholder">
              <div className="aom-logo">AOM TRADING</div>
              <div className="play-button">
                <span>Phase 0 - Introduction</span>
                <div className="play-icon">▶</div>
              </div>
            </div>
          </div>
          
          <div className="course-description">
            <h2>Self-Study Course</h2>
            <p>
              This self-paced course comes with three-month access to online video training courses. We have over 20 videos walking you through the AOMTrading methodology.
            </p>
            <Link to="/signup" className="signup-button">Sign up now!</Link>
          </div>
        </div>

        <div className="course-details">
          <div className="prerequisites">
            <h2>Prerequisites</h2>
            <div className="prereq-content">
              <div className="prereq-text">
                <h3>Basic operational knowledge of NinjaTrader 8 platform</h3>
                <ul>
                  <li>Order entry and general operations</li>
                  <li>Work space configurations</li>
                  <li>A typical Machine for:</li>
                </ul>
                
                <h4>Using basic analytical tools like:</h4>
                <ul>
                  <li>Market Structure</li>
                  <li>Support and Resistance</li>
                  <li>Demand Supply</li>
                  <li>Trend Lines</li>
                </ul>
              </div>
              <div className="prereq-icons">
                <div className="step-indicator">
                  <div className="step active">1</div>
                  <div className="step">2</div>
                  <div className="step">3</div>
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Content</h2>
            <div className="content-grid">
              <div className="content-category">
                <h3>Technical Content</h3>
                <div className="content-icon">👩‍💻</div>
                <ul>
                  <li>AOMtrading Methodology</li>
                  <li>AOMtrading Methodology Multi-timeframe Analysis</li>
                  <li>Supply / Demand identification and analysis, Zone placement</li>
                  <li>Market Structure identification and analysis</li>
                  <li>Wave Analysis (Fibonacci based approach)</li>
                  <li>Support Resistance</li>
                  <li>Trader Setups</li>
                  <li>Risk Management principles</li>
                  <li>Position Sizing principles</li>
                  <li>Expectancy Model</li>
                  <li>Analyzing Machine list</li>
                </ul>
              </div>
              
              <div className="content-category">
                <h3>Material Content</h3>
                <ul>
                  <li>11 Classes with Total 20+ Videos of detailed Explanation of AOMtrading methodology</li>
                  <li>Trading Manual/Formula</li>
                  <li>Trading Rules Explanation</li>
                  <li>Trading Rule Application - How to Trade and Expectancy Model</li>
                  <li>Market Analysis and Chart interpretation</li>
                  <li>1 document meetings with the coach, by request</li>
                  <li>play Installation support</li>
                  <li>Email support / Chat of strategies</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="skills-section">
            <h2>Skills Gained</h2>
            <div className="skills-content">
              <div className="skills-icon">⚙️</div>
              <ul className="skills-list">
                <li>✓ To do Consistent Multi-Timeframe Analysis utilizing Top-Down approach.</li>
                <li>✓ To identify Top Probability entry for personal trading style</li>
                <li>✓ To identify and set Top management entry positions</li>
                <li>✓ To develop Rules based system to fit your personal trading style</li>
                <li>✓ To apply Top Down expectancy strategy for consistent Top profitability</li>
                <li>✓ To get your application based on Technology Use</li>
              </ul>
            </div>
          </div>

          <div className="expectations-section">
            <h2>What to Expect</h2>
            <div className="expectations-content">
              <div className="expectations-icon">👨‍💼</div>
              <ul className="expectations-list">
                <li>✓ To do Consistent Multi-Timeframe Analysis utilizing Top-Down approach.</li>
                <li>✓ To identify Top Probability entry for personal trading style</li>
                <li>✓ To develop Rules based system to fit your personal trading style</li>
                <li>✓ To apply Top Down expectancy strategy for consistent probability</li>
                <li>✓ To search in Trader Journaling</li>
                <li>✓ To get your application based on Technology Use</li>
              </ul>
            </div>
          </div>

          <div className="get-started-section">
            <h2>Get Started</h2>
            <div className="pricing-info">
              <h3>Price: $500</h3>
              <div className="pricing-details">
                <p><strong>The following Content is included in the Program Price:</strong></p>
                <ul>
                  <li>✓ Online Access to more than 20 Videos of detailed Explanation of AOMtrading Methodology</li>
                  <li>✓ Trading Manual</li>
                  <li>✓ Online Access to Online Course</li>
                  <li>✓ Triple Journal Template with Built-in CSV and Expectation Analysis</li>
                  <li>✓ Live Chart Screenshots</li>
                  <li>✓ Personal help via Questions via Email</li>
                  <li>✓ 1 document meetings with the coach, by request</li>
                  <li>✓ My Email / Call system</li>
                  <li>✓ All material access</li>
                  <li>✓ 90+ day access period, Free of Charge</li>
              </ul>
              </div>
              
              <Link to="/signup" className="signup-button large">Sign up now!</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;