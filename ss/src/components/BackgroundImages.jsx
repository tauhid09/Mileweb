import React from 'react';

const BackgroundImages = React.forwardRef((props, ref) => {
  return (
    <div className="background-container" id="background-container" ref={ref}>
      <img src="https://assets.codepen.io/7558/flame-glow-blur-001.jpg" alt="Background 1" className="background-image active" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-002.jpg" alt="Background 2" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-003.jpg" alt="Background 3" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-004.jpg" alt="Background 4" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-005.jpg" alt="Background 5" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-006.jpg" alt="Background 6" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-007.jpg" alt="Background 7" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-008.jpg" alt="Background 8" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-009.jpg" alt="Background 9" className="background-image" />
      <img src="https://assets.codepen.io/7558/flame-glow-blur-010.jpg" alt="Background 10" className="background-image" />
    </div>
  );
});

export default BackgroundImages;