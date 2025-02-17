import React, { useState } from 'react';
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
          <input
            type="text"
            placeholder="Search..."
            value={localSearchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
          <select
            id="filter"
            value={localFilter}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">Fit For Less</option>
            <option value="Goodlife">Goodlife</option>
            <option value="Planet Fitness">Planet Fitness</option>
            <option value="FitnessFX">FitnessFX</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default Search;