import React, { useState } from 'react';
import './SoftwarePage.css';

const SoftwarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('SOFTWARE SUITE');

  const tabs = [
    'SOFTWARE SUITE',
    'SOFTWARE FUNCTIONS', 
    'PC REQUIREMENTS',
    'COMPLEMENTARY STUFF',
    'INSTALLATION MANUAL'
  ];

  return (
    <div className="software-page">
      <div className="container">
        <h1>SOFTWARE</h1>
        
        <div className="software-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="software-content">
          <div className="pricing-section">
            <h2>Pricing</h2>
            <ul className="pricing-list">
              <li>$1500 - Lifetime SW License</li>
              <li>$150/year - SW Maintenance</li>
              <li>First year maintenance - FREE</li>
            </ul>
          </div>

          <div className="purchase-section">
            <h2>Purchase the Lifetime Software License</h2>
            <button className="purchase-button">CLICK HERE TO PURCHASE</button>
            
            <div className="software-content-box">
              <h3>Lifetime Software Suite Content</h3>
              <div className="content-text">
                <p>
                  <strong>AOMtrading SW</strong> is a toolbox for Rule-based trading Systems development.
                </p>
                <p>
                  It allows the development of turn-key solutions and complements our teaching methodology.
                </p>
                <p>
                  Core SW components allow users to set the Boundary Time frame, Analysis Time frame, and Execution Time frame to execute the Top-Down approach.
                </p>
                <p>
                  The SW seamlessly walks the user from a high probability Zone selection to semiautomated order placement and management processes.
                </p>
                <p>
                  Each High time frame allows seamless transfer of the <strong>analysis outcome</strong> to the next Lower level.
                </p>
                
                <div className="functionality-section">
                  <h4>aomMarketStrAndBBWaves functionality:</h4>
                  <ul>
                    <li>a. Automatically draw Market structure</li>
                    <li>b. Automatically draw Waves</li>
                    <li>c. Automatically draw Support and Resistance</li>
                  </ul>
                </div>
                
                <div className="functionality-section">
                  <h4>aomSDZones functionality:</h4>
                  <ul>
                    <li>a. Automatically draw Zones</li>
                    <li>b. Provide a mechanism for Zone management and adjustment</li>
                  </ul>
                </div>
                
                <div className="functionality-section">
                  <h4>aomManualStrategy functionality:</h4>
                  <ul>
                    <li>a. Trading Plan configuration</li>
                    <li>b. Trading Plan execution</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Member vs Non-Member Views */}
        <div className="member-section">
          <div className="member-downloads">
            <div className="download-section">
              <h3>Current Software Suite V 1.4.1</h3>
              <button className="download-button">DOWNLOAD SOFTWARE</button>
              <button className="download-button secondary">DOWNLOAD RELEASE NOTES</button>
            </div>
            
            <div className="download-section">
              <h3>Previous Software Suite V 1.3.2</h3>
              <button className="download-button">DOWNLOAD SOFTWARE</button>
              <button className="download-button secondary">DOWNLOAD RELEASE NOTES</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftwarePage;