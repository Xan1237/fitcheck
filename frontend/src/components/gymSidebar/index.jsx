import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaDirections, FaInfoCircle, FaStar } from 'react-icons/fa';
import './style.scss';

const GymSidebar = ({ gyms, activeGym, setActiveGym, filter }) => {
  // Function to render star rating
  const renderStarRating = (rating) => {
    const ratingValue = Math.round(rating);
    return (
      <div className="gym-rating">
        {[...Array(5)].map((_, index) => (
          <FaStar 
            key={index} 
            className={index < ratingValue ? "star-filled" : "star-empty"} 
          />
        ))}
        <span className="rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="gym-sidebar">
      <div className="sidebar-header">
        <h2>Nearby Gyms</h2>
      </div>
      <div className="gym-list">
        {gyms
          .filter((gym) => filter === 'all' || gym.province === filter) // Only show gyms that match the filter
          .map((gym) => (
            <div 
              key={gym.id} 
              className={`gym-card ${activeGym === gym.id ? 'active' : ''}`}
              onClick={() => setActiveGym(gym.id)}
            >
              <div className="gym-icon">
                <FaDumbbell />
              </div>
              <div className="gym-info">
                <div className="gym-header">
                  <h3>{gym.name}</h3>
                  {renderStarRating(gym.rating || 0)}
                </div>
                <p>{gym.location}</p>
                <div className="gym-actions">
                  <Link to={gym.link} className="gym-link">
                    <FaInfoCircle /> Details
                  </Link>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${gym.position[0]},${gym.position[1]}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="directions-link"
                  >
                    <FaDirections /> Directions
                  </a>
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default GymSidebar;