import React from 'react';
import Feature from './Feature';

const FeaturesSection = ({ features }) => {
  return (
    <div className="features-section">
      <div className="features-intro">
        <p className="features-tagline">
          We take the boring stuff off your plate. Faster edits. Smoother feedback. More time for what actually matters.
        </p>
      </div>
      <div className="features-container">
        {features.map((feature, index) => (
          <div className="feature-wrapper" key={index}>
            <Feature
              title={feature.title}
              description={feature.description}
              image={feature.image}
              imageAlt={feature.imageAlt}
              imagePosition={index % 2 === 0 ? 'left' : 'right'}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection; 