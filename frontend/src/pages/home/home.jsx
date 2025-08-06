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

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("Nova Scotia"); // <-- Default to Nova Scotia
  const [activeGym, setActiveGym] = useState(null);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSearchSubmit = (query, newFilter, filtered) => {
    setSearchQuery(query);
    setFilter(newFilter);

    // Update filtered gyms if provided
    if (filtered && Array.isArray(filtered)) {
      setFilteredGyms(filtered);
    } else if (gyms.length > 0) {
      // Always filter by province if no filtered gyms provided
      setFilteredGyms(gyms.filter(gym => gym.province === newFilter));
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