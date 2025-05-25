import React from 'react';
import { FaStar } from 'react-icons/fa';
import './GymHeader.scss';

const GymHeader = ({ gymName, averageRating, totalReviews }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star-filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="star-half" />);
      } else {
        stars.push(<FaStar key={i} className="star-empty" />);
      }
    }
    return stars;
  };

  return (
    <div className="gym-header">
      <h1 className="gym-name">{gymName}</h1>
      <div className="gym-rating-container">
        <div className="gym-stars">{renderStars(averageRating)}</div>
        <div className="gym-rating-text">
          <span className="rating-number">{averageRating}</span>
          <span className="total-reviews">({totalReviews} reviews)</span>
        </div>
      </div>
    </div>
  );
};

export default GymHeader; 