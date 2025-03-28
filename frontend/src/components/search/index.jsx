import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaTags, FaStar } from 'react-icons/fa';
import './style.scss';

// Import the tag categories from the shared file
import { tagCategories } from '../../data/tagCategories';

const Search = ({ onSearchSubmit, gyms, searchQuery, setSearchQuery, filter, setFilter }) => {
  // Local state to manage the input values
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [localFilter, setLocalFilter] = useState(filter || 'all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0); // New state for rating filter

  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
    setLocalFilter(filter || 'all');
  }, [searchQuery, filter]);

  // Initialize filtered gyms when gyms change
  useEffect(() => {
    if (gyms && Array.isArray(gyms)) {
      setFilteredGyms(gyms);
    }
  }, [gyms]);

  // Get all available tags from gyms
  const getAllAvailableTags = () => {
    const allTags = new Set();
    
    if (!gyms || !Array.isArray(gyms)) return [];
    
    gyms.forEach(gym => {
      if (gym.tags && Array.isArray(gym.tags)) {
        // Filter out rating tags when displaying in tag categories
        gym.tags.forEach(tag => {
          if (!tag.startsWith('rating:')) {
            allTags.add(tag);
          }
        });
      }
    });
    
    return Array.from(allTags).sort();
  };

  // Track which tags are available from gyms
  const [availableTags, setAvailableTags] = useState([]);

  // Update available tags when gyms change
  useEffect(() => {
    if (gyms && Array.isArray(gyms)) {
      setAvailableTags(getAllAvailableTags());
    }
  }, [gyms]);
  
  const handleSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setLocalFilter(e.target.value);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTags = () => {
    setSelectedTags([]);
    setSelectedRating(0); // Clear rating filter as well
  };

  // Handle rating selection
  const handleRatingSelect = (rating) => {
    setSelectedRating(rating === selectedRating ? 0 : rating);
  };

  // Filter gyms based on search, gym name filter, tags, and rating
  useEffect(() => {
    if (!gyms || !Array.isArray(gyms)) return;
    
    const filtered = gyms.filter(gym => {
      // Filter by gym name
      const matchesGymFilter = localFilter === 'all' || gym.name === localFilter;
      
      // Filter by search query (location)
      const matchesSearch = !localSearchQuery || 
        (gym.location && gym.location.toLowerCase().includes(localSearchQuery.toLowerCase()));
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        (gym.tags && selectedTags.every(tag => gym.tags.includes(tag)));
      
      // Filter by rating - ensure we're comparing numbers
      const gymRating = typeof gym.rating === 'number' ? gym.rating : Number(gym.rating || 0);
      const matchesRating = selectedRating === 0 || gymRating >= selectedRating;
      
      return matchesGymFilter && matchesSearch && matchesTags && matchesRating;
    });
    
    setFilteredGyms(filtered);
  }, [localSearchQuery, localFilter, selectedTags, selectedRating, gyms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update parent component state
    if (setSearchQuery) setSearchQuery(localSearchQuery);
    if (setFilter) setFilter(localFilter);
    
    // Pass filtered gyms to parent component
    onSearchSubmit(localSearchQuery, localFilter, filteredGyms);
    
    // Close advanced filters after search submission
    if (showAdvancedFilters) {
      setShowAdvancedFilters(false);
    }
  };

  // Group available tags by category
  const getAvailableTagsByCategory = () => {
    const categorizedTags = {};
    
    // Initialize all categories
    Object.keys(tagCategories).forEach(category => {
      categorizedTags[category] = [];
    });
    
    // Sort available tags into categories
    availableTags.forEach(tag => {
      for (const [category, tags] of Object.entries(tagCategories)) {
        if (tags.includes(tag)) {
          categorizedTags[category].push(tag);
          break;
        }
      }
    });
    
    return categorizedTags;
  };

  const categorizedAvailableTags = getAvailableTagsByCategory();

  // Helper function to render stars for rating filter
  const renderStars = (maxRating = 5) => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <div 
          key={i} 
          className={`star ${i <= selectedRating ? 'selected' : ''}`}
          onClick={() => handleRatingSelect(i)}
        >
          <FaStar />
        </div>
      );
    }
    return stars;
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
            <option value="Fitness FX">FitnessFX</option>
            <option value="Test Gym">Test Gym</option>
            <option value="Anytime Fitness">Anytime Fitness</option>
          </select>
          <button 
            type="button" 
            className={`advanced-filter-button ${showAdvancedFilters ? 'active' : ''}`}
            onClick={toggleAdvancedFilters}
          >
            <FaFilter /> {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
          <button type="submit" className="search-button">
            Find Gyms
          </button>
        </div>

        {/* Advanced filters section */}
        {showAdvancedFilters && (
          <div className="advanced-filters" id="top-search-filters">
            <div className="advanced-filters-header">
              <h2><FaTags /> Filter by Gym Features</h2>
              {(selectedTags.length > 0 || selectedRating > 0) && (
                <button type="button" className="clear-tags-button" onClick={clearTags}>
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Rating filter section */}
            <div className="rating-filter">
              <div className="rating-filter-header">
                <h3>Minimum Rating</h3>
                {selectedRating > 0 && (
                  <span className="selected-rating">{selectedRating}+ stars</span>
                )}
              </div>
              <div className="stars-container">
                {renderStars(5)}
                {selectedRating > 0 && (
                  <button 
                    type="button" 
                    className="clear-rating-button"
                    onClick={() => setSelectedRating(0)}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="selected-tags-container">
                <div className="selected-tags">
                  {selectedTags.map(tag => (
                    <div key={tag} className="selected-tag">
                      {tag}
                      <button type="button" onClick={() => toggleTag(tag)}>
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* No tags message */}
            {availableTags.length === 0 && (
              <div className="no-tags-message">
                No tags available yet. As users review gyms, tags will appear here for filtering.
              </div>
            )}
            
            {/* Categorized tags */}
            <div className="tag-categories">
              {Object.entries(categorizedAvailableTags).map(([category, tags]) => {
                if (tags.length === 0) return null;
                
                return (
                  <div key={category} className="tag-category">
                    <div 
                      className="category-header"
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="category-name">{category}</span>
                      <span className="tag-count">
                        {tags.filter(tag => selectedTags.includes(tag)).length > 0 && 
                          `(${tags.filter(tag => selectedTags.includes(tag)).length} selected)`
                        }
                      </span>
                      <span className={`expand-icon ${expandedCategories[category] ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    </div>
                    
                    {expandedCategories[category] && (
                      <div className="category-tags">
                        {tags.map(tag => (
                          <div 
                            key={tag}
                            className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="filtered-gyms-count">
              {filteredGyms.length} gyms match your filters
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Search;