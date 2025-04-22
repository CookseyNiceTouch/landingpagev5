import React from 'react';

const Feature = ({ title, description, image, imageAlt, imagePosition = 'left' }) => {
  return (
    <div className={`feature-card feature-image-${imagePosition}`}>
      <div className="feature-image-container">
        {image && <img src={image} alt={imageAlt || title} className="feature-image" />}
      </div>
      <div className="feature-content">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
      </div>
    </div>
  );
};

export default Feature; 