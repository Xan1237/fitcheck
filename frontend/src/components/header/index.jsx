import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaDumbbell } from "react-icons/fa";
import "./style.scss";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); 
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
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
          <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
          
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