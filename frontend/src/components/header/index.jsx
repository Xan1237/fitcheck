import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaDumbbell } from "react-icons/fa";
import "./style.scss";
import axios from "axios"

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);

  // Add effect to control body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      // Prevent body scrolling when menu is open
      document.body.classList.add('menu-open');
    } else {
      // Re-enable scrolling when menu is closed
      document.body.classList.remove('menu-open');
    }
    
    // Clean up effect when component unmounts
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    username();
  }, []);

  const username = () => {
    const token = localStorage.getItem("token");  
    axios.post('/api/getUserName', {
      firstName: 'Fred',
      lastName: 'Flintstone'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(function (response) {
      console.log(response.data.username);
      setUserName(response.data.username);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

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
          <Link to={`/profile/${userName}`} onClick={() => setMenuOpen(false)}>My Profile</Link>
          
          {isLoggedIn ? (
            <button className="cta-button" onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}>Log Out</button>
          ) : (
            <Link to="/login" className="cta-button" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;