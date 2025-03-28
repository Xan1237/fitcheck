import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaTags, FaStar } from 'react-icons/fa';
import './style.scss';

// Import the tag categories from the shared file
import { tagCategories } from '../../data/tagCategories';

const Search = ({ onSearchSubmit, gyms, searchQuery, setSearchQuery, filter, setFilter, gymRatingsData }) => {
  // Local state to manage the input values
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [localFilter, setLocalFilter] = useState(filter || 'all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [processedGyms, setProcessedGyms] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0); // New state for rating filter

  // Update local state when props change
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
    setLocalFilter(filter || 'all');
  }, [searchQuery, filter]);

  // Process and normalize gym data, merging static data with backend ratings
  useEffect(() => {
    if (!gyms) return;
    
    console.log("Static gyms data:", gyms);
    console.log("Backend gym ratings data:", gymRatingsData);
    
    // Convert the static gyms to an array if it's not already
    const staticGymsArray = Array.isArray(gyms) ? gyms : Object.values(gyms);
    
    // Create a merged dataset with ratings and tags from backend
    const mergedGyms = staticGymsArray.map(gym => {
      // Get the gym ID (ensure it's a string for consistency)
      const gymId = String(gym.id);
      
      // Check if we have backend data for this gym
      const backendData = gymRatingsData && gymRatingsData.data && gymRatingsData.data[gymId];
      
      // If we have backend data, merge it with the static data
      if (backendData) {
        console.log(`Merging backend data for gym ${gymId}:`, backendData);
        return {
          ...gym,
          rating: Number(backendData.rating || 0),
          tags: backendData.tags || [],
          ratingCount: backendData.ratingCount || 0
        };
      }
      
      // If no backend data, just use the static data
      return {
        ...gym,
        rating: Number(gym.rating || 0),
        tags: gym.tags || []
      };
    });
    
    console.log("Merged gyms data for filtering:", mergedGyms);
    setProcessedGyms(mergedGyms);
    setFilteredGyms(mergedGyms);
  }, [gyms, gymRatingsData]);

  // Get all available tags from processed gyms
  const getAllAvailableTags = () => {
    const allTags = new Set();
    
    if (!processedGyms || processedGyms.length === 0) return [];
    
    processedGyms.forEach(gym => {
      if (gym.tags && Array.isArray(gym.tags)) {
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

  // Update available tags when processed gyms change
  useEffect(() => {
    if (processedGyms && processedGyms.length > 0) {
      setAvailableTags(getAllAvailableTags());
    }
  }, [processedGyms]);
  
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
    if (!processedGyms || processedGyms.length === 0) return;
    
    console.log("Filtering gyms with rating threshold:", selectedRating);
    
    const filtered = processedGyms.filter(gym => {
      // Filter by gym name
      const matchesGymFilter = localFilter === 'all' || gym.name === localFilter;
      
      // Filter by search query (location)
      const matchesSearch = !localSearchQuery || 
        (gym.location && gym.location.toLowerCase().includes(localSearchQuery.toLowerCase()));
      
      // Filter by selected tags
      const matchesTags = selectedTags.length === 0 || 
        (gym.tags && selectedTags.every(tag => gym.tags.includes(tag)));
      
      // Filter by rating - ensure we're using the numeric value
      const gymRating = Number(gym.rating || 0);
      const matchesRating = selectedRating === 0 || gymRating >= selectedRating;
      
      // Debug logging for rating filtering
      if (selectedRating > 0) {
        console.log(`Gym ${gym.id} (${gym.name}) has rating ${gymRating}, threshold: ${selectedRating}, matches: ${matchesRating}`);
      }
      
      return matchesGymFilter && matchesSearch && matchesTags && matchesRating;
    });
    
    console.log(`Filtered gyms: ${filtered.length} of ${processedGyms.length} match criteria`);
    setFilteredGyms(filtered);
  }, [localSearchQuery, localFilter, selectedTags, selectedRating, processedGyms]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Update parent component state
    if (setSearchQuery) setSearchQuery(localSearchQuery);
    if (setFilter) setFilter(localFilter);
    
    // Pass filtered gyms to parent component
    onSearchSubmit(localSearchQuery, localFilter, filteredGyms);
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
          <div className="advanced-filters">
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
            
            {/* Dummy tag option for now - we'll handle real tags when they're available */}
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