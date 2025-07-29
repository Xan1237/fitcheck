import React, { useEffect, useState } from 'react';
import './GymSearch.scss';
import axios from 'axios';

const GymSearch = ({ onGymSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [gyms, setGyms] = useState([]);

    async function fetchGyms() {
        try {
            const response = await axios.get('/api/getGymData', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log("Raw response:", response.data);
            
            // Convert object to array if necessary
            const gymsData = response.data.data || response.data;
            const gymsArray = Object.values(gymsData);
            
            console.log("Converted to array:", gymsArray);
            
            setGyms(gymsArray.map(gym => ({
                id: gym.id,
                link: gym.link || "",
                address: gym.address || "",
                name: gym.name || "",
                province: gym.province || "",
                tags: gym.tags || [],
            })));
        } catch (error) {
            console.error("Error fetching gyms:", error);
            setGyms([]);
        }
    }

    useEffect(() => {
        fetchGyms();
    }, []);

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
