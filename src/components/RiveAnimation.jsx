import React from 'react';
import Rive from '@rive-app/react-canvas';

const RiveAnimation = ({ artboard, className }) => {
  return (
    <div className={className ? `animation-container ${className}` : 'animation-container'}>
      <Rive
        src="/web_page_current.riv"
        className="rive-animation"
        artboard={artboard}
        animations="Timeline"
        fit="cover"
        autoPlay={true}
        loop={true}
      />
    </div>
  );
};

export default RiveAnimation;
