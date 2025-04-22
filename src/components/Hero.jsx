import React from 'react';
import MailerLiteForm from './MailerLiteForm';

const Hero = () => {
  return (
    <div className="hero-section">
      <div className="hero-background">
        {/* We'll use a real 3D workspace image as background later */}
      </div>
      <div className="hero-overlay">
        {/* This creates a semi-transparent overlay to ensure text visibility */}
      </div>
      <div className="hero-content">
        <h1 className="hero-title">Nice Touch</h1>
        <h2 className="hero-tagline">The OS for Creators</h2>
        
        <div className="hero-signup">
          <p className="signup-text">Get early access:</p>
          <MailerLiteForm />
        </div>
      </div>
      <div className="hero-gradient"></div>
    </div>
  );
};

export default Hero; 