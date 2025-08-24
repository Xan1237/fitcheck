import React, { useState, useEffect, useTransition} from "react";
import { useNavigate } from "react-router-dom";
import Search from "../../components/search";
import Map from "../../components/map";
import Header from "../../components/header";
import Footer from "../../components/footer";
import Title from "../../components/title";
import gymData from "../../data/gymData.js"; 
import GymSidebar from "../../components/gymSidebar";
import GymSearch from "../../components/GymSearch/GymSearch";
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
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();
  const [showGymSearch, setShowGymSearch] = useState(false);


  const fetchGymsForProvince = async (province) => {
    try {
      setIsLoading(true);

      // 1) Try dynamic data from API
      const res = await fetch(`${API_BASE_URL}/api/getGymsByProvince/${encodeURIComponent(province)}`);
      if (!res.ok) throw new Error(`Province fetch failed: ${res.status}`);
      const gymsFromApi = await res.json(); // expect an array of gyms

      // Normalize and return (prefer backend truth)
      return (gymsFromApi || []).map(g => ({
        id: Number.isNaN(Number(g.id)) ? g.id : Number(g.id),
        name: g.name,
        province: province,
        position: g.position,         // [lat, lng]
        tags: g.tags || [],
        rating: Number(g.rating ?? g.avg_rating ?? 0),
        ratingCount: Number(g.rating_count ?? g.ratingCount ?? 0),
        link: g.link,
        location: g.location,
        gym_hours: g.gym_hours
      }));
    } catch (e) {
      console.warn("Falling back to static province data:", e?.message);

      // 2) Fallback to static dataset for this province only
      const staticGyms = Object.entries(gymData)
        .map(([id, data]) => ({ id: Number(id), ...data }))
        .filter(g => g.province === province)
        .map(g => ({
          ...g,
          tags: g.tags || [],
          rating: 0,
          ratingCount: 0,
        }));

      return staticGyms;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGymSelectFromHome = async (gym) => {
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      if (token && username && gym?.id) {
        await fetch(`${API_BASE_URL}/api/addUserGym`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            gymId: gym.id,
            username,
            gymName: gym.name,
            // Home gyms may have either `address` or a nested `location.address`.
            gymAdress: gym.address || gym?.location?.address || ""
          })
        });
      }
    } catch (e) {
      console.error("Error adding gym from Home:", e);
      // Non-blocking — still navigate so the user lands on the gym page
    } finally {
      setShowGymSearch(false);
      // Take user to the gym's review/details page (same route used elsewhere)
      navigate(`/gym/${gym.id}`);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchGymsForProvince(filter);
      if (cancelled) return;
      startTransition(() => {
        setGyms(data);
        setFilteredGyms(data);
       // Optional: reset activeGym to first item when province changes
        setActiveGym(data[0] || null);
      });
    })();
    return () => { cancelled = true; };
  }, [filter]);


  // // Filter gyms by province whenever gyms or filter changes
  // useEffect(() => {
  //   if (gyms && gyms.length > 0) {
  //     const provinceGyms = gyms.filter(gym => gym.province === filter);
  //     setFilteredGyms(provinceGyms);
  //   }
  // }, [gyms, filter]);

  useEffect(() => {
    // Update map center and zoom when filter (province) changes
    if (provinceCenters[filter]) {
      setMapCenter(provinceCenters[filter]);
      setMapZoom(provinceZooms[filter] || 6);
    }
  }, [filter]);

  const handleSearchSubmit = (query, newFilter, filtered) => {
    setSearchQuery(query);
    // Changing the province triggers the fetch effect above
    setFilter(newFilter);
    // Any pre-computed filtered array from Search can be applied as a low-priority update
    if (filtered && Array.isArray(filtered)) {
      startTransition(() => setFilteredGyms(filtered));
    }
    if (provinceCenters[newFilter]) {
      setMapCenter(provinceCenters[newFilter]);
      setMapZoom(provinceZooms[newFilter] || 6);
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
          onOpenGymNameSearch={() => setShowGymSearch(true)}   // ← new
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
      {showGymSearch && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <header className="modal-head">
              <h3>Search gyms</h3>
              <button className="icon-btn" aria-label="Close" onClick={() => setShowGymSearch(false)}>
                ✕
              </button>
            </header>
            <div className="modal-body gym-search-body">
              {/* Use the same component and look/feel as Public Profile */}
              <GymSearch gyms={gyms} onGymSelect={handleGymSelectFromHome} />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Home;