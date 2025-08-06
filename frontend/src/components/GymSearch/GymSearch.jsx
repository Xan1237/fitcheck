import React, { useEffect, useState } from 'react';
import './GymSearch.scss';
import axios from 'axios';

const GymSearch = ({ onGymSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [gyms, setGyms] = useState([]);
    const [province, setProvince] = useState("Nova Scotia");

    async function fetchGymsByProvince(selectedProvince) {
        try {
            const response = await axios.get(`/api/getGymsByProvince/${encodeURIComponent(selectedProvince)}`);
            setGyms(response.data.gyms || []);
        } catch (error) {
            setGyms([]);
        }
    }

    useEffect(() => {
        fetchGymsByProvince(province);
    }, [province]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        
        // Search through fetched gyms instead of mock data
        const results = gyms.filter(gym => 
            gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gym.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setIsSearching(false);
    };

    return (
        <div className="gym-search-content">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by gym name or location..."
                    className="search-input"
                    autoFocus
                />
                <button type="submit" className="search-button">
                    Search
                </button>
            </form>

            <div className="province-selector">
                <label htmlFor="province">Select Province:</label>
                <select 
                    id="province" 
                    value={province} 
                    onChange={e => setProvince(e.target.value)}
                    className="province-dropdown"
                >
                    <option value="Nova Scotia">Nova Scotia</option>
                    <option value="Alberta">Alberta</option>
                    <option value="British Columbia">British Columbia</option>
                    {/* ...other provinces/territories... */}
                </select>
            </div>

            <div className="search-results">
                {isSearching && (
                    <div className="searching-indicator">Searching...</div>
                )}
                {!isSearching && searchResults.length === 0 && searchTerm && (
                    <div className="no-results">No gyms found</div>
                )}
                {searchResults.map((gym) => (
                    <div key={gym.id} className="gym-result" onClick={() => onGymSelect(gym)}>
                        <h3>{gym.name}</h3>
                        <p>{gym.address}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GymSearch;
