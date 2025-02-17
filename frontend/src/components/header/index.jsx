import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes, FaDumbbell } from "react-icons/fa";
import "./style.scss";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <FaDumbbell className="logo-icon" /> FitCheck
        </Link>

        {/* Hamburger Menu Icon */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Dropdown Menu */}
        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/workouts" onClick={() => setMenuOpen(false)}>Workouts</Link>
          <Link to="/nutrition" onClick={() => setMenuOpen(false)}>Nutrition</Link>
          <Link to="/membership" onClick={() => setMenuOpen(false)}>Membership</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/join" className="cta-button" onClick={() => setMenuOpen(false)}>Join Now</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
