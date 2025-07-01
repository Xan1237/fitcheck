import React from 'react';
import './style.scss'; // Import the SCSS file
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaClipboard, FaSpeakerDeck, FaEnvelope } from 'react-icons/fa'; // Social media icons

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h3 className="footer-heading">Contact US</h3>
          <p onClick={() => navigate("/addGym")}>Send Us A Message <FaEnvelope/> </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Don't See Your Gym</h3>
          <p onClick={() => navigate("/addGym")}>Submit Your Gym Here <FaClipboard/> </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Fitness App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;