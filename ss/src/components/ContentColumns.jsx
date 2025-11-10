import React from 'react';

// Data from index.html
const artists = [
  "Silence", "Meditation", "Intuition", "Authenticity", "Presence",
  "Listening", "Curiosity", "Patience", "Surrender", "Simplicity"
];
const featured = [
  "Creative Elements", "Inner Stillness", "Deep Knowing", "True Expression", "Now Moment",
  "Deep Attention", "Open Exploration", "Calm Waiting", "Let Go Control", "Pure Essence"
];
const categories = [
  "Reduction", "Essence", "Space", "Resonance", "Truth",
  "Feeling", "Clarity", "Emptiness", "Awareness", "Minimalism"
];

const ContentColumns = React.forwardRef((props, ref) => {
  const { leftColRef, rightColRef, featuredRef } = props;
  
  return (
    <div className="content" ref={ref}>
      <div className="left-column" id="left-column" ref={leftColRef}>
        {artists.map((artist, index) => (
          <div className={`artist ${index === 0 ? 'active' : ''}`} key={index} data-index={index}>
            {artist}
          </div>
        ))}
      </div>
      
      <div className="featured" id="featured" ref={featuredRef}>
        {featured.map((text, index) => (
          <div className={`featured-content ${index === 0 ? 'active' : ''}`} key={index} data-index={index}>
            <h3>{text}</h3>
          </div>
        ))}
      </div>

      <div className="right-column" id="right-column" ref={rightColRef}>
        {categories.map((category, index) => (
          <div className={`category ${index === 0 ? 'active' : ''}`} key={index} data-index={index}>
            {category}
          </div>
        ))}
      </div>
    </div>
  );
});

export default ContentColumns;