import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import PublicProfile from '../../pages/publicProfile/PublicProfile'; // Import the profile page for modal logic


const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
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
      const response = await axios.post(`${VITE_API_BASE_URL}/api/getUserName`, {}, {
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
        <FaDumbbell />
        <span>Gyms</span>
      </Link>
      
      <button
        className={`nav-item${location.pathname === '/createPost' ? ' active' : ''}`}
        style={{ background: 'none', border: 'none', padding: 0 }}
        onClick={e => {
          e.preventDefault();
          navigate('/createPost');
        }}
      >
        <FaPlus />
        <span>Post</span>
      </button>
      
      <Link to="/people" className={`nav-item ${location.pathname === '/people' ? 'active' : ''}`}>
        <FaSearch />
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

      {showCreatePost && (
        <PublicProfile
          showAddPostModal={true}
          setShowAddPostModal={setShowCreatePost}
          // Optionally pass other props if needed
        />
      )}
    </div>
  );
};

export default BottomNav;
