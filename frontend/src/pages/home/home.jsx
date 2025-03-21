import React, { useState } from "react";
import Search from "../../components/search";
import Map from "../../components/map";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Title from "../../components/title";
import gymData from "../../data/gymData.js"; 
import GymSidebar from "../../components/GymSidebar"; // Import the new GymSidebar component
import "./styles.scss"; // Add a new scss file for home layout

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeGym, setActiveGym] = useState(null);

  // Convert gymData object into an array of gym objects with id
  const gyms = Object.entries(gymData).map(([id, data]) => ({
    id: parseInt(id),
    ...data,
  }));

  const handleSearchSubmit = (query, filter) => {
    setSearchQuery(query);
    setFilter(filter);
    console.log("Search Query:", query);
    console.log("Filter:", filter);

    // Filter gyms based on the selected filter
    if (filter !== "all" && gyms.length > 0) {
      const filteredGym = gyms.find((gym) =>  gym.name === filter);
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
      />
      <div className="map-sidebar-container">
        <div className="sidebar-wrapper">
          <GymSidebar
            gyms={gyms}
            activeGym={activeGym}
            setActiveGym={setActiveGym}
            filter={filter}
          />
        </div>
        <div className="map-wrapper">
          <Map
            searchResults={searchQuery}
            markers={gyms}
            activeGym={activeGym}
            setActiveGym={setActiveGym}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
