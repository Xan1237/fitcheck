import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaFilter, FaTimes, FaTags, FaStar } from 'react-icons/fa';
import './style.scss';

// Import the tag categories from the shared file
import { tagCategories } from '../../data/tagCategories';

const Search = ({ onSearchSubmit, gyms, searchQuery, setSearchQuery, filter, setFilter, onOpenGymNameSearch  }) => {
  // Local state to manage the input values
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [localFilter, setLocalFilter] = useState(filter || 'all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isClosing, setIsClosing] = useState(false); // New state for animation
   
  const advancedFiltersRef = useRef(null);

  // Debug: Log gyms on component mount or when gyms change
  useEffect(() => {
    if (gyms && gyms.length > 0) {
      console.log('Search component received gyms with ratings:', 
        gyms.map(gym => ({ id: gym.id, name: gym.name, rating: gym.rating }))
      );
    }
  }, [gyms]);

  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
    setLocalFilter(filter || 'all');
  }, [searchQuery, filter]);

  // Get all available tags from gyms
  const getAllAvailableTags = () => {
    const allTags = new Set();
    
    if (!gyms) return [];
    
    gyms.forEach(gym => {
      if (gym.tags && Array.isArray(gym.tags)) {
        gym.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    return Array.from(allTags).sort();
  };

  // Track which tags are available from gyms
  const [availableTags, setAvailableTags] = useState([]);

  // Update available tags when gyms change
  useEffect(() => {
    if (gyms) {
      setAvailableTags(getAllAvailableTags());
      setFilteredGyms(gyms); // Initialize filtered gyms with all gyms
    }
  }, [gyms]);
  
  const handleSearchChange = (e) => {
    setLocalSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setLocalFilter(e.target.value);
  };

  const toggleAdvancedFilters = () => {
    if (showAdvancedFilters) {
      closeAdvancedFilters();
    } else {
      setShowAdvancedFilters(true);
      setIsClosing(false);
    }
  };

  const closeAdvancedFilters = () => {
    if (!showAdvancedFilters) return;
    
    setIsClosing(true);
    
    // Wait for the animation to complete before actually hiding the element
    setTimeout(() => {
      setShowAdvancedFilters(false);
      setIsClosing(false);
    }, 600); // Increased to 600ms for a slower animation
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
    if (!gyms) return;
    
    console.log('Filtering gyms with rating threshold:', selectedRating);
    
    const filtered = gyms.filter(gym => {
    // Filter by gym province
    const matchesProvinceFilter = localFilter === 'all' || gym.province === localFilter;

    
    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || 
      (gym.tags && selectedTags.every(tag => gym.tags.includes(tag)));
    
    // Filter by rating - ensure we're comparing numbers
    const gymRating = typeof gym.rating === 'number' ? gym.rating : Number(gym.rating || 0);
    
    const matchesRating = selectedRating === 0 || gymRating >= selectedRating;
    
    return matchesProvinceFilter && matchesTags && matchesRating;
    });
    
    console.log(`Filtered gyms: ${filtered.length} of ${gyms.length} match criteria`);
    setFilteredGyms(filtered);
  }, [localSearchQuery, localFilter, selectedTags, selectedRating, gyms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update parent component state
    if (setSearchQuery) setSearchQuery(localSearchQuery);
    if (setFilter) setFilter(localFilter);
    
    // Pass filtered gyms to parent component
    onSearchSubmit(localSearchQuery, localFilter, filteredGyms);
    
    // Close advanced filters with animation
    closeAdvancedFilters();
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

          {/* NEW: show this BEFORE the province filter */}
          <button
            type="button"
            className="search-button gym-name-search"
            onClick={onOpenGymNameSearch}
          >
            Search by gym name
          </button>

          <select
            id="filter"
            value={localFilter}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="Alberta">Alberta</option>
            <option value="British Columbia">British Columbia</option>
            <option value="Manitoba">Manitoba</option>
            <option value="New Brunswick">New Brunswick</option>
            <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
            <option value="Northwest Territories">Northwest Territories</option>
            <option value="Nova Scotia">Nova Scotia</option>
            <option value="Nunavut">Nunavut</option>
            <option value="Ontario">Ontario</option>
            <option value="Prince Edward Island">Prince Edward Island</option>
            <option value="Quebec">Quebec</option>
            <option value="Saskatchewan">Saskatchewan</option>
            <option value="Yukon">Yukon</option>
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

        {/* Advanced filters section - now with animation classes */}
        {(showAdvancedFilters || isClosing) && (
          <div 
            ref={advancedFiltersRef}
            className={`advanced-filters ${isClosing ? 'closing' : 'opening'}`}
          >
            <div className="advanced-filters-header">
              <div className="header-left">
                <h2><FaTags /> Filter by Gym Features</h2>
                <div className="filtered-gyms-count">
                  {filteredGyms.length} gyms match your filters
                </div>
              </div>
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
            
            {/* Dummy tag option for now */}
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
          </div>
        )}
      </form>
    </div>
  );
};

export default Search;