import React, { useState } from "react";
import Search from "../../components/search";
import Map from "../../components/map";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Title from "../../components/title";
import GymSidebar from "../../components/GymSidebar"; // Import the new GymSidebar component
import "./styles.scss"; // Add a new scss file for home layout

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeGym, setActiveGym] = useState(null);

  // Gym data (moved from Map component to make it accessible to both Map and GymSidebar)
  const gyms = [
    {
      id: 1,
      name: "Fit For Less",
      position: [44.77269337771879, -63.693536924525894],
      description: "Lower Sackville",
      link: "/gym/sackville",
    },
    {
      id: 2,
      name: "Fit For Less",
      position: [44.73686038444007, -63.65620366193974],
      description: "Bedford",
      link: "/gym/BedfordFitForLess",
    },
    {
      id: 3,
      name: "Fit For Less",
      position: [44.66158683551251, -63.65525032597009],
      description: "Lacewood Drive, Halifax",
      link: "/gym/LacewoodFitForLess",
    },
    {
      id: 4,
      name: "FitnessFX",
      position: [44.660803, -63.6374113],
      description: "Lacewood Drive, Halifax",
      link: "/gym/fitnessFX",
    },
    {
      id: 5,
      name: "ACA fitness centre",
      position: [44.84267095290403, -65.28049822539818],
      description: "Bridgetown, Nova Scotia",
      link: "/gym/ACAfitnesscentre",
    },
    {
      id: 6,
      name: "Anytime Fitness",
      position: [44.6405595, -63.5793907],
      description: "South Halifax",
      link: "/gym/AnytimeFitnessSouthHalifax",
    },
    {
      id: 7,
      name: "Dalplex",
      position: [44.6340937, -63.591322],
      description: "Dalhousie University, Halifax",
      link: "/gym/Dalplex",
    },
  ];

  const handleSearchSubmit = (query, filter) => {
    setSearchQuery(query);
    setFilter(filter);
    console.log("Search Query:", query);
    console.log("Filter:", filter);

    // Filter gyms based on the selected filter
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
