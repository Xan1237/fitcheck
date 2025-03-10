import React, { useState } from 'react';
import Search from '../../components/search';
import Map from '../../components/map';
import Header from '../../components/header';
import Footer from '../../components/footer';
import Title from '../../components/title';
import GymSidebar from '../../components/GymSidebar'; // Import the new GymSidebar component
import './styles.scss'; // Add a new scss file for home layout

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeGym, setActiveGym] = useState(null);
  
  // Gym data (moved from Map component to make it accessible to both Map and GymSidebar)
  const gyms = [
    {
      id: 1,
      name: "Fit For Less",
      position: [44.77269337771879, -63.693536924525894],
      description: "Fit For Less Lower Sackville",
      link: "/gym/sackville"
    },
    {
      id: 2,
      name: "Fit For Less",
      position: [44.73686038444007, -63.65620366193974],
      description: "Fit For Less Bedford",
      link: "/gym/BedfordFitForLess"
    },
    {
      id: 3,
      name: "Fit For Less",
      position: [44.66158683551251, -63.65525032597009],
      description: "Fit For Less Lacewood Drive",
      link: "/gym/LacewoodFitForLess"
    },
    {
      id: 4,
      name: "Test Gym",
      position: [10, -10],
      description: "Fit For Less Lacewood Drive",
      link: "/gym/LacewoodFitForLess"
    },
    {
      id: 5,
      name: "Test Gym",
      position: [11, -10],
      description: "Fit For Less Lacewood Drive",
      link: "/gym/LacewoodFitForLess"
    },
    {
      id: 6,
      name: "Test Gym",
      position: [12, -10],
      description: "Fit For Less Lacewood Drive",
      link: "/gym/LacewoodFitForLess"
    }
  ];

  const handleSearchSubmit = (query, filter) => {
    setSearchQuery(query);
    setFilter(filter);
    console.log('Search Query:', query);
    console.log('Filter:', filter);

    // Filter gyms based on the selected filter
    if (filter !== 'all' && gyms.length > 0) {
      const filteredGym = gyms.find(gym => gym.name === filter);
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