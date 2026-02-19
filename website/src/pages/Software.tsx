import React, { useState, useEffect, useMemo } from 'react';
import { apiCall, useAuth } from '../contexts/AuthContext';
import './Software.css';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DOWNLOAD_FILES } from '../services/downloads';
import aomBBWavesImage from '../assets/aomBBWaves.png';
import aomSDZonesImage from '../assets/aomSDZones.png';
import aomManualStrategyImage from '../assets/aomManualStrategy.png';

const Software: React.FC = () => {
  const { user, token } = useAuth();
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  // Fetch user subscriptions to determine if premium
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user || !token) return;

      try {
        const response = await apiCall('/subscriptions/my-subscriptions', { method: 'GET' }, token);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserSubscriptions(data.data.subscriptions);

            // Check if user has active premium subscription
            const activeSubscription = data.data.subscriptions.find((sub: any) =>
              sub.subscriptionStatus === 'active' || sub.subscriptionStatus === 'trial'
            );

            if (activeSubscription) {
              const productName = activeSubscription.productName?.toLowerCase() || '';
              setIsPremiumUser(productName.includes('premium'));
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      }
    };

    fetchSubscriptions();
  }, [user, token]);

  const FILES = useMemo(() => ({
    latest: {
      version: '1.4.2',
      releaseDate: 'Dec 2024',
      zipFilename: isPremiumUser ? DOWNLOAD_FILES.latestPremiumSoftware.fileName : DOWNLOAD_FILES.latestSoftware.fileName,
      chartId: DOWNLOAD_FILES.latestCharts.id,
      chartFilename: DOWNLOAD_FILES.latestCharts.fileName,
      buttonLabel: isPremiumUser ? 'Premium Download' : 'Download',
    },
    previous: {
      version: '1.4.10',
      releaseDate: 'Jan 2024',
      zipFilename: isPremiumUser ? DOWNLOAD_FILES.previousPremiumSoftware.fileName : DOWNLOAD_FILES.previousSoftware.fileName,
      chartId: DOWNLOAD_FILES.previousCharts.id,
      chartFilename: DOWNLOAD_FILES.previousCharts.fileName,
      buttonLabel: isPremiumUser ? 'Premium Download' : 'Download',
    },
  }), [isPremiumUser]);
  
  const downloadSoftware = async (fileName: string) => {
    try {
      const response = await apiCall(
        '/download',
        {
          method: 'POST',
          body: JSON.stringify({
            fileName
          }),
        },
        token
      );

      if (!response.ok) {
        const errorText = await response.text();
        let message = `Failed to download: ${fileName}`;

        try {
          const parsed = JSON.parse(errorText);
          message = parsed?.message || message;
        } catch (jsonError) {
          if (errorText) {
            message = errorText;
          }
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = fileName;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('All set! Your download is ready.');
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to download: ${fileName}`;
      toast.error(message);
    }
  };

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
          <h1>{isPremiumUser ? 'Premium AOMTrading Software Suite' : 'AOMTrading Software Suite'}</h1>
          <p className="software-subtitle">Our proprietary Trading Software Suite complements the AOM methodology by turning concepts into practice with real-time market tools. Our subscribers receive a complimentary license that stays active as long as their subscription remains current, ensuring seamless access to the same technology our experts use to analyze, plan, and execute trades with consistency.
          </p>
        </div>

        <section className="software-suite">
          <h2>Included Tools</h2>
          <div className="suite-grid">
            <div className="suite-card">
              <h3>Wave Analyzer</h3>
              <p></p>
              <ul>
                <li>Automatically detects market waves and identifies bullish or bearish phases.</li>
              </ul>
            </div>

            <div className="suite-card">
              <h3>Automatic Drawing of the Structure</h3>
              <ul>
                <li>Plots key pivots, trend lines, and state boxes to reveal directional bias.</li>
              </ul>
            </div>

            <div className="suite-card">
              <h3>Support & Resistance Engine</h3>
              <ul>
                <li>Plots key pivots, trend lines, and state boxes to reveal directional bias.</li>
              </ul>
            </div>

            <div className="suite-card">
              <h3>Automatic Supply/Demand Zones</h3>
              <ul>
                <li>Smart Zone Detection – Automatically highlights high-probability trading zones.</li>
                <li>Dynamic Updates – Zones adjust in real-time as prices evolve.</li>
                <li>Strength Ratings – Each zone is ranked for reliability, so you know which levels matter most.</li>
              </ul>
            </div>


            <div className="suite-card">
              <h3>Multitime frame analysis configurator</h3>
              <ul>
                <li>Boundary Time Frame (For Major Reversal)</li>
                <li>Analysis Time Frame (Main Focus)</li>
                <li>Execution Time Frame (For trade Entry)</li>
                <li>Configuration of Boundary and Analysis Zones Visibility</li>
                <li>Allows you to watch only one chart where other significant time frame become visible</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="software-suite">
          <div className="suite-grid hor">
            <div className="suite-card">
              <h3>aomBBWaves</h3>
              <p>
                aomBBWaves indicator automatically draws Bullish/Bearish Zone formation. 
                This indicator is optimized to work the best on Renko, Range, and Tick based charts but will work on any other charts. 
                Zones are divided into Conservative and Aggressive ones Automatic measurement of Overnight Gaps Manual Zone selection Sound Alert
              </p>
            </div>
            <div className="suite-card">
              <h3>aomSDZones</h3>
              <p>
                aomSDZones indicator automatically draws Supply/Demand Zone formation.
                This indicator is optimized to work the best on Renko, Range, and Tick based charts
                but will work on any other charts  
                Zones are divided into Conservative and Aggressive ones 
                Automatic measurement of Overnight Gaps
                Manual Zone selection
                Sound Alert
              </p>
              <img src={aomSDZonesImage} alt="aomSDZones indicator"/>

            </div>
            <div className="suite-card">
              <h3>aomManualStrategy</h3>
              <p>
                This indicator provides semi-automatic order placement based on preconfigured ATM strategy.
                There are two configurable signals to allow get into the trade:
                Consolidation (Rbr/Bbd) presented as a Dash on the chart
                Adaptive Reversal (ADP) presented as an Arrows on the chart
              </p>
              <img src={aomManualStrategyImage} alt="aomManualStrategy indicator"/>

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
            <h3>Software - Version {FILES.latest.version}</h3>
            <div className="software-features">
              <span className="feature"><b>Release Notes:</b></span>
              <span className="feature">✓ Improved structure formation for greater accuracy</span>
              <span className="feature">✓ New Origin Zone mechanism aligned with Swing High/Low</span>
              <span className="feature">✓ Introduced a new algorithm optimized for time-based charts</span>
              <span className="feature">✓ Added flexibility to configure any algorithm for different bar types</span>
              <span className="feature">✓ Implemented an Event Engine for better system responsiveness</span>
              <span className="feature">✓ Enhanced zone qualification to improve trade setup validation</span>
            </div>
            <div className="software-actions">
              <button
                className={`feature-access-button ${isPremiumUser ? 'premium' : ''}`}
                onClick={() => downloadSoftware(FILES.latest.zipFilename)}
              >
                {FILES.latest.buttonLabel}
              </button>
              <span className="version-info">Version {FILES.latest.version} • Updated {FILES.latest.releaseDate}</span>
              <button
                type="button"
                className="download-link"
                onClick={() => {
                  downloadSoftware(FILES.latest.chartFilename);
                }}
              >
                Download Chart Templates
              </button>
            </div>
          </div>

          <div className="software-card">
            <div className="software-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7H5c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM5 20V6h14v14H5z"/>
              </svg>
            </div>
            <h3>Software - Version {FILES.previous.version}</h3>
            <div className="software-features">
            <span className="feature"><b>Release Notes:</b></span>
            <span className="feature">✓ Added Select–Unselect Zones in aomSDZones</span>
            <span className="feature">✓ Introduced Trigger Line in aomManualStrategy</span>
            <span className="feature">✓ Added Dynamic Zone Adjustment in aomSDZones</span>
            <span className="feature">✓ Added Support/Resistance Lines in aomStrAndBBWaves</span>
            <span className="feature">✓ Enhanced aomSDZones with opacity control for selected zones</span>
            <span className="feature">✓ Enhanced aomSDZones with option to make current zones global</span>
            {/* <span className="feature">✓ Improved algorithm for zone duplication</span>
            <span className="feature">✓ Redesigned wave formation algorithm using structural pivots</span>
            <span className="feature">✓ Added Order Type Protection in aomManualStrategy (prevents mismatches between signals and order types)</span> */}

            </div>
            <div className="software-actions">
            <button
                className={`feature-access-button ${isPremiumUser ? 'premium' : ''}`}
                onClick={() => downloadSoftware(FILES.previous.zipFilename)}
              >
                {FILES.previous.buttonLabel}
              </button>
              <span className="version-info">Version {FILES.previous.version} • Updated {FILES.previous.releaseDate}</span>
              <button
                type="button"
                className="download-link"
                onClick={() => {
                  downloadSoftware(FILES.previous.chartFilename);
                }}
              >
                Download Chart Templates
              </button>
            </div>
          </div>
        </div>

        <div className="system-requirements">
          <h3>Minimum PC Requirements</h3>
          
          <div className="requirements-grid">
            <div className="req-section">
              <ul>
                <li>Windows 10, Windows 11, Windows Server 2016 or later</li>
                <li>2 gigahertz (GHz) or faster 32-bit or 64-bit processor (preferable)</li>
                <li>16GB RAM (32 GB is recommended)</li>
                <li>Internet connection required</li>
              </ul>
            </div>

            <div className="req-section">
              <ul>
                <li>Microsoft .NET Framework 4.8
                (pre-installed on most PC’s and can be downloaded here:  
                <a href="https://www.microsoft.com/en-us/download/details.aspx?id=30653" 
                target="_blank" 
                rel="noopener noreferrer">Microsoft .NET Framework</a>
                )</li>
                <li>Screen resolution of 1024 x 768</li>
                <li>A DirectX10 10-compatible graphics card is highly recommended</li>
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
