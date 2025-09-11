import React from 'react';
import { Link } from 'react-router-dom';

const Homepage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            {/* <p className="h3-subtext"><i>In Just a few weeks</i></p>
            <h1>Become a Professional Trader</h1> */}
            <h1>Learn Professionally Developed Trading Strategies</h1>
            <p className="h3-subtext"><i>Learn. Trade. Repeat.</i></p>
            <Link to="/learn-to-trade" className="cta-button">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2>WHY AOM TRADING?</h2>
          <p className="services-intro">
          Trading is a skill. At AOMTrading, we take you from beginner to skilled trader with our proprietary approach and software.
          </p>
          
          <div className="services-grid">
            <div className="service-card">
              <h3>Proven Methodology</h3>
              <p>
                Guided self-study course designed for any level.
              </p>
              <p>
                AOMTrading methodology has been used by thousands of now successful traders.
              </p>
              
            </div>

            <div className="service-card">
              <h3>Proprietary Software</h3>
              <p>
                Learn the AOMTrading methodology with our comprehensive training materials.
              </p>
              <p>
                Access the AOMTrading methodology.
              </p>
            </div>

            <div className="service-card">
              <h3>Live Trading Rooms</h3>
              <p>
                We provide individual or group Training to supplement your learning experience.
              </p>
              <p>
                You will gain knowledge and understanding about fundamentals of trading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become Consistent Trader Section */}
      <section className="consistent-trader">
        <div className="container">
          <div className="consistent-content">
            <div className="consistent-image-back">
              <div className="consistent-image">&nbsp;
              </div>
            </div>
            <div className="consistent-text">
              <h2>LEARN FROM THE PROS</h2>
              <h3 className='h3-subtext'><i>AOMTrading Ways</i></h3>
              <p>
                Our methodology reduced emotional reaction and provides systematic approach to trading using proven strategies.
              </p>
              <p>
                You will have the flexibility to select the time-frames and set your alert assistance to progress quickly. There is automation in the learning process to assist on chart reading to find winning fast and also to grow.
              </p>
              <div className="cta-container">
                <Link to="/learn-to-trade" className="cta-button">Start Now</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="founder-section">
        <div className="container">
          <h2>Meet the Founder of AOMTrading</h2>
          
          <div className="founder-content">
            <div className="founder-text">
            <p>
              Alex is the CTO and founder of AOM Trading, bringing over 20 years of experience in financial systems and large-scale technology solutions.
            </p>
            <p>
              Before entering the world of finance, Alex led technology teams for more than two decades, combining technical leadership with deep business expertise.
            </p>
            <p>
              At AOM Trading, his focus is on teaching traders a disciplined, proven approach. With the support of his proprietary software, you’ll gain the tools to trade with confidence, set realistic expectations, and build the consistency needed for lasting success.
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
          <h2>Trusted Partners</h2>
          <div className="resources-logos">
            <div className="resource-logo">STRIPE</div>
            <div className="resource-logo ninjatrader">NINJATRADER</div>
            <div className="resource-logo">THINKORSWIM</div>
          </div>
        </div>
      </section>

      {/* Services */}
        <section className="services-description">
          <h2>Your Subscription Includes</h2>
          <div className="subscriptions">

          <div className="subscription">
            <div className="check">&#10003;</div> <div className="desc">Access to our training course with hands on practices </div>
          </div>
          <div className="subscription">
            <div className="check">&#10003;</div> <div className="desc">Access our trading software</div>
          </div>
          <div className="subscription">
            <div className="check">&#10003;</div> <div className="desc">Access to Trading Rooms based on your Subscription</div>
          </div>
          <div className="subscription">
            <div className="check">&#10003;</div> <div className="desc">Customer Support</div>
          </div>
        </div>
        <div className="cta-container">
                <Link to="/learn-to-trade" className="cta-button">Start Now</Link>
              </div>
      </section>
    </div>
  );
};

export default Homepage;