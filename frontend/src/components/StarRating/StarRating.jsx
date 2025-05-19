import React, { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating = 0, interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };
  
  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  const displayRating = hoverRating || rating;
  
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <span
          key={value}
          className={`star ${value <= displayRating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => handleMouseEnter(value)}
          onMouseLeave={handleMouseLeave}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;