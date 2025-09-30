import React from 'react';
import { apiCall, useAuth } from '../contexts/AuthContext';
import './Software.css';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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

  const FILES = {
    "latest": {
      version: "1.4.2",
      releaseDate: "Dec 2024",
      zipFileId: "1VaSEhORTOlpTPcVHzEiHr3sXB6FMn0Cl",
      zipFilename: "AOMtrading_1.4.2.zip",
      chartId: "17WO3pH862TPUF4ORVsF2yBi2lsy1TQdz",
      chartFilename: "Chart_templates_1.4.2.zip"
    },
    "previous": {
      version: "1.4.1",
      releaseDate: "Jan 2024",
      zipFileId: "1tM2C5KLcMe_gkXyB_iYtKbdAGL5NdgVY",
      zipFilename: "AOMtrading_1.4.10.zip",
      chartId: "1SKzYQuX-YMLtJlaKkT3BipBCt0J9ewA9",
      chartFilename: "Chart_templates_1.4.1.zip"
    }
  } as const;
  
  const downloadSoftware = async (fileId: string, fileName: string) => {
    try {
      const response = await apiCall('/download', {
        method: 'POST',
        body: JSON.stringify({
          fileId,
          fileName
        }),
      });

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

      toast.success('Your download should start automatically.');
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to download: ${fileName}`;
      toast.error(message);
    }
  };


  return (
    <div className="software-page">
      <div className="container">
        <div className="software-header">
          <h1>AOMTrading Software</h1>
          <p className="software-subtitle">Our Software complements AOMtrading teaching methodology and
          bridges the gap between instruction and real-time execution. The suite brings together three licensed components plus supporting indicators so you
            can read structure, locate opportunity, and execute with confidence.
          </p>
        </div>

        <section className="software-suite">
          <div className="suite-grid">
            <div className="suite-card">
              <h3>aomBBWaves</h3>
              <p>
                aomBBWaves indicators automatically break the chart into bullish and bearish waves,
                giving you a live map of market structure.
              </p>
              <ul>
                <li>Adjust the fractal nature of price movement to match your trading tempo.</li>
                <li>
                  Surface three setups: wave formation, wave expansion, and wave reversal moments.
                </li>
              </ul>
            </div>

            <div className="suite-card">
              <h3>aomSDZones</h3>
              <p>
                aomSDZones works alongside aomBBWaves to automatically draw bullish and bearish
                zone formations that mirror institutional order flow.
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
                aomManualStrategy streamlines semi-automatic order placement using your preferred
                ATM strategy.
              </p>
              <ul>
                <li>Consolidation (RBR/BBD) signals print as chart dashes to cue structured entries.</li>
                <li>Adaptive Reversal (ADP) signals render as arrows to highlight turning points.</li>
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
                className="feature-access-button"
                onClick={() => downloadSoftware(FILES.latest.zipFileId, FILES.latest.zipFilename)}
              >
                Download
              </button>
              <span className="version-info">Version {FILES.latest.version} • Updated {FILES.latest.releaseDate}</span>
              <button
                type="button"
                className="download-link"
                onClick={() => {
                  downloadSoftware(FILES.latest.chartId, FILES.latest.chartFilename);
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
                className="feature-access-button"
                onClick={() => downloadSoftware(FILES.previous.zipFileId, FILES.previous.zipFilename)}
              >
                Download
              </button>
              <span className="version-info">Version {FILES.previous.version} • Updated {FILES.previous.releaseDate}</span>
              <button
                type="button"
                className="download-link"
                onClick={() => {
                  downloadSoftware(FILES.previous.chartId, FILES.previous.chartFilename);
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
                <li>Windows 8, Windows 10, Windows Server 2012</li>
                <li>1 gigahertz (GHz) or faster 32-bit or 64-bit processor</li>
                <li>2GB RAM</li>
                <li>Internet connection required</li>
              </ul>
            </div>

            <div className="req-section">
              <ul>
                <li>Microsoft .NET Framework 4.5 (pre-installed on most PC’s and can be downloaded here: Microsoft .NET Framework)</li>
                <li>Screen resolution of 1024 x 768</li>
                <li>DirectX10 compatible graphics card highly recommended</li>
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
