import React from 'react';
import { FaTags } from 'react-icons/fa';
import './GymTags.scss';

const GymTags = ({ gymTags }) => {
  if (!gymTags || gymTags.length === 0) return null;

  return (
    <div className="gym-tags-container">
      <h2 className="tags-title">
        <FaTags className="tags-icon" /> Gym Features
      </h2>
      <div className="gym-tags-list">
        {gymTags.slice(0, 10).map(({ tag, percentage }) => (
          <div key={tag} className="gym-tag">
            <span className="tag-name">{tag}</span>
            <span className="tag-percentage">{percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GymTags; 