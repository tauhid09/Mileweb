import React from 'react';

const Footer = React.forwardRef((props, ref) => {
  const { progressFillRef, currentSectionRef } = props;
  
  return (
    <div className="footer" id="footer" ref={ref}>
      <div className="header-row">Beyond</div>
      <div className="header-row">Thinking</div>
      <div className="progress-indicator">
        <div className="progress-numbers">
          <span id="current-section" ref={currentSectionRef}>01</span>
          <span id="total-sections">10</span>
        </div>
        <div className="progress-fill" id="progress-fill" ref={progressFillRef}></div>
      </div>
    </div>
  );
});

export default Footer;