import React from 'react';
import {
  FaExternalLinkAlt,
  FaRegClock,
  FaMapMarkerAlt,
  FaPhone,
  FaDirections,
} from 'react-icons/fa';
import './GymDetails.scss';

const GymDetails = ({ gymData }) => {
  return (
    <div className="gym-main-info">
      <div className="gym-image-container">
        <img className="gym-image" src={gymData.img} alt={gymData.name} />
      </div>

      <div className="gym-details">
        <div className="gym-contact-info">
          {gymData.location && (
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <span className="info-text">{gymData.location}</span>
            </div>
          )}

          {gymData.phone && (
            <div className="info-item">
              <FaPhone className="info-icon" />
              <span className="info-text">{gymData.phone}</span>
            </div>
          )}

          {gymData.website && (
            <div className="info-item">
              <FaExternalLinkAlt className="info-icon" />
              <a
                href={gymData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                Visit Website
              </a>
            </div>
          )}

          {gymData.location && (
            <div className="info-item">
              <FaDirections className="info-icon" />
              <a
                href={`https://maps.google.com/maps?q=${encodeURIComponent(
                  gymData.location
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                Get Directions
              </a>
            </div>
          )}
        </div>

        <div className="gym-hours-container">
          <h3>
            <FaRegClock className="hours-icon" /> Hours of Operation
          </h3>
          <div className="gym-hours">
            {Object.entries(gymData.gymHours).map(([day, hours]) => (
              <div key={day} className="hours-row">
                <span className="day">{day}:</span>
                <span className="hours">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDetails; 