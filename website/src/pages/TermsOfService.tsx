import React from 'react';
import './TermsOfService.css';

const TermsOfService: React.FC = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <header className="terms-header">
          <h1>Terms of Service</h1>
          <p><strong>Effective Date:</strong> February 1, 2025</p>
          <p><strong>Company:</strong> AOMTrading, LLC (“AOMTrading,” “we,” “our,” or “us”)</p>
          <p><strong>Website:</strong> <a href="https://www.aomtrading.com" target="_blank" rel="noopener noreferrer">www.aomtrading.com</a></p>
        </header>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the AOMTrading website, platform, services, or subscriptions (collectively, the “Services”),
            you agree to be bound by these Terms of Service (“Terms”). If you do not agree, you may not use the Services.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>You must be at least 18 years old (or the age of majority in your jurisdiction) to use our Services.</p>
          <p>By using the Services, you represent and warrant that you have the legal capacity to enter into these Terms.</p>
        </section>

        <section>
          <h2>3. Services Provided</h2>
          <p>AOMTrading provides educational resources, live trading rooms, tutorials, and access to proprietary trading methodology and software (“Content”).</p>
          <ul>
            <li><strong>Educational Purposes Only:</strong> All Content is provided strictly for educational and informational purposes.</li>
            <li><strong>No Financial Advice:</strong> AOMTrading does not provide personalized investment advice, financial planning, or broker-dealer services.</li>
          </ul>
        </section>

        <section>
          <h2>4. Subscriptions and Payment</h2>
          <ul>
            <li>Access to certain Services requires a paid subscription (monthly or annual).</li>
            <li>By subscribing, you authorize us to charge your payment method on a recurring basis until canceled.</li>
            <li>Fees are non-refundable except where required by law.</li>
            <li>Subscription benefits and pricing may change with prior notice.</li>
          </ul>
        </section>

        <section>
          <h2>5. User Accounts</h2>
          <ul>
            <li>You must create an account to access certain features.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activity under your account.</li>
          </ul>
        </section>

        <section>
          <h2>6. License and Restrictions</h2>
          <ul>
            <li>AOMTrading grants you a limited, non-exclusive, non-transferable license to access and use the Services for personal, non-commercial purposes.</li>
            <li>You may not copy, distribute, resell, or exploit any Content or software without our prior written consent.</li>
            <li>Unauthorized use may result in suspension or termination of your account.</li>
          </ul>
        </section>

        <section>
          <h2>7. Risk Disclaimer</h2>
          <ul>
            <li>Trading financial instruments (including futures, stocks, and forex) involves substantial risk and is not suitable for all investors.</li>
            <li>You may lose more than your initial investment.</li>
            <li>Past performance does not guarantee future results.</li>
            <li>By using our Services, you acknowledge that you alone are responsible for your trading decisions and outcomes.</li>
          </ul>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <p>All Content, software, logos, and trademarks are the property of AOMTrading, LLC or its licensors. Unauthorized use is strictly prohibited.</p>
        </section>

        <section>
          <h2>9. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Services for unlawful purposes.</li>
            <li>Interfere with or disrupt the Services or networks.</li>
            <li>Attempt to gain unauthorized access to our systems.</li>
          </ul>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>We may suspend or terminate your account at our discretion if you violate these Terms. Upon termination, your right to access the Services ceases immediately.</p>
        </section>

        <section>
          <h2>11. Limitation of Liability</h2>
          <p>AOMTrading is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Services. We make no guarantees regarding the accuracy, reliability, or availability of the Content.</p>
        </section>

        <section>
          <h2>12. Indemnification</h2>
          <p>You agree to indemnify and hold harmless AOMTrading, its affiliates, and employees from any claims, damages, or expenses arising from your use of the Services.</p>
        </section>

        <section>
          <h2>13. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law principles.</p>
        </section>

        <section>
          <h2>14. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Services after changes are posted constitutes your acceptance of the revised Terms.</p>
        </section>

        <section>
          <h2>15. Contact Information</h2>
          <p>For questions about these Terms, contact us at:</p>
          <address>
            AOMTrading, LLC<br />
            Email: <a href="mailto:info@aomtrading.com">info@aomtrading.com</a>
          </address>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
