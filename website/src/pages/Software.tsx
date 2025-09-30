import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Software.css';
import { Link } from 'react-router-dom';

const Software: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="software-page">
        <div className="container">
          <div className="no-access">Please log in to access the trading software.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="software-page">
      <div className="container">
        <div className="software-header">
          <h1>Trading Software</h1>
          <p className="software-subtitle">Advanced trading tools and platforms for professional traders</p>
        </div>

        <div className="software-grid">
          <div className="software-card primary">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM5 20V6h14v14H5z"/>
              </svg>
            </div>
            <h3>Software - Version 1.4.2</h3>
            <div className="software-features">
              <span className="feature">✓ Real-time market data</span>
              <span className="feature">✓ Advanced charting tools</span>
              <span className="feature">✓ Automated strategies</span>
              <span className="feature">✓ Risk management</span>
            </div>
            <div className="software-actions">
              <button className="feature-access-button">Download</button>
              <span className="version-info">Version 1.4.2 • Updated Dec 2024</span>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM5 20V6h14v14H5z"/>
              </svg>
            </div>
            <h3>Software - Version 1.4.1</h3>
            <div className="software-features">
              <span className="feature">✓ Performance tracking</span>
              <span className="feature">✓ Risk analysis</span>
              <span className="feature">✓ Trade journal</span>
              <span className="feature">✓ Reporting tools</span>
            </div>
            <div className="software-actions">
              <button className="feature-access-button">Download</button>
              <span className="version-info">Version 1.4.1 • Updated Jan 2024</span>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3>Charts Templates </h3>
            <div className="software-features">
              <span className="feature">✓ Visual strategy builder</span>
              <span className="feature">✓ Backtesting engine</span>
              <span className="feature">✓ Strategy optimization</span>
              <span className="feature">✓ Live deployment</span>
            </div>
            <div className="software-actions">
              <button className="feature-access-button">Download Charts</button>
              <span className="version-info">Version 3.1.2 • Updated Dec 2024</span>
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
          <h3>Need Help?</h3>
          <div className="support-options">
            <div className="support-option">
              <h4>Documentation</h4>
              <p>Complete guides and tutorials for all our software tools.</p>
              <a 
                href="https://drive.google.com/file/d/1muTHjGjXZBBpMzeDBF3mcbxTGWPWf4We/view?ths=true" 
                target="_blank" 
                rel="noopener noreferrer"
                className="support-btn"
              >
                Download Manual
              </a>
            </div>
            <div className="support-option">
              <h4>Video Tutorials (coming soon)</h4>
              <p>Step-by-step video guides to get you started quickly.</p>
              <button className="support-btn">Watch Tutorials</button>
            </div>
            <div className="support-option">
              <h4>Support</h4>
              <p>Get help from our technical support team during business hours.</p>
              <Link to="/support" className="support-btn">Contact Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Software;