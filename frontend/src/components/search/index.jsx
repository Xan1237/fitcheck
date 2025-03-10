import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './style.scss';

const Search = ({ onSearchSubmit }) => {
  // Local state to manage the input values
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [localFilter, setLocalFilter] = useState('all');

  const handleSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setLocalFilter(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass the local state values to the parent component
    onSearchSubmit(localSearchQuery, localFilter);
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <div className="search-field">
            <input
              type="text"
              placeholder="Enter a location..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
          <select
            id="filter"
            value={localFilter}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Gyms</option>
            <option value="Fit For Less">Fit For Less</option>
            <option value="Goodlife">Goodlife</option>
            <option value="Planet Fitness">Planet Fitness</option>
            <option value="FitnessFX">FitnessFX</option>
            <option value="Test Gym">Test Gym</option>
          </select>
          <button type="submit" className="search-button">
            Find Gyms
          </button>
        </div>
      </form>
    </div>
  );
};

export default Search;