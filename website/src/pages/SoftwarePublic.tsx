import React from 'react';
import './Software.css';
import { Link } from 'react-router-dom';

const SoftwarePublic: React.FC = () => {
  const latest = {
    version: '1.4.2',
    releaseDate: 'Dec 2024',
  };

  const previous = {
    version: '1.4.1',
    releaseDate: 'Jan 2024',
  };

  return (
    <div className="software-page">
      <div className="container">
        <div className="software-header">
          <h1>AOMTrading Software</h1>
          <p className="software-subtitle">
            Our software suite complements the AOMTrading teaching methodology and bridges the gap between
            instruction and live execution. Subscribers gain access to three licensed components plus supporting
            indicators to read structure, locate opportunity, and execute with confidence.
          </p>
        </div>

        <section className="software-suite">
          <h2>Included Tools:</h2>
          <div className="suite-grid">
            <div className="suite-card">
              <h3>Wave Analyzer</h3>
              <p>
                aomBBWaves indicators automatically break the chart into bullish and bearish waves, giving you a live
                map of market structure.
              </p>
              <ul>
                <li>Adjust the fractal nature of price movement to match your trading tempo.</li>
                <li>Surface wave formation, wave expansion, and wave reversal moments.</li>
              </ul>
            </div>

            <div className="suite-card">
              <h3>aomSDZones</h3>
              <p>
                aomSDZones works alongside aomBBWaves to automatically draw bullish and bearish zone formations that
                mirror institutional order flow.
              </p>
              <ul>
                <li>Optimized for Renko, Range, and Tick charts while flexible on time-based charts.</li>
                <li>Divides zones into conservative and aggressive entries for clearer decision making.</li>
                <li>Measures overnight gaps automatically and supports manual zone selection.</li>
                <li>Built-in sound alerts ensure you never miss a developing setup.</li>
              </ul>
            </div>

            <div className="suite-card">
              <h3>aomManualStrategy</h3>
              <p>
                aomManualStrategy streamlines semi-automatic order placement using your preferred ATM strategy so you
                can execute with speed and consistency.
              </p>
              <ul>
                <li>Consolidation (RBR/BBD) signals print as chart dashes to cue structured entries.</li>
                <li>Adaptive Reversal (ADP) signals render as arrows to spotlight turning points.</li>
              </ul>
            </div>
          </div>
        </section>

        <div className="software-grid">
          <div className="software-card primary">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM5 20V6h14v14H5z"/>
              </svg>
            </div>
            <h3>Software – Version {latest.version}</h3>
            <div className="software-features">
              <span className="feature"><b>Release Notes:</b></span>
              <span className="feature">✓ Improved structure formation for greater accuracy</span>
              <span className="feature">✓ New Origin Zone mechanism aligned with Swing High/Low</span>
              <span className="feature">✓ Time-frame agnostic algorithm enhancements</span>
              <span className="feature">✓ Event Engine overhaul for responsiveness</span>
            </div>
            <div className="software-actions">
              <span className="version-info">Version {latest.version} • Updated {latest.releaseDate}</span>
              <Link to="/learn-to-trade" className="feature-access-button">
                Subscribe to Download
              </Link>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM5 20V6h14v14H5z"/>
              </svg>
            </div>
            <h3>Software – Version {previous.version}</h3>
            <div className="software-features">
              <span className="feature"><b>Highlights:</b></span>
              <span className="feature">✓ Select/Unselect Zones refinements in aomSDZones</span>
              <span className="feature">✓ Trigger Line enhancements in aomManualStrategy</span>
              <span className="feature">✓ Dynamic zone adjustment options</span>
              <span className="feature">✓ Extended support/resistance tooling</span>
            </div>
            <div className="software-actions">
              <span className="version-info">Version {previous.version} • Updated {previous.releaseDate}</span>
              <Link to="/learn-to-trade" className="feature-access-button">
                View Plans
              </Link>
            </div>
          </div>
        </div>

        <div className="system-requirements">
          <h3>System Requirements</h3>
          <div className="requirements-grid">
            <div className="req-section">
              <h4>Windows</h4>
              <ul>
                <li>Windows 10 or later (64-bit)</li>
                <li>4 GB RAM minimum (8 GB recommended)</li>
                <li>2 GB available storage</li>
                <li>Internet connection required</li>
                <li>.NET Framework 4.8 or later</li>
              </ul>
            </div>
            <div className="req-section">
              <h4>macOS</h4>
              <ul>
                <li>macOS 11.0 (Big Sur) or later</li>
                <li>4 GB RAM minimum (8 GB recommended)</li>
                <li>2 GB available storage</li>
                <li>Internet connection required</li>
                <li>Intel or Apple Silicon processor</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="support-section">
          <h3>Ready to Trade Smarter?</h3>
          <div className="support-options">
            <div className="support-option">
              <h4>View Plans</h4>
              <p>Compare the Basic and Premium plans and choose the one that fits your goals.</p>
              <Link to="/learn-to-trade" className="support-btn">Explore Plans</Link>
            </div>
            <div className="support-option">
              <h4>Talk to Support</h4>
              <p>Have questions about the software or subscriptions? Our team is here to help.</p>
              <Link to="/support" className="support-btn">Contact Support</Link>
            </div>
            <div className="support-option">
              <h4>Stay in the Loop</h4>
              <p>Join the newsletter for product updates, new feature drops, and trading strategy sessions.</p>
              <Link to="/newsletter" className="support-btn">Subscribe</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwarePublic;
