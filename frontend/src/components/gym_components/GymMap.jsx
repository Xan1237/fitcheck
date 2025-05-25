import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import './GymMap.scss';

const GymMap = ({ location, gymName }) => {
  if (!location) return null;

  return (
    <div className="gym-map-container">
      <h2 className="map-title">
        <FaMapMarkerAlt className="map-icon" /> Location
      </h2>
      <div className="gym-map">
        <iframe
          title={`Map of ${gymName}`}
          src={`https://maps.google.com/maps?q=${encodeURIComponent(
            location
          )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          className="google-map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default GymMap; 