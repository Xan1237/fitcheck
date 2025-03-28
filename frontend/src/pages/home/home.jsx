import React, { useState, useEffect } from "react";
import Search from "../../components/search";
import Map from "../../components/map";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Title from "../../components/title";
import gymData from "../../data/gymData.js"; 
import GymSidebar from "../../components/GymSidebar";
import "./styles.scss";
import axios from "axios"
const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeGym, setActiveGym] = useState(null);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


  
  // Convert gymData object into an array of gym objects with id
  const gyms = Object.entries(gymData).map(([id, data]) => ({
    id: parseInt(id),
    ...data,
    // Initialize empty tags array for each gym if not present
    tags: data.tags || []
  }));

  // Initialize filteredGyms with all gyms on first render
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/getGymData");
        
        if (!response.ok) {
          console.warn("API response not OK:", response.status);
          throw new Error("Failed to fetch gym data");
        }
        
        const responseData = await response.json();
        const { success, data, error } = responseData;
        
        // Still proceed with static data even if API returns "No gyms found"
        if (success && data) {
          // Merge dynamic data with static data
          const mergedGyms = Object.entries(gymData).map(([id, staticData]) => {
            const dynamicData = data[id] || {};
            
            return {
              ...staticData,
              id: parseInt(id),
              // Include ratings from backend data
              rating: dynamicData.rating !== undefined ? Number(dynamicData.rating) : 0,
              ratingCount: dynamicData.ratingCount || 0,
              // Use dynamically fetched tags if available
              tags: dynamicData.tags || staticData.tags || []
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

  const handleSearchSubmit = (query, filter, filtered) => {
    setSearchQuery(query);
    setFilter(filter);
    
    // Update filtered gyms if provided
    if (filtered && Array.isArray(filtered)) {
      setFilteredGyms(filtered);
    }
    
    // Set active gym if a specific gym is selected in filter
    if (filter !== "all" && gyms.length > 0) {
      const filteredGym = gyms.find((gym) => gym.name === filter);
      if (filteredGym) {
        setActiveGym(filteredGym.id);
      }
    }
  };

  return (
    <div className="home-container">
      <Header />
      <Title />
      
      {/* Main search area */}
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
        {/* Map area */}
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
        
        {/* Force the sidebar to be a GymSidebar, not a Search component */}
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
