import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaTags } from 'react-icons/fa';
import './style.scss';

// Import the tag categories from the shared file
// Replace with the correct path to your tagCategories.js file
import { tagCategories } from '../../data/tagCategories';

const Search = ({ onSearchSubmit, gyms, searchQuery, setSearchQuery, filter, setFilter }) => {
  // Local state to manage the input values
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');
  const [localFilter, setLocalFilter] = useState(filter || 'all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filteredGyms, setFilteredGyms] = useState([]);

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
  };

  // Filter gyms based on search, gym name filter, and tags
  useEffect(() => {
    if (!gyms) return;
    
    const filtered = gyms.filter(gym => {
      // Filter by gym name
      const matchesGymFilter = localFilter === 'all' || gym.name === localFilter;
      
      // Filter by search query (location)
      const matchesSearch = !localSearchQuery || 
        (gym.location && gym.location.toLowerCase().includes(localSearchQuery.toLowerCase()));
      
      // Filter by selected tags
      // Note: For now, we're assuming gym.tags exists - we'll handle empty tags as well
      const matchesTags = selectedTags.length === 0 || 
        (gym.tags && selectedTags.every(tag => gym.tags.includes(tag)));
      
      return matchesGymFilter && matchesSearch && matchesTags;
    });
    
    setFilteredGyms(filtered);
  }, [localSearchQuery, localFilter, selectedTags, gyms]);

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
              {selectedTags.length > 0 && (
                <button type="button" className="clear-tags-button" onClick={clearTags}>
                  Clear All Filters
                </button>
              )}
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