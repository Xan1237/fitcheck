import React, { useState } from 'react';
import Search from '../components/search';
import Map from '../components/map';
import Header from '../components/header';  // Make sure to import Header
import Footer from '../components/footer';  // Ensure Footer is also imported
import Title from '../components/title';  // Ensure Title is imported

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearchSubmit = (query, filter) => {
    setSearchQuery(query);
    console.log('Search Query:', query);
    console.log('Filter:', filter);

    // Simulate search results based on the query and filter
    const results = simulateSearchResults(query, filter);
    setSearchResults(results);
  };

  // Simulate search results (replace with your actual search logic)
  const simulateSearchResults = (query, filter) => {
    const gyms = [
      { name: 'Fit For Less', location: { lat: 44.651, lng: -63.582 } },
      { name: 'Goodlife', location: { lat: 44.648, lng: -63.575 } },
      { name: 'Planet Fitness', location: { lat: 44.655, lng: -63.589 } },
      { name: 'FitnessFX', location: { lat: 44.642, lng: -63.592 } },
    ];

    return gyms.filter((gym) => {
      const matchesQuery = gym.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || gym.name === filter;
      return matchesQuery && matchesFilter;
    });
  };

  return (
    <div>
      <Header />
      <Title />
      <Search
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        onSearchSubmit={handleSearchSubmit}
      />
      <Map searchResults={searchQuery} />
      <Footer />
    </div>
  );
};

export default Home;
