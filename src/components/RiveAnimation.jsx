import React, { useEffect, useState } from 'react';
import Rive from '@rive-app/react-canvas';

const RiveAnimation = ({ artboard, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={className ? `animation-container ${className}` : 'animation-container'}>
      <Rive
        src="./web_page_current.riv"
        className="rive-animation"
        artboard={artboard}
        animations="Timeline"
        fit="cover"
        autoPlay={true}
        loop={true}
        onLoad={() => setIsLoaded(true)}
        onLoadError={(e) => {
          console.warn("Rive load error:", e);
          setHasError(true);
        }}
      />
      {hasError && <div className="animation-fallback">Animation failed to load</div>}
    </div>
  );
};

export default RiveAnimation;
