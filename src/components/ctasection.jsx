import React from 'react';
import MailerLiteForm from './MailerLiteForm';
import './LandingPage.css';

const CTASection = () => {
  return (
    <div className="cta-section">
      <div className="cta-background" />
      <div className="cta-container">
        <div className="cta-image-placeholder">
          {/* Placeholder for image */}
        </div>
        <div className="cta-content">
          <h1 className="cta-title">Join the List and </h1>
          <h4 className="cta-subtitle">Help Shape the Future of Post-Production.</h4>
          <div className="cta-benefits">
            <p>Join the early access crew and:</p>
            <ul>
              <li>Get first dibs on beta invites</li>
              <li>Influence features based on your workflow</li>
              <li>Be part of building something for us - the working creatives</li>
            </ul>
          </div>
          <div className="cta-form">
            <MailerLiteForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
