import React from 'react';
import './style.scss'; // Import the SCSS file
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaClipboard } from 'react-icons/fa'; // Social media icons

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h3 className="footer-heading">Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Don't See Your Gym</h3>
          <p>Submit Your Gym Here <FaClipboard/> </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Fitness App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;