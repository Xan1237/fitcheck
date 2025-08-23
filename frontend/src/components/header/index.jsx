import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaDumbbell, FaUser, FaSearch, FaPlus, FaHome } from "react-icons/fa";
import "./style.scss";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Check auth status and fetch username
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isTokenValid = !!token;
    setIsLoggedIn(isTokenValid);
    
    if (isTokenValid) {
      fetchUsername();
    }
  }, []);

  // Control body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName("");
  };

  const fetchUsername = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    setLoading(true);
    try {
      // Just call getUserName - it already handles token verification
      const response = await axios.post(`/api/getUserName`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userData = response.data;
      
      if (!userData || !userData.success) {
        throw new Error('Failed to get username');
      }

      if (userData.username) {
        setUserName(userData.username);
      } else {
        console.error("Username not found in response");
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <FaDumbbell className="logo-icon" /> FitCheck
        </Link>

        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
             Home
          </Link>
          <Link to="/people" onClick={() => setMenuOpen(false)}>
            People
          </Link>
          <Link to="/FindGym" onClick={() => setMenuOpen(false)}>
             Gyms
          </Link>
          <Link to="/createPost" onClick={() => setMenuOpen(false)}>
           Post
          </Link>
          {/* Contact section not shown in mobile, so skip */}
          {isLoggedIn ? (
            <>
              <Link to={`/profile/${userName}`} onClick={() => setMenuOpen(false)}>
                {loading ? "Loading..." : <> Profile</>}
              </Link>
              <button 
                className="cta-button" 
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                Log Out
              </button>
            </>
          ) : (
            <Link to="/login" className="cta-button" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;