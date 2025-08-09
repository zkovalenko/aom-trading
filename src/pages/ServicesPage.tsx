import React from 'react';
import { Link } from 'react-router-dom';
import './ServicesPage.css';

const ServicesPage: React.FC = () => {
  return (
    <div className="services-page">
      <div className="container">
        <h1>Our Trading Services</h1>
        <p className="services-intro">
          Choose the learning path that best fits your goals and schedule. From self-paced online courses 
          to intensive bootcamps, we have the right program to accelerate your trading career.
        </p>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">📚</div>
            <h2>Self-Study Course</h2>
            <div className="service-price">$500</div>
            <p>
              Self-paced online course with 3-month access to cutting-edge trading software. 
              Perfect for independent learners who prefer to study at their own pace.
            </p>
            <ul className="service-features">
              <li>✓ 20+ detailed video lessons</li>
              <li>✓ AOM Trading methodology</li>
              <li>✓ 90-day software access</li>
              <li>✓ Trading manual & templates</li>
              <li>✓ Email support</li>
            </ul>
            <Link to="/services/self-study" className="service-button">Learn More</Link>
          </div>

          <div className="service-card featured">
            <div className="featured-badge">Most Popular</div>
            <div className="service-icon">👨‍🏫</div>
            <h2>Private Tutoring</h2>
            <div className="service-price">From $2,500/month</div>
            <p>
              One-on-one mentorship with expert traders. Get personalized attention, 
              custom strategies, and real-time guidance tailored to your needs.
            </p>
            <ul className="service-features">
              <li>✓ Personal trading mentor</li>
              <li>✓ Weekly 1-on-1 sessions</li>
              <li>✓ Custom strategy development</li>
              <li>✓ Real-time market guidance</li>
              <li>✓ 24/7 support access</li>
            </ul>
            <Link to="/services/private-tutoring" className="service-button">Learn More</Link>
          </div>

          <div className="service-card">
            <div className="service-icon">🏋️‍♂️</div>
            <h2>Trading Bootcamp</h2>
            <div className="service-price">$8,500</div>
            <p>
              Intensive 8-week group program designed to fast-track your trading career. 
              Small class sizes and daily live sessions for maximum learning.
            </p>
            <ul className="service-features">
              <li>✓ 8-week intensive program</li>
              <li>✓ Daily live sessions (40 hours)</li>
              <li>✓ Maximum 12 students</li>
              <li>✓ Job placement assistance</li>
              <li>✓ Trading certification</li>
            </ul>
            <Link to="/services/bootcamp" className="service-button">Learn More</Link>
          </div>
        </div>

        <div className="comparison-section">
          <h2>Compare Our Services</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Self-Study</th>
                  <th>Private Tutoring</th>
                  <th>Bootcamp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Duration</td>
                  <td>Self-paced</td>
                  <td>Ongoing</td>
                  <td>8 weeks</td>
                </tr>
                <tr>
                  <td>Live Instruction</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Personal Mentor</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Group Learning</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Job Placement</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr>
                  <td>Certification</td>
                  <td>❌</td>
                  <td>❌</td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Start Your Trading Journey?</h2>
          <p>
            Not sure which program is right for you? Contact us for a free consultation 
            and we'll help you choose the best path forward.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">Get Started Today</Link>
            <Link to="/contact" className="cta-button secondary">Schedule Consultation</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;