import React, { useEffect, useRef } from 'react';
import './style.scss'; // Import the SCSS file

const title = () => {
  const textRef = useRef(null);

  useEffect(() => {
    // Trigger the animation when the component mounts
    if (textRef.current) {
      textRef.current.classList.add('animate');
    }
  }, []);

  return (
    <div className="animated-text-container">
      <h1 ref={textRef} className="orange-text">
        Find Your Gym
      </h1>
    </div>
  );
};

export default title;