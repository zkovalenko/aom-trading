import React from 'react';
import { Link } from 'react-router-dom';
import './BootcampPage.css';

const BootcampPage: React.FC = () => {
  return (
    <div className="bootcamp-page">
      <div className="container">
        <h1>Trading Bootcamp</h1>
        
        <div className="service-intro">
          <div className="service-video">
            <div className="video-placeholder">
              <div className="aom-logo">AOM TRADING</div>
              <div className="play-button">
                <span>Bootcamp Preview</span>
                <div className="play-icon">▶</div>
              </div>
            </div>
          </div>
          
          <div className="service-description">
            <h2>Intensive Trading Bootcamp</h2>
            <p>
              Join our intensive 4-week group bootcamp designed to fast-track your trading career. Learn alongside other motivated traders in a structured, comprehensive program that covers everything from basics to advanced strategies.
            </p>
            <Link to="/signup" className="signup-button">Enroll Now</Link>
          </div>
        </div>

        <div className="service-details">
          <div className="program-overview">
            <h2>Program Overview</h2>
            <div className="overview-content">
              <div className="overview-text">
                <p>
                  Our Trading Bootcamp is an intensive 4-week program that transforms complete beginners into competent traders. 
                  With daily sessions, hands-on practice, and group collaboration, you'll gain the skills and confidence needed 
                  to trade professionally.
                </p>
                <div className="program-stats">
                  <div className="stat">
                    <div className="stat-number">4</div>
                    <div className="stat-label">Weeks</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">40</div>
                    <div className="stat-label">Hours</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">10</div>
                    <div className="stat-label">Max Students</div>
                  </div>
                  <div className="stat">
                    <div className="stat-number">95%</div>
                    <div className="stat-label">Success Rate</div>
                  </div>
                </div>
              </div>
              <div className="overview-image">&nbsp;</div>
            </div>
          </div>

          <div className="curriculum">
            <h2>4-week Curriculum</h2>
            <div className="curriculum-grid">
              <div className="week-item">
                <div className="week-number">Week 1</div>
                <h3>Foundation & Basics</h3>
                <ul>
                  <li>Market fundamentals</li>
                  <li>Trading terminology</li>
                  <li>Platform setup</li>
                  <li>Risk management basics</li>
                </ul>
              </div>
              
              <div className="week-item">
                <div className="week-number">Week 2</div>
                <h3>Technical Analysis</h3>
                <ul>
                  <li>Chart patterns</li>
                  <li>Support & resistance</li>
                  <li>Indicators & oscillators</li>
                  <li>Entry/exit strategies</li>
                </ul>
              </div>
              
              <div className="week-item">
                <div className="week-number">Week 3</div>
                <h3>Advanced Strategies</h3>
                <ul>
                  <li>Multi-timeframe analysis</li>
                  <li>Supply & demand zones</li>
                  <li>Market structure</li>
                  <li>Position sizing</li>
                </ul>
              </div>
              
              <div className="week-item">
                <div className="week-number">Week 4</div>
                <h3>Live Trading & Psychology</h3>
                <ul>
                  <li>Live trading sessions</li>
                  <li>Trading psychology</li>
                  <li>Performance analysis</li>
                  <li>Career planning</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bootcamp-features">
            <h2>What Makes Our Bootcamp Special</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">👥</div>
                <h3>Small Class Size</h3>
                <p>Maximum 12 students per cohort ensures personalized attention and meaningful interaction with instructors.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <h3>Live Trading</h3>
                <p>Practice with real money in a controlled environment with expert guidance and risk management.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <h3>Job Placement</h3>
                <p>Graduate with portfolio and connections. 80% of graduates secure trading positions within 6 months.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🏆</div>
                <h3>Certification</h3>
                <p>Receive official AOM Trading certification upon successful completion of the program.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💼</div>
                <h3>Trading Capital</h3>
                <p>Top performers may receive access to firm capital for funded trading opportunities.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">🔄</div>
                <h3>Ongoing Support</h3>
                <p>6 months of post-graduation mentorship and access to exclusive trading software.</p>
              </div>
            </div>
          </div>

          <div className="schedule-section">
            <h2>Schedule & Format</h2>
            <div className="schedule-content">
              <div className="schedule-details">
                <div className="schedule-item">
                  <h4>Daily Sessions</h4>
                  <p>Monday - Friday, 9:00 AM - 12:00 PM EST</p>
                </div>
                <div className="schedule-item">
                  <h4>Format</h4>
                  <p>Live online sessions with interactive trading simulations</p>
                </div>
              </div>
              <div className="next-cohorts">
                <h4>Upcoming Cohorts</h4>
                <div className="cohort-item">
                  <div className="cohort-date">March 15, 2026</div>
                  <div className="cohort-status available">6 spots available</div>
                </div>
                <div className="cohort-item">
                  <div className="cohort-date">May 10, 2026</div>
                  <div className="cohort-status available">8 spots available</div>
                </div>
                <div className="cohort-item">
                  <div className="cohort-date">July 22, 2026</div>
                  <div className="cohort-status available">12 spots available</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pricing-section">
            <div className="pricing-info">
              <h3>Bootcamp Training</h3>
              <div className="bootcamp-pricing">
                <div className="price-main">FREE</div>
                <div className="price-details">
                  <p>4-week intensive program</p>
                  <div className="included-items">
                    <h4>Everything Included:</h4>
                    <ul>
                      <li>✓ 40 hours of live instruction</li>
                      <li>✓ Daily trading simulations</li>
                      <li>✓ Personal trading account setup</li>
                      <li>✓ Professional trading software</li>
                      <li>✓ Course materials and resources</li>
                      <li>✓ 6 months post-graduation support</li>
                      <li>✓ Job placement assistance</li>
                      <li>✓ AOM Trading certification</li>
                    </ul>
                  </div>
                  
                  {/* <div className="payment-options">
                    <div className="payment-option">
                      <strong>Full Payment:</strong> $8,500 (save $375)
                    </div>
                    <div className="payment-option">
                      <strong>Payment Plan:</strong> $3,000 deposit + 4 monthly payments of $1,500
                    </div>
                  </div> */}
                </div>
              </div>
              
              <Link to="/signup" className="signup-button large">Reserve Your Spot</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootcampPage;