import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PaymentForm from '../../components/PaymentForm';
import toast from 'react-hot-toast';
import './SelfStudyPage.css';

const SelfStudyPage: React.FC = () => {
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const SELF_STUDY_COURSE_ID = 'df44da9d-48ad-4fa9-989d-0b2b7029ee2d';

  useEffect(() => {
    // Check if user has access to this course
    if (user?.courses) {
      const courseAccess = user.courses.find(
        course => course.courseId === SELF_STUDY_COURSE_ID && course.accessGranted
      );
      setHasAccess(!!courseAccess);
    }
  }, [user]);

  const handlePurchaseClick = () => {
    if (!user) {
      toast.error('Please login to purchase the course');
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setHasAccess(true);
    toast.success('Welcome to the Self-Study Course! Access granted.');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <div className="self-study-page">
        <div className="container">
          <PaymentForm
            productType="course"
            productId={SELF_STUDY_COURSE_ID}
            amount={500}
            productName="Self-Study Course"
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="self-study-page">
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
              This self-paced course comes with three-month access to cutting-edge trading software. We have six thorough video courses that will take you through the AOMTrading methodology.
            </p>
{hasAccess ? (
              <div className="access-granted">
                <span className="access-badge">✓ Access Granted</span>
                <p>Welcome back! You have full access to the course materials.</p>
              </div>
            ) : (
              <button onClick={handlePurchaseClick} className="purchase-button">
                Purchase Course - $500
              </button>
            )}
          </div>
        </div>

        <div className="course-details">
          <div className="prerequisites">
            <h2>Prerequisites</h2>
            <div className="prereq-content">
              <div className="prereq-text">
                <h3>Basic operational knowledge of NinjaTrader 8 platform</h3>
                <ul>
                  <li>Indicators installation process</li>
                  <li>Work space configurations</li>
                  <li>Acquiring Machine IDs</li>
                </ul>
                
                <h4>Using basic analytical tools like:</h4>
                <ul>
                  <li>Market Structure</li>
                  <li>Support and Resistance</li>
                  <li>Demand Supply</li>
                  <li>Trend Lines</li>
                </ul>
              </div>

              <div className="prereq-content-right">
                &nbsp;
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2>Content</h2>
          
            <div className="content-container">
              <div className="content-category">
                <div className='tech-content-img'>&nbsp;</div>
                
                <div className=''>
                  <ul>
                    <li><h3>Technical Content</h3></li>
                    <li>AOMtrading Methodology /w Multi-timeframe Analysis</li>
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
              </div>
              
              <div className="content-category">
                <ul>
                  <li><h3>Material Content</h3></li>
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
              <div className="skills-img">
                &nbsp;
              </div>
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
              <ul className="expectations-list">
                <li>✓ To do Consistent Multi-Timeframe Analysis utilizing Top-Down approach.</li>
                <li>✓ To identify Top Probability entry for personal trading style</li>
                <li>✓ To develop Rules based system to fit your personal trading style</li>
                <li>✓ To apply Top Down expectancy strategy for consistent probability</li>
                <li>✓ To search in Trader Journaling</li>
                <li>✓ To get your application based on Technology Use</li>
              </ul>
              <div className="expectations-img">&nbsp;</div>
            </div>
          </div>

          {hasAccess && (
            <div className="paid-content-section">
              <h2>Course Materials</h2>
              <div className="paid-content-grid">
                <div className="content-module">
                  <h3>📚 Video Training Series</h3>
                  <p>Access to 20+ detailed training videos</p>
                  <a href="https://your-training-platform.com/videos" target="_blank" rel="noopener noreferrer" className="content-link">
                    Access Videos
                  </a>
                </div>
                
                <div className="content-module">
                  <h3>📖 Trading Manual</h3>
                  <p>Complete AOM Trading methodology guide</p>
                  <a href="https://your-content-host.com/manual.pdf" target="_blank" rel="noopener noreferrer" className="content-link">
                    Download Manual
                  </a>
                </div>
                
                <div className="content-module">
                  <h3>📊 Trading Templates</h3>
                  <p>Journal templates and analysis tools</p>
                  <a href="https://your-content-host.com/templates.zip" target="_blank" rel="noopener noreferrer" className="content-link">
                    Download Templates
                  </a>
                </div>
                
                <div className="content-module">
                  <h3>📈 Live Examples</h3>
                  <p>Real chart screenshots and analysis</p>
                  <a href="https://your-training-platform.com/examples" target="_blank" rel="noopener noreferrer" className="content-link">
                    View Examples
                  </a>
                </div>
              </div>
              
              <div className="support-section">
                <h3>📧 Get Support</h3>
                <p>Need help with the course materials? Contact your instructor:</p>
                <a href="mailto:support@aomtrading.com" className="support-link">
                  Email Support
                </a>
              </div>
            </div>
          )}

{!hasAccess && (
            <div className="get-started-section">
              <div className="pricing-info">
                <h3>Get Started for only $500</h3>
                <div className="pricing-details">
                  <p>The following Content is included in the Program Price:</p>
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
                
                {user ? (
                  <button onClick={handlePurchaseClick} className="signup-button white large">
                    Purchase Course - $500
                  </button>
                ) : (
                  <Link to="/login" className="signup-button white large">
                    Login to Purchase
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfStudyPage;