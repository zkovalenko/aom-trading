import React from 'react';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1>Learn Professionally Developed Trading Strategies</h1>
            <Link to="/learn-to-trade" className="cta-button">Start Learning</Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2>OUR SERVICES</h2>
          <p className="services-intro">
            Trading is a skill. At AOMTrading, we can build from you have no knowns. We focus on building skill development using our proprietary methodology.
          </p>
          
          <div className="services-grid">

            <div className="service-card">
              <div className="service-icon">🎓</div>
              <h3>Services</h3>
              <p>
                <strong>Self-Study Program:</strong> Learn the AOMTrading methodology with our comprehensive training materials.
              </p>
              <p>
                Access the AOMTrading methodology.
              </p>
              <p>
                <strong>Trading:</strong> Once you have Trading self class Trading.
              </p>
              <Link to="/learn-to-trade" className="service-button">LEARN MORE</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">👨‍🏫</div>
              <h3>Tutoring</h3>
              <p>
                We provide individual or group Training to supplement your learning experience.
              </p>
              <p>
                You will gain knowledge and understanding about fundamentals of trading.
              </p>
              <Link to="/tutoring" className="service-button">LEARN MORE</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Become Consistent Trader Section */}
      <section className="consistent-trader">
        <div className="container">
          <div className="consistent-content">
            <div className="consistent-text">
              <h2>Become a Consistent Trader</h2>
              <h3>Your AOMTrading Ways</h3>
              <p>
                Our methodology helps reduce emotional reaction and provides systematic approach to trading using proven strategies.
              </p>
              <p>
                You will have the flexibility to select the time-frames and set your alert assistance to progress quickly. There is automation in the learning process to assist on chart reading to find winning fast and also to grow.
              </p>
              <Link to="/learn-to-trade" className="cta-button">Apply To Trade</Link>
            </div>
            <div className="consistent-image">
              <div className="image-placeholder">
                <span>📊</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="founder-section">
        <div className="container">
          <h2>Meet the Founder of AOMTrading</h2>
          <h3>Alex Minkovich</h3>
          
          <div className="founder-content">
            <div className="founder-text">
              <p>
                He served as Vice Chairman, and was the CFO and founder of ZenithSoft LLC. He has more than 20 years of financial systems, business focus on large scale systems and solutions.
              </p>
              <p>
                I worked in tech-teams for more than 15 years before my first finance job. During the technology leadership and business experience as a CTO/CTO.
              </p>
              <p>
                I believe we all thrive and continue to show true financial gains. During the process to fully grow gains which I and found that my first experience of this approach.
              </p>
              <p>
                I do not sell the approach in a practical solution, but you do so from a marketing perspective. I want to deliver the highest value.
              </p>
              <p>
                I want to help out to trade the right approach, but do not do the right expectations and truly deliver to trade their own in memorable time. We treat consistency to learn more! 
                <Link to="/contact">Contact Alex!</Link>
              </p>
            </div>
            <div className="founder-video">
              <div className="video-placeholder">
                <div className="play-button">▶</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Resources */}
      <section className="trusted-resources">
        <div className="container">
          <h2>Trusted Resources</h2>
          <div className="resources-logos">
            <div className="resource-logo">KINETIC</div>
            <div className="resource-logo ninjatrader">NINJATRADER</div>
            <div className="resource-logo">thinkorswim</div>
          </div>
          <Link to="/resources" className="service-button">LEARN MORE</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>Client Testimonials</h2>
          <p className="testimonials-subtitle">
            Professional, knowledgeable supporting are website may rank for representation of other clients or customers 
            and is not a guarantee of future performance or success.
          </p>
          
          <div className="testimonial">
            <blockquote>
              "Taking classes with AOM Trading is the best thing I have done for my trading career. The strategies taught have been 
              taught me to much and I have been able to prove the to myself during classes and during self time trading. The classes 
              are well presented and very informative. I like the fact that we talk about risk management and position sizing as well. 
              I would highly recommend using this company!"
            </blockquote>
            <cite>- Sarah</cite>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;