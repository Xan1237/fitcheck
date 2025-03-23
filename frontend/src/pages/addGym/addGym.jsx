import React, { useState } from 'react';
import { FaDumbbell, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaClock, FaImage } from 'react-icons/fa';
import './styles.scss';
import Header from '../../components/header';

const AddGym = () => {
  const [formData, setFormData] = useState({
    gymName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hoursMonday: '',
    hoursTuesday: '',
    hoursWednesday: '',
    hoursThursday: '',
    hoursFriday: '',
    hoursSaturday: '',
    hoursSunday: '',
    description: ''
  });
  
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle file uploads
  const handleImageChange = (e) => {
    if (e.target.files) {
      // Convert FileList to Array
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
    }
  };

  // Fixed handleChange to properly handle the special field names
  const handleChange = (e) => {
    const { name, value } = e.target;
    let stateKey;
    
    // Map the form field names to the state keys
    if (name === '$gymName') stateKey = 'gymName';
    else if (name === '$address') stateKey = 'address';
    else if (name === '$city') stateKey = 'city';
    else if (name === '$state') stateKey = 'state';
    else if (name === '$zipCode') stateKey = 'zipCode';
    else if (name === '$hoursMonday') stateKey = 'hoursMonday';
    else if (name === '$hoursTuesday') stateKey = 'hoursTuesday';
    else if (name === '$hoursWednesday') stateKey = 'hoursWednesday';
    else if (name === '$hoursThursday') stateKey = 'hoursThursday';
    else if (name === '$hoursFriday') stateKey = 'hoursFriday';
    else if (name === '$hoursSaturday') stateKey = 'hoursSaturday';
    else if (name === '$hoursSunday') stateKey = 'hoursSunday';
    else if (name === 'message') stateKey = 'description';
    else stateKey = name;
    
    setFormData(prevState => ({
      ...prevState,
      [stateKey]: value
    }));
  };

  // Handle local form submission success manually
  const handleSubmit = (e) => {
    setIsSubmitting(true);
    // We'll let the form submit naturally
    // But we'll manually show success state when the page would reload
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <>
    <Header />
    <div className="add-gym-container">
      <div className="form-header">
        <FaDumbbell className="form-icon" />
        <h1>Don't See Your Gym?</h1>
        <p>Help us grow our database by submitting your gym information below.</p>
      </div>

      {submitted ? (
        <div className="success-message">
          <h2>Thank You!</h2>
          <p>Your gym submission has been received. We'll review and add it to our database soon.</p>
          <button 
            className="submit-button" 
            onClick={() => {
              setSubmitted(false);
              window.location.reload(); // Reload page to reset form state fully
            }}
          >
            Submit Another Gym
          </button>
        </div>
      ) : (
        // StaticForms approach with form enctype for file uploads
        <form 
          className="gym-form" 
          action="https://api.staticforms.xyz/submit" 
          method="POST"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          {/* StaticForms configuration */}
          <input type="hidden" name="accessKey" value="51f82b9a-8e74-48e5-8cf5-5edd25a0b94b" />
          <input type="hidden" name="redirectTo" value={window.location.href} />
          <input type="hidden" name="subject" value="New Gym Submission" />
          
          <div className="form-group">
            <label htmlFor="gymName">Gym Name*</label>
            <div className="input-container">
              <FaDumbbell className="input-icon" />
              <input
                type="text"
                id="gymName"
                name="$gymName"
                value={formData.gymName}
                onChange={handleChange}
                required
                placeholder="Enter gym name"
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label htmlFor="gymImages">Gym Images</label>
            <div className="image-upload-container">
              <FaImage className="input-icon" />
              <input
                type="file"
                id="gymImages"
                name="$gymImages"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="file-input"
              />
              <div className="file-input-label">
                <span>Choose files</span>
                <p className="file-count">
                  {images.length > 0 ? `${images.length} file(s) selected` : 'No files chosen'}
                </p>
              </div>
            </div>
            {images.length > 0 && (
              <div className="image-preview-container">
                {images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <p>{image.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address Section */}
          <div className="form-section">
            <h3 className="section-title">Address</h3>
            
            <div className="form-group">
              <label htmlFor="address">Street Address*</label>
              <div className="input-container">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  id="address"
                  name="$address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Street address"
                />
              </div>
            </div>

            <div className="form-row three-columns">
              <div className="form-group">
                <label htmlFor="city">City*</label>
                <input
                  type="text"
                  id="city"
                  name="$city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State*</label>
                <input
                  type="text"
                  id="state"
                  name="$state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="State"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">Zip Code*</label>
                <input
                  type="text"
                  id="zipCode"
                  name="$zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  placeholder="Zip code"
                />
              </div>
            </div>
          </div>

          {/* Hours Section */}
          <div className="form-section">
            <h3 className="section-title">Hours of Operation</h3>
            
            <div className="form-group">
              <label htmlFor="hoursMonday">Monday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursMonday"
                  name="$hoursMonday"
                  value={formData.hoursMonday}
                  onChange={handleChange}
                  placeholder="e.g., 6:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hoursTuesday">Tuesday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursTuesday"
                  name="$hoursTuesday"
                  value={formData.hoursTuesday}
                  onChange={handleChange}
                  placeholder="e.g., 6:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hoursWednesday">Wednesday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursWednesday"
                  name="$hoursWednesday"
                  value={formData.hoursWednesday}
                  onChange={handleChange}
                  placeholder="e.g., 6:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hoursThursday">Thursday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursThursday"
                  name="$hoursThursday"
                  value={formData.hoursThursday}
                  onChange={handleChange}
                  placeholder="e.g., 6:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hoursFriday">Friday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursFriday"
                  name="$hoursFriday"
                  value={formData.hoursFriday}
                  onChange={handleChange}
                  placeholder="e.g., 6:00 AM - 10:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hoursSaturday">Saturday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursSaturday"
                  name="$hoursSaturday"
                  value={formData.hoursSaturday}
                  onChange={handleChange}
                  placeholder="e.g., 8:00 AM - 8:00 PM"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hoursSunday">Sunday</label>
              <div className="input-container">
                <FaClock className="input-icon" />
                <input
                  type="text"
                  id="hoursSunday"
                  name="$hoursSunday"
                  value={formData.hoursSunday}
                  onChange={handleChange}
                  placeholder="e.g., 8:00 AM - 8:00 PM"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="message" // uses the message field in StaticForms
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Tell us about this gym (equipment, amenities, classes, etc.)"
              rows="6"
            ></textarea>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Gym'}
            </button>
          </div>
        </form>
      )}
    </div>
    </>
  );
};

export default AddGym;