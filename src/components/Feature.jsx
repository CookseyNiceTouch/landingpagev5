import React from 'react';
import RiveAnimation from './RiveAnimation';

const Feature = ({ title, description, image, imageAlt, imagePosition = 'left', artboard, animationClass }) => {
  const fallbackSrc = artboard ? `/rivestills/${artboard}.png` : null;

  return (
    <div className={`feature-card feature-image-${imagePosition}`}>
      <div className="feature-image-container">
        {artboard ? (
          <RiveAnimation 
            artboard={artboard} 
            className={animationClass} 
            fallbackSrc={fallbackSrc}
          />
        ) : (
          image && <img src={image} alt={imageAlt || title} className="feature-image" />
        )}
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );
};

export default Feature; 