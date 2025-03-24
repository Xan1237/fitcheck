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


  
  // Convert gymData object into an array of gym objects with id
  const gyms = Object.entries(gymData).map(([id, data]) => ({
    id: parseInt(id),
    ...data,
    // Initialize empty tags array for each gym if not present
    tags: data.tags || []
  }));

  // Initialize filteredGyms with all gyms on first render
  useEffect(() => {
    setFilteredGyms(gyms);
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
      <Search
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onSearchSubmit={handleSearchSubmit}
        gyms={gyms}
      />
      <div className="map-sidebar-container">
        <div className="map-wrapper">
          <Map
            searchResults={searchQuery}
            markers={filteredGyms} // Use filtered gyms for the map
            activeGym={activeGym}
            setActiveGym={setActiveGym}
          />
        </div>
        <div className="sidebar-wrapper">
          <GymSidebar
            gyms={filteredGyms} // Use filtered gyms for the sidebar
            activeGym={activeGym}
            setActiveGym={setActiveGym}
            filter={filter}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;