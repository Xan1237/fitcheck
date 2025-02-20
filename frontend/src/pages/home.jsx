import React, { useState } from 'react';
import Search from '../components/search';
import Map from '../components/map';
import Header from '../components/header';  // Make sure to import Header
import Footer from '../components/footer';  // Ensure Footer is also imported
import Title from '../components/title';  // Ensure Title is imported

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSearchSubmit = (query, filter) => {
    setSearchQuery(query);
    console.log('Search Query:', query);
    console.log('Filter:', filter);

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
