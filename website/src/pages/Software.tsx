import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Software.css';

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
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            </div>
            <h3>AOM Trading Pro</h3>
            <p>Our flagship trading platform with advanced charting, real-time data, and automated trading capabilities.</p>
            <div className="software-features">
              <span className="feature">✓ Real-time market data</span>
              <span className="feature">✓ Advanced charting tools</span>
              <span className="feature">✓ Automated strategies</span>
              <span className="feature">✓ Risk management</span>
            </div>
            <div className="software-actions">
              <button className="download-btn primary">Download for Windows</button>
              <button className="download-btn secondary">Download for Mac</button>
              <a href="#" className="version-info">Version 2.4.1 • Updated Dec 2024</a>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>Market Scanner</h3>
            <p>Scan thousands of instruments across multiple markets to find trading opportunities in real-time.</p>
            <div className="software-features">
              <span className="feature">✓ Multi-market scanning</span>
              <span className="feature">✓ Custom criteria</span>
              <span className="feature">✓ Alert system</span>
              <span className="feature">✓ Export results</span>
            </div>
            <div className="software-actions">
              <button className="download-btn primary">Download Scanner</button>
              <a href="#" className="version-info">Version 1.8.3 • Updated Nov 2024</a>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM5 20V6h14v14H5z"/>
              </svg>
            </div>
            <h3>Portfolio Analyzer</h3>
            <p>Track and analyze your trading performance with detailed statistics and risk metrics.</p>
            <div className="software-features">
              <span className="feature">✓ Performance tracking</span>
              <span className="feature">✓ Risk analysis</span>
              <span className="feature">✓ Trade journal</span>
              <span className="feature">✓ Reporting tools</span>
            </div>
            <div className="software-actions">
              <button className="download-btn primary">Download Analyzer</button>
              <a href="#" className="version-info">Version 1.2.5 • Updated Dec 2024</a>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3>Strategy Builder</h3>
            <p>Create and backtest custom trading strategies with our visual strategy builder tool.</p>
            <div className="software-features">
              <span className="feature">✓ Visual strategy builder</span>
              <span className="feature">✓ Backtesting engine</span>
              <span className="feature">✓ Strategy optimization</span>
              <span className="feature">✓ Live deployment</span>
            </div>
            <div className="software-actions">
              <button className="download-btn primary">Download Builder</button>
              <a href="#" className="version-info">Version 3.1.2 • Updated Dec 2024</a>
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
              <h4>📚 Documentation</h4>
              <p>Complete guides and tutorials for all our software tools.</p>
              <button className="support-btn">View Documentation</button>
            </div>
            <div className="support-option">
              <h4>🎥 Video Tutorials</h4>
              <p>Step-by-step video guides to get you started quickly.</p>
              <button className="support-btn">Watch Tutorials</button>
            </div>
            <div className="support-option">
              <h4>💬 Live Support</h4>
              <p>Get help from our technical support team during business hours.</p>
              <button className="support-btn">Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Software;