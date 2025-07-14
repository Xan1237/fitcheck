import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaSearch, 
  FaPlus, 
  FaEnvelope, 
  FaUser,
  FaDumbbell 
} from 'react-icons/fa';
import axios from 'axios';
import './style.scss';

const BottomNav = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  
  // Check auth status and fetch username
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isTokenValid = !!token;
    setIsLoggedIn(isTokenValid);
    
    if (isTokenValid) {
      fetchUsername();
    }
  }, []);

  const fetchUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post('/api/getUserName', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success && response.data?.username) {
        setUserName(response.data.username);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  // Don't show bottom nav on login page or desktop
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <div className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <FaHome />
        <span>Home</span>
      </Link>
      
      <Link to="/FindGym" className={`nav-item ${location.pathname === '/FindGym' ? 'active' : ''}`}>
        <FaSearch />
        <span>Search</span>
      </Link>
      
      <Link to="/addGym" className={`nav-item ${location.pathname === '/addGym' ? 'active' : ''}`}>
        <FaPlus />
        <span>Post</span>
      </Link>
      
      <Link to="/contactUs" className={`nav-item ${location.pathname === '/contactUs' ? 'active' : ''}`}>
        <FaEnvelope />
        <span>Contact</span>
      </Link>
      
      {isLoggedIn ? (
        <Link to={`/profile/${userName}`} className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}>
          <FaUser />
          <span>Profile</span>
        </Link>
      ) : (
        <Link to="/login" className={`nav-item ${location.pathname === '/login' ? 'active' : ''}`}>
          <FaUser />
          <span>Login</span>
        </Link>
      )}
    </div>
  );
};

export default BottomNav;
