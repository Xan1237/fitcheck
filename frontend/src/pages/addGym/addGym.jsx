import React, { useState } from "react";
import {
  FaDumbbell,
  FaMapMarkerAlt,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";
import "./styles.scss";
import Header from "../../components/header";
import Footer from "../../components/footer";

const AddGym = () => {
  const [formData, setFormData] = useState({
    gymName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    hoursMonday: "",
    hoursTuesday: "",
    hoursWednesday: "",
    hoursThursday: "",
    hoursFriday: "",
    hoursSaturday: "",
    hoursSunday: "",
    description: "",
    imageNotes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHoursPresets, setShowHoursPresets] = useState(false);
  const [presetHours, setPresetHours] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDays, setSelectedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special case for presetHours
    if (name === "presetHours") {
      setPresetHours(value);
      return;
    }

    // For all other inputs, remove $ if present and use the name as state key
    const stateKey = name.startsWith("$")
      ? name.substring(1)
      : name === "message"
      ? "description"
      : name;

    setFormData((prevState) => ({
      ...prevState,
      [stateKey]: value,
    }));
  };

  // Toggle a day selection for preset hours
  const toggleDaySelection = (day) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Apply preset hours to selected days
  const applyPresetHours = () => {
    const updatedFormData = { ...formData };

    if (selectedDays.monday) updatedFormData.hoursMonday = presetHours;
    if (selectedDays.tuesday) updatedFormData.hoursTuesday = presetHours;
    if (selectedDays.wednesday) updatedFormData.hoursWednesday = presetHours;
    if (selectedDays.thursday) updatedFormData.hoursThursday = presetHours;
    if (selectedDays.friday) updatedFormData.hoursFriday = presetHours;
    if (selectedDays.saturday) updatedFormData.hoursSaturday = presetHours;
    if (selectedDays.sunday) updatedFormData.hoursSunday = presetHours;

    setFormData(updatedFormData);
    // Reset the preset and selected days
    setPresetHours("");
    setShowHoursPresets(false);
  };

  // Apply common presets
  const applyCommonPreset = (preset) => {
    switch (preset) {
      case "weekdays":
        setSelectedDays({
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        });
        break;
      case "weekend":
        setSelectedDays({
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: true,
          sunday: true,
        });
        break;
      case "allWeek":
        setSelectedDays({
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        });
        break;
      case "weekdayBusiness":
        setPresetHours("9:00 AM - 5:00 PM");
        setSelectedDays({
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        });
        break;
      case "24hours":
        setPresetHours("Open 24 Hours");
        setSelectedDays({
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        });
        break;
      default:
        break;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const form = e.target;
      const formData = new FormData(form);
      
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
      
      if (response.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("There was an error submitting the form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="add-gym-container">
        <div className="form-header">
          <FaDumbbell className="form-icon" />
          <h1>Don't See Your Gym?</h1>
          <p>
            Help us grow our database by submitting your gym information below.
          </p>
        </div>

        {submitted ? (
          <div className="success-message">
            <h2>Thank You!</h2>
            <p>
              Your gym submission has been received. We'll review and add it to
              our database soon.
            </p>
            {formData.imageNotes && (
              <div className="image-reminder">
                <FaInfoCircle className="info-icon" />
                <p>
                  Remember to email your gym photos to{" "}
                  <strong>thefitcheckteam@gmail.com</strong> with your gym name
                  as the subject.
                </p>
              </div>
            )}
            <button
              className="submit-button"
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  gymName: "",
                  address: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  hoursMonday: "",
                  hoursTuesday: "",
                  hoursWednesday: "",
                  hoursThursday: "",
                  hoursFriday: "",
                  hoursSaturday: "",
                  hoursSunday: "",
                  description: "",
                  imageNotes: "",
                });
              }}
            >
              Submit Another Gym
            </button>
          </div>
        ) : (
          <form 
            className="gym-form" 
            onSubmit={handleSubmit}
            action="https://formspree.io/f/mpwpdbne" 
            method="POST"
          >
            {errorMessage && (
              <div className="error-message">
                <p>{errorMessage}</p>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="gymName">Gym Name*</label>
              <div className="input-container">
                <FaDumbbell className="input-icon" />
                <input
                  type="text"
                  id="gymName"
                  name="gymName"
                  value={formData.gymName}
                  onChange={handleChange}
                  required
                  placeholder="Enter gym name"
                />
              </div>
            </div>

            {/* Image Information Section */}
            <div className="form-section">
              <h3 className="section-title">Gym Photos</h3>

              <div className="info-box">
                <div className="info-header">
                  <FaInfoCircle className="info-icon" />
                  <h4>How to Share Your Gym Photos</h4>
                </div>
                <p>
                  After submitting this form, please email your gym photos to{" "}
                  <strong>thefitcheckteam@gmail.com</strong>. Include your gym
                  name in the subject line so we can match your photos with this
                  submission.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="imageNotes">Photo Information (Optional)</label>
                <textarea
                  id="imageNotes"
                  name="imageNotes"
                  value={formData.imageNotes}
                  onChange={handleChange}
                  placeholder="Describe what photos you'll be sending (e.g., 'Main entrance, weight room, cardio area')"
                  rows="3"
                ></textarea>
              </div>
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
                    name="address"
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
                    name="city"
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
                    name="state"
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
                    name="zipCode"
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

              {/* Batch Hours Entry */}
              <div className="quick-hours-section">
                <button
                  type="button"
                  className="toggle-hours-button"
                  onClick={() => setShowHoursPresets(!showHoursPresets)}
                >
                  {showHoursPresets
                    ? "Hide Bulk Hours Editor"
                    : "Set Hours for Multiple Days"}
                </button>

                {showHoursPresets && (
                  <div className="hours-preset-container">
                    <div className="preset-instructions">
                      <p>Quickly set the same hours for multiple days:</p>
                    </div>

                    <div className="quick-select-buttons">
                      <button
                        type="button"
                        onClick={() => applyCommonPreset("weekdays")}
                      >
                        Select Weekdays
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommonPreset("weekend")}
                      >
                        Select Weekend
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommonPreset("allWeek")}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedDays({
                            monday: false,
                            tuesday: false,
                            wednesday: false,
                            thursday: false,
                            friday: false,
                            saturday: false,
                            sunday: false,
                          })
                        }
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="common-presets">
                      <button
                        type="button"
                        onClick={() => applyCommonPreset("weekdayBusiness")}
                      >
                        Business Hours (9-5)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyCommonPreset("24hours")}
                      >
                        24 Hours
                      </button>
                    </div>

                    <div className="day-checkboxes">
                      <label className={selectedDays.monday ? "selected" : ""}>
                        <input
                          type="checkbox"
                          checked={selectedDays.monday}
                          onChange={() => toggleDaySelection("monday")}
                        />
                        Monday
                      </label>
                      <label className={selectedDays.tuesday ? "selected" : ""}>
                        <input
                          type="checkbox"
                          checked={selectedDays.tuesday}
                          onChange={() => toggleDaySelection("tuesday")}
                        />
                        Tuesday
                      </label>
                      <label
                        className={selectedDays.wednesday ? "selected" : ""}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDays.wednesday}
                          onChange={() => toggleDaySelection("wednesday")}
                        />
                        Wednesday
                      </label>
                      <label
                        className={selectedDays.thursday ? "selected" : ""}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDays.thursday}
                          onChange={() => toggleDaySelection("thursday")}
                        />
                        Thursday
                      </label>
                      <label className={selectedDays.friday ? "selected" : ""}>
                        <input
                          type="checkbox"
                          checked={selectedDays.friday}
                          onChange={() => toggleDaySelection("friday")}
                        />
                        Friday
                      </label>
                      <label
                        className={selectedDays.saturday ? "selected" : ""}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDays.saturday}
                          onChange={() => toggleDaySelection("saturday")}
                        />
                        Saturday
                      </label>
                      <label className={selectedDays.sunday ? "selected" : ""}>
                        <input
                          type="checkbox"
                          checked={selectedDays.sunday}
                          onChange={() => toggleDaySelection("sunday")}
                        />
                        Sunday
                      </label>
                    </div>

                    <div className="preset-hours-input">
                      <input
                        type="text"
                        name="presetHours"
                        value={presetHours}
                        onChange={handleChange}
                        placeholder="e.g., 6:00 AM - 10:00 PM"
                      />
                      <button
                        type="button"
                        onClick={applyPresetHours}
                        disabled={
                          !presetHours ||
                          !Object.values(selectedDays).some((day) => day)
                        }
                      >
                        Apply Hours
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="hoursMonday">Monday</label>
                <div className="input-container">
                  <FaClock className="input-icon" />
                  <input
                    type="text"
                    id="hoursMonday"
                    name="hoursMonday"
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
                    name="hoursTuesday"
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
                    name="hoursWednesday"
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
                    name="hoursThursday"
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
                    name="hoursFriday"
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
                    name="hoursSaturday"
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
                    name="hoursSunday"
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Tell us about this gym (equipment, amenities, classes, etc.)"
                rows="6"
              ></textarea>
            </div>

            {/* Hidden field for custom subject */}
            <input 
              type="hidden" 
              name="_subject" 
              value={`New Gym Submission: ${formData.gymName}`} 
            />

            {/* Add these hidden fields for Formspree configuration */}
            <input type="hidden" name="_replyto" value="noreply@yourdomain.com" />

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Gym"}
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AddGym;