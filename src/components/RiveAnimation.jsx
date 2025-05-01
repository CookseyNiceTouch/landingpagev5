import React from 'react';
import Rive from '@rive-app/react-canvas';

const RiveAnimation = ({ artboard }) => {
  return (
    <div className="animation-container"> 
      <Rive
        src="/web_page_section_01.riv"
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
