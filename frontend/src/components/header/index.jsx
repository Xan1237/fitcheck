import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaDumbbell } from "react-icons/fa";
import "./style.scss";
import axios from "axios";

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
      // First verify the token by getting user info
      const { data: { user }, error: authErr } = await axios.post('/api/getUser', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (authErr || !user) {
        throw new Error(authErr?.message || 'Invalid token');
      }

      // Then get the username from the users table
      const { data: userData, error: userError } = await axios.post('/api/getUserName', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (userError || !userData) {
        throw new Error(userError?.message || 'User not found');
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
          <Link to="/ContactUs" onClick={() => setMenuOpen(false)}>Contact Us</Link>
          <Link to="/addGym" onClick={() => setMenuOpen(false)}>Don't See Your Gym</Link>
          
          {isLoggedIn ? (
            <>
              <Link to={`/profile/${userName}`} onClick={() => setMenuOpen(false)}>
                {loading ? "Loading..." : userName || "My Profile"}
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