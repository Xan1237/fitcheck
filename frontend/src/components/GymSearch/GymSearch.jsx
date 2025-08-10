import React, { useState } from 'react';
import './GymSearch.scss';

const GymSearch = ({ gyms = [], onGymSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false); // <-- NEW

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        setHasSearched(true); // <-- Mark that a search has been performed

        if (searchTerm.trim()) {
            const results = gyms.filter(gym =>
                gym.name &&
                gym.name.trim().toLowerCase().includes(searchTerm.trim().toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
        setIsSearching(false);
    };

    return (
        <div className="gym-search-content">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by gym name..."
                    className="search-input"
                    autoFocus
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </form>

            <div className="search-results">
                {isSearching && (
                    <div className="searching-indicator">Searching...</div>
                )}
                {/* Only show "No gyms found" after a search is performed */}
                {hasSearched && !isSearching && searchResults.length === 0 && (
                    <div className="no-results">No gyms found</div>
                )}
                {hasSearched && searchResults.map((gym) => (
                    <div key={gym.id} className="gym-result" onClick={() => onGymSelect(gym)}>
                        <h3>{gym.name}</h3>
                        <p>{gym.address || gym.location || ''}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GymSearch;
