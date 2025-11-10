import React from 'react';

const LoadingOverlay = React.forwardRef((props, ref) => {
  const { counterRef } = props;
  return (
    <div className="loading-overlay" id="loading-overlay" ref={ref}>
      Loading <span className="loading-counter" id="loading-counter" ref={counterRef}>[00]</span>
    </div>
  );
});

export default LoadingOverlay;