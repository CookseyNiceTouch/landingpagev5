import React, { useState, useEffect } from 'react';
import MailerLiteForm from './MailerLiteForm';
import Scene3D from './3dscene';
import './LandingPage.css';

const Hero = () => {
  const [isLoading3D, setIsLoading3D] = useState(true);
  
  useEffect(() => {
    // Add event listener for when 3D scene is loaded
    const handleSceneLoaded = () => {
      setIsLoading3D(false);
    };
    
    window.addEventListener('scene3d-loaded', handleSceneLoaded);
    
    // Fallback: if scene doesn't load in 10 seconds, hide loading indicator
    const timeout = setTimeout(() => {
      setIsLoading3D(false);
    }, 10000);
    
    return () => {
      window.removeEventListener('scene3d-loaded', handleSceneLoaded);
      clearTimeout(timeout);
    };
  }, []);
  
  return (
    <div className="hero-section">
      {/* Background gradient - always visible */}
      <div className="hero-background" />
      
      {/* Subtle loading indicator - thin horizontal line */}
      {isLoading3D && (
        <div className="hero-loading-line">
          <div className="hero-loading-line-progress"></div>
        </div>
      )}
      
      {/* 3D scene - only one instance */}
      <div className="hero-3d-scene">
        <Scene3D />
      </div>
      
      {/* Semi-transparent overlay for text readability */}
      <div className="hero-overlay" />
      
      {/* Main content */}
      <div className="hero-content">
        <h1 className="hero-title">Nice Touch</h1>
        <h2 className="hero-tagline">The OS for Creators</h2>
        
        <div className="hero-signup">
          {/* <p className="signup-text">Get early access:</p> */}
          <MailerLiteForm />
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div className="hero-gradient" />
    </div>
  );
};

export default Hero; 