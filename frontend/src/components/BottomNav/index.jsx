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
  
  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (!userName) {
      navigate('/setUsername');
      return;
    }
    
    navigate(path);
  };
  
  // Check auth status and fetch username
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isTokenValid = !!token;
    setIsLoggedIn(isTokenValid);
    
    if (isTokenValid) {
      fetchUsername();
    }
  }, []);

  // Handle bottom navigation spacing
  useEffect(() => {
    const updateBottomNavSpacing = () => {
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav && window.innerWidth <= 768) {
        const navHeight = bottomNav.offsetHeight;
        document.documentElement.style.setProperty('--bottom-nav-height', `${navHeight}px`);
        
        // Only apply spacing to main page containers, not to root or body
        const pageContainers = document.querySelectorAll('.messages-page, .feed-page, .home-page, .profile-page, .people-page, .gym-page, .create-post-page');
        pageContainers.forEach(container => {
          if (container && container.style) {
            container.style.paddingBottom = `${navHeight}px`;
            container.style.minHeight = `calc(100vh - ${navHeight}px)`;
          }
        });
        
        // Ensure root and body don't have extra padding
        if (document.documentElement) {
          document.documentElement.style.paddingBottom = '0';
        }
        if (document.body) {
          document.body.style.paddingBottom = '0';
        }
      }
    };

    // Initial update
    updateBottomNavSpacing();
    
    // Update on resize and orientation change
    window.addEventListener('resize', updateBottomNavSpacing);
    window.addEventListener('orientationchange', updateBottomNavSpacing);
    
    // Update after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updateBottomNavSpacing, 100);
    
    return () => {
      window.removeEventListener('resize', updateBottomNavSpacing);
      window.removeEventListener('orientationchange', updateBottomNavSpacing);
      clearTimeout(timeoutId);
      
      // Cleanup: reset spacing when component unmounts
      document.documentElement.style.removeProperty('--bottom-nav-height');
      
      // Reset page container spacing
      const pageContainers = document.querySelectorAll('.messages-page, .feed-page, .home-page, .profile-page, .people-page, .gym-page, .create-post-page');
      pageContainers.forEach(container => {
        if (container && container.style) {
          container.style.paddingBottom = '';
          container.style.minHeight = '';
        }
      });
      
      // Ensure root and body are reset
      if (document.documentElement) {
        document.documentElement.style.paddingBottom = '';
      }
      if (document.body) {
        document.body.style.paddingBottom = '';
      }
    };
  }, []);

  const fetchUsername = async () => {
    console.log("Fetching username...");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      const response = await axios.post(`${VITE_API_BASE_URL}/api/getUserName`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Username fetch response:", response.data);
      if (response.data?.success && response.data?.username) {
        setUserName(response.data.username);
      } else {
        // User is authenticated but has no username
        navigate('/setUsername');
      }
    } catch (error) {
      if (error.response?.status === 500) {
        // Token is invalid
         navigate('/setUsername');
      } else if (error.response?.status === 404 || !error.response) {
        // User exists but has no username, or other error
        navigate('/setUsername');
      }
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

      
      <button
        className={`nav-item ${location.pathname === '/FindGym' ? 'active' : ''}`}
        style={{ background: 'none', border: 'none', padding: 0 }}
        onClick={() => handleProtectedNavigation('/FindGym')}
      >
        <FaDumbbell />
        <span>Gyms</span>
      </button>
      
      <button
        className={`nav-item${location.pathname === '/createPost' ? ' active' : ''}`}
        style={{ background: 'none', border: 'none', padding: 0 }}
        onClick={() => handleProtectedNavigation('/createPost')}
      >
        <FaPlus />
        <span>Post</span>
      </button>
      
      <button
        className={`nav-item ${location.pathname === '/people' ? 'active' : ''}`}
        style={{ background: 'none', border: 'none', padding: 0 }}
        onClick={() => handleProtectedNavigation('/people')}
      >
        <FaSearch />
        <span>Contact</span>
      </button>
      
      {isLoggedIn ? (
        <button
          className={`nav-item ${location.pathname.includes('/profile') ? 'active' : ''}`}
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => handleProtectedNavigation(`/profile/${userName}`)}
        >
          <FaUser />
          <span>Profile</span>
        </button>
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
