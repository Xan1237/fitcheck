import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaDirections, FaInfoCircle } from 'react-icons/fa';
import './style.scss';

const GymSidebar = ({ gyms, activeGym, setActiveGym, filter }) => {
  return (
    <div className="gym-sidebar">
      <div className="sidebar-header">
        <h2>Nearby Gyms</h2>
      </div>
      <div className="gym-list">
        {gyms
          .filter((gym) => filter === 'all' || gym.name === filter) // Only show gyms that match the filter
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
                <h3>{gym.name}</h3>
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
