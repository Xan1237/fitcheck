import React, { useState } from "react";
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import "./styles.scss";
import Header from "../../components/header";
import Footer from "../../components/footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
      <div className="contact-container">
        <div className="contact-content">
          {/* Contact Information Section */}
          <div className="contact-info">
            <div className="info-header">
              <FaEnvelope className="info-icon" />
              <h1>Contact Us</h1>
            </div>
            
            <p className="intro-text">
              Have questions, suggestions, or need assistance? We're here to help!
              Fill out the form below or use our contact information to get in touch.
            </p>
            
            <div className="info-cards">
              <div className="info-card">
                <div className="card-icon">
                  <FaMapMarkerAlt />
                </div>
                <h3>Our Location</h3>
                <p>123 Fitness Street</p>
                <p>Muscle City, CA 90210</p>
              </div>
              
              <div className="info-card">
                <div className="card-icon">
                  <FaEnvelope />
                </div>
                <h3>Email Us</h3>
                <p>
                  <a href="mailto:saulhafting@gmail.com">saulhafting@gmail.com</a>
                </p>
                <p>We typically respond within 24 hours</p>
              </div>
              
              <div className="info-card">
                <div className="card-icon">
                  <FaPhone />
                </div>
                <h3>Call Us</h3>
                <p>
                  <a href="tel:+15551234567">(555) 123-4567</a>
                </p>
                <p>Mon-Fri: 9AM-5PM (PST)</p>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="form-wrapper">
            {submitted ? (
              <div className="success-message">
                <h2>Thank You!</h2>
                <p>
                  Your message has been received. We'll get back to you as soon as possible.
                </p>
                <button
                  className="submit-button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      subject: "",
                      message: "",
                    });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form 
                className="contact-form" 
                onSubmit={handleSubmit}
                action="https://formspree.io/f/xaneordy" 
                method="POST"
              >
                <h2 className="form-title">Send Us a Message</h2>

                {errorMessage && (
                  <div className="error-message">
                    <p>{errorMessage}</p>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="name">Your Name*</label>
                  <div className="input-container">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="form-row two-columns">
                  <div className="form-group">
                    <label htmlFor="email">Email Address*</label>
                    <div className="input-container">
                      <FaEnvelope className="input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-container">
                      <FaPhone className="input-icon" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone (optional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject*</label>
                  <div className="input-container">
                    <FaQuestionCircle className="input-icon" />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is your message regarding?"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message*</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Type your message here..."
                    rows="6"
                  ></textarea>
                </div>

                {/* Hidden field for custom subject */}
                <input 
                  type="hidden" 
                  name="_subject" 
                  value={`Contact Form: ${formData.subject}`} 
                />

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h3><FaInfoCircle className="faq-icon" /> How do I add my gym to your database?</h3>
              <p>You can submit your gym by visiting our <a href="/add-gym">Add Gym</a> page and completing the submission form with your gym's details.</p>
            </div>
            
            <div className="faq-item">
              <h3><FaInfoCircle className="faq-icon" /> How long does it take for a gym submission to be approved?</h3>
              <p>We typically review and approve gym submissions within 2-3 business days. You'll receive a confirmation email once your submission is approved.</p>
            </div>
            
            <div className="faq-item">
              <h3><FaInfoCircle className="faq-icon" /> Can I update information about my gym?</h3>
              <p>Yes! If you need to update information about your gym, please contact us with the updated details, and we'll make the changes promptly.</p>
            </div>
            
            <div className="faq-item">
              <h3><FaInfoCircle className="faq-icon" /> How can I report inaccurate information?</h3>
              <p>If you find any inaccurate information about a gym in our database, please let us know through this contact form, and we'll investigate and correct it.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactUs;