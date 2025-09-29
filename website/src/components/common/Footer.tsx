import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="logo">
          &nbsp;
        </div>
        
        <div className="footer-sections">
          <div className="footer-section">
            <h3>Learn To Trade</h3>
            <ul>
              <li><Link to="/learn-to-trade">Study Course</Link></li>
              <li><Link to="/tutoring">Software</Link></li>
              <li><Link to="/">Platform Tour (coming soon)</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>AOM Trading</h3>
            <ul>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-disclaimer">
        <p>
          *Disclaimer: CFTC RULE 4.41 HYPOTHETICAL OR SIMULATED PERFORMANCE RESULTS HAVE INHERENT LIMITATIONS. 
          UNLIKE AN ACTUAL PERFORMANCE RECORD, SIMULATED RESULTS DO NOT REPRESENT ACTUAL TRADING. ALSO, 
          SINCE THE TRADES HAVE NOT BEEN EXECUTED, THE RESULTS MAY HAVE UNDER-OR-OVER COMPENSATED FOR THE IMPACT, 
          IF ANY, OF CERTAIN MARKET FACTORS, SUCH AS LACK OF LIQUIDITY. SIMULATED TRADING PROGRAMS IN GENERAL 
          ARE ALSO SUBJECT TO THE FACT THAT THEY ARE DESIGNED WITH THE BENEFIT OF HINDSIGHT. NO REPRESENTATION 
          IS BEING MADE THAT ANY ACCOUNT WILL OR IS LIKELY TO ACHIEVE PROFIT OR LOSSES SIMILAR TO THOSE SHOWN.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
