import React, { useState, useEffect } from "react";
import Search from "../../components/search";
import Map from "../../components/map";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Title from "../../components/title";
import gymData from "../../data/gymData.js"; 
import GymSidebar from "../../components/gymSidebar";
import "./styles.scss";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const provinceCenters = {
  "Alberta": [52.4333, -115.5765],
  "British Columbia": [51.7267, -125.6476],
  "Manitoba": [52.0609, -97.8139],
  "New Brunswick": [45.5653, -66.4619],
  "Newfoundland and Labrador": [50.5, -57.6604],
  "Northwest Territories": [63.8255, -122.8457],
  "Nova Scotia": [44.6820, -63.7443],
  "Nunavut": [70.2998, -83.1076], 
  "Ontario": [46.5, -85.3232],
  "Prince Edward Island": [46.2, -63.2568],
  "Quebec": [51, -73.5491],
  "Saskatchewan": [52.5399, -106.4509],
  "Yukon": [63.2823, -135.0000]
};

const provinceZooms = {
  "Alberta": 4.8,
  "British Columbia": 4.6,
  "Manitoba": 4.7,
  "New Brunswick": 6.8,
  "Newfoundland and Labrador": 4.5,
  "Northwest Territories": 3,
  "Nova Scotia": 6.5,
  "Nunavut": 3,
  "Ontario": 4.5,
  "Prince Edward Island": 8,
  "Quebec": 4.2,
  "Saskatchewan": 4.8,
  "Yukon": 4.5
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Nova Scotia"); // <-- Default to Nova Scotia
  const [activeGym, setActiveGym] = useState(null);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(provinceCenters[filter]);
  const [mapZoom, setMapZoom] = useState(provinceZooms[filter] || 6);

  // Fetch dynamic gym data and merge with static data on component mount
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/getGymData`);
        
        if (!response.ok) {
          console.warn("API response not OK:", response.status);
          throw new Error("Failed to fetch gym data");
        }
        
        const { success, data, error } = await response.json();
        
        // Still proceed with static data even if API returns "No gyms found"
        if (success && data) {
          // Merge dynamic data with static data
          const mergedGyms = Object.entries(gymData).map(([id, staticData]) => {
            const dynamicData = data[id] || {};
            
            return {
              ...staticData,
              id: parseInt(id),
              // Use dynamically fetched tags if available, otherwise use static tags or empty array
              tags: dynamicData.tags || staticData.tags || [],
              // Include rating data from backend
              rating: dynamicData.rating !== undefined ? Number(dynamicData.rating) : 0,
              ratingCount: dynamicData.ratingCount || 0
            };
          });
          
          setGyms(mergedGyms);
          setFilteredGyms(mergedGyms);
        } else {
          console.warn("API returned error or no data:", error);
          // Fall back to static data
          const staticGyms = Object.entries(gymData).map(([id, data]) => ({
            ...data,
            id: parseInt(id),
            tags: data.tags || [],
            rating: 0,
            ratingCount: 0
          }));
          
          setGyms(staticGyms);
          setFilteredGyms(staticGyms);
        }
      } catch (error) {
        console.error("Error fetching gym data:", error);
        
        // Fall back to static data
        const staticGyms = Object.entries(gymData).map(([id, data]) => ({
          ...data,
          id: parseInt(id),
          tags: data.tags || [],
          rating: 0,
          ratingCount: 0
        }));
        
        setGyms(staticGyms);
        setFilteredGyms(staticGyms);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGymData();
  }, []);

  // Filter gyms by province whenever gyms or filter changes
  useEffect(() => {
    if (gyms && gyms.length > 0) {
      const provinceGyms = gyms.filter(gym => gym.province === filter);
      setFilteredGyms(provinceGyms);
    }
  }, [gyms, filter]);

  useEffect(() => {
    // Update map center and zoom when filter (province) changes
    if (provinceCenters[filter]) {
      setMapCenter(provinceCenters[filter]);
      setMapZoom(provinceZooms[filter] || 6);
    }
  }, [filter]);

  const handleSearchSubmit = (query, newFilter, filtered) => {
    setSearchQuery(query);
    setFilter(newFilter);

    // Update filtered gyms if provided
    if (filtered && Array.isArray(filtered)) {
      setFilteredGyms(filtered);
    } else if (gyms.length > 0) {
      setFilteredGyms(gyms.filter(gym => gym.province === newFilter));
    }

    // Zoom map to province center and custom zoom
    if (provinceCenters[newFilter]) {
      setMapCenter(provinceCenters[newFilter]);
      setMapZoom(provinceZooms[newFilter] || 6);
    }

    // Set active gym if a specific gym is selected in filter
    if (newFilter && gyms.length > 0) {
      const filteredGym = gyms.find((gym) => gym.name === newFilter);
      if (filteredGym) {
        setActiveGym(filteredGym.id);
      }
    }
  };

  return (
    <div className="home-container">
      <Header />
      <Title />
      <div className="top-search-area">
        <Search
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
          onSearchSubmit={handleSearchSubmit}
          gyms={gyms}
        />
      </div>
      <div className="map-sidebar-container">
        <div className="map-wrapper">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading gym data...</p>
            </div>
          ) : (
            <Map
              searchResults={searchQuery}
              markers={filteredGyms}
              activeGym={activeGym}
              setActiveGym={setActiveGym}
              center={mapCenter}
              zoom={mapZoom}
            />
          )}
        </div>
        <div className="sidebar-wrapper">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading gym data...</p>
            </div>
          ) : (
            <GymSidebar
              gyms={filteredGyms}
              activeGym={activeGym}
              setActiveGym={setActiveGym}
              filter={filter}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;