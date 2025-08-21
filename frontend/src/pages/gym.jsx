import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gymData from "../data/gymData.js";
import Message from "../components/message";
import Header from "../components/header";
import Footer from "../components/footer";
import CommentModal from "../components/CommentModal";
import "./index.scss";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import {
  FaExternalLinkAlt,
  FaStar,
  FaRegClock,
  FaMapMarkerAlt,
  FaPhone,
  FaDirections,
  FaTags,
  FaUsers
} from "react-icons/fa";
import { use } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatTimeSince(dateString) {
  const createdAt = new Date(dateString);
  const now = new Date();
  const diffMs = now - createdAt;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    return `${diffDays}d`;
  }
}

const Gym = () => {
  const { gym } = useParams();
  const gymsData = gymData[gym];
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [gymTags, setGymTags] = useState([]);


  async function getPeopleByGymFrequented(params) {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/getPeopleByGymFrequented/${params.gymId}`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      // Handle successful response
      console.log("People frequented this gym:", response.data.data);
    } catch (error) {
      if (error.response) {
        console.error("Error fetching people:", error.response.data.message);
      } else {
        console.error("Error fetching people:", error.message);
      }
    }
  }

  useEffect(() => {
    const params = { gymId: gymsData.id };
    getPeopleByGymFrequented(params);
  }, []);

  useEffect(() => {
    fetchComments()
  }, [newComment]);

  useEffect(() =>{
    if(showModal==true){
    if(!localStorage.getItem("token")){
      window.alert("Please Sign In To Leave A Comment")
      setShowModal(false);
    }
  }
  }, [showModal]);

  // Temporary values for display purposes
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  

  // Function to calculate gym tags based on review frequency
  const calculateGymTags = (reviews, threshold = 0.25) => {
    // If there are no reviews, return empty array
    if (!reviews || reviews.length === 0) return [];
    
    // Count occurrence of each tag
    const tagCounts = {};
    
    // Count total number of reviews
    const totalReviews = reviews.length;
    
    // Iterate through all reviews and count tag occurrences
    reviews.forEach(review => {
      if (review.Tags && Array.isArray(review.Tags)) {
        review.Tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Calculate percentage for each tag and filter by threshold
    const gymTags = Object.entries(tagCounts)
      .filter(([_, count]) => count / totalReviews >= threshold)
      .map(([tag, count]) => ({
        tag,
        count,
        percentage: (count / totalReviews * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count); // Sort by frequency (most frequent first)
    
    return gymTags;
  };

  // Function to post a new comment
  const postComment = async () => {
    if (!newComment.trim()) {
      return; // Prevent posting empty comments
    }

    const commentData = {
      CommentID: uuidv4(),
      UserName: "Anonymous",
      CommentText: newComment,
      GymName: gymsData.name,
      GymId: gymsData.id,
      Time: dayjs().format("YYYY-MM-DD HH:mm"),
      Rating: rating,
      Tags: selectedTags || [],
    };
    const token = localStorage.getItem("token");
    try {
      console.log(commentData)
      const response = await fetch(`${API_BASE_URL}/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(commentData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessages([commentData, ...messages]);
        setNewComment("");
        setRating(0);
        setSelectedTags([]);
        setShowModal(false);
        calculateAverageRating([commentData, ...messages]);
        
        // Recalculate gym tags when a new comment is added
        const updatedMessages = [commentData, ...messages];
        const updatedGymTags = calculateGymTags(updatedMessages, 0.25);
        setGymTags(updatedGymTags);
        
        // Store the calculated tags in a global state or context
        // This will be implemented when you have a database
      } else {
        console.error("Error:", result.message);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // Function to fetch comments from the API
  const fetchComments = async () => {
    const gymName = gymsData.id;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/GetComments/?GymName=${encodeURIComponent(gymName)}`,
        { method: "GET" }
      );

      const result = await response.json();

      if (response.ok) {
        const formattedMessages = result.data.map((comment) => ({
          ...comment,
          Tags: comment.Tags || [], // Ensure Tags is always an array
        }));
        
        setMessages(formattedMessages);
        setTotalReviews(formattedMessages.length);
        calculateAverageRating(formattedMessages);
        
        // Calculate gym tags from reviews (using 25% as threshold)
        const aggregatedGymTags = calculateGymTags(formattedMessages, 0.25);
        setGymTags(aggregatedGymTags);
        
        // Store the calculated tags in a global state or context
        // This will be implemented when you have a database
      } else {
        console.error("Error fetching comments:", result.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  

  // Calculate average rating from messages
  const calculateAverageRating = (msgs) => {
    if (msgs.length === 0) return;

    const sum = msgs.reduce((total, msg) => total + (msg.Rating || 0), 0);
    setAverageRating((sum / msgs.length).toFixed(1));
  };

  // Fetch comments when the component mounts
  useEffect(() => {
    fetchComments();
  }, [gymsData.id]); // Re-fetch comments if gymsData.id changes

  // Render stars for average rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star-filled" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="star-half" />);
      } else {
        stars.push(<FaStar key={i} className="star-empty" />);
      }
    }
    return stars;
  };

  return (
    <div>
      <Header />
      <div className="gym-page">
        <div className="gym-header">
          <div className="gym-header-row">
            <h1 className="gym-name">{gymsData.name}</h1>
            <div className="gym-rating-container desktop-rating">
              <div className="gym-stars">{renderStars(averageRating)}</div>
              <div className="gym-rating-text">
                <span className="rating-number">{averageRating}</span>
                <span className="total-reviews">({totalReviews} reviews)</span>
              </div>
            </div>
          </div>
          {gymTags.length > 0 && (
            <div className="gym-tags-inline gym-tags-below desktop-tags">
              {gymTags.slice(0, 10).map(({ tag }) => (
                <span key={tag} className="gym-tag-inline">{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="gym-content">
          <div className="gym-main-info">
            {gymsData?.img && (
              <div className="gym-image-container">
                <img
                  className="gym-image"
                  src={gymsData.img}
                  alt={gymsData?.name || "Gym"}
                />
              </div>
            )}     
            <div className="gym-details">
              <div className="gym-contact-info">
                {gymsData.location && (
                  <div className="info-item">
                    <FaMapMarkerAlt className="info-icon" />
                    <span className="info-text">{gymsData.location}</span>
                  </div>
                )}

                {gymsData.phone && (
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <span className="info-text">{gymsData.phone}</span>
                  </div>
                )}

                {gymsData.website && (
                  <div className="info-item">
                    <FaExternalLinkAlt className="info-icon" />
                    <a
                      href={gymsData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-link"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                
                {gymsData.location && (
                  <div className="info-item">
                    <FaDirections className="info-icon" />
                    <a
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(gymsData.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-link"
                    >
                      Get Directions
                    </a>
                  </div>
                )}
                
                {gymsData.id && (
                  <div className="info-item">
                    <FaUsers className="info-icon" />
                    <Link
                      to={`/gym/${gymsData.id}/members`}
                      className="info-link"
                    >
                      Members
                    </Link>
                  </div>
                )}
              </div>

              <div className="gym-hours-container">
                <h3>
                  <FaRegClock className="hours-icon" /> Hours of Operation
                </h3>
                <div className="gym-hours">
                  {Object.entries(gymsData.gymHours).map(([day, hours]) => (
                    <div key={day} className="hours-row">
                      <span className="day">{day}:</span>
                      <span className="hours">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {gymsData.location && (
            <div className="gym-map-container">
              <h2 className="map-title"><FaMapMarkerAlt className="map-icon" /> Location</h2>
              <div className="gym-map">
                <iframe
                  title={`Map of ${gymsData.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(gymsData.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  className="google-map"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}

          <div className="reviews-section">
            <div className="reviews-header">
              <h2>Reviews</h2>
              <button
                onClick={() => setShowModal(true)}
                className="add-review-button"
              >
                Write a Review
              </button>
            </div>

            <div className="reviews-list">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  // Be tolerant of field names coming from the API
                  const username =
                    msg.UserName ||
                    msg.username ||
                    msg.UserNamedata ||
                    "anonymous";
                  const timeAgo = msg.Time ? `${formatTimeSince(msg.Time)} ago` : "";
                  const tags = Array.isArray(msg.Tags) ? msg.Tags : [];

                  return (
                    <article
                      key={msg.CommentID || index}
                      className="review-card"
                      aria-label="Gym review"
                    >
                      <header className="review-header">
                        <Link
                          to={`/profile/${username}`}
                          className="review-author-link"
                          title={`View ${username}'s profile`}
                        >
                          {username}
                        </Link>
                        {timeAgo && <span className="review-dot">•</span>}
                        {timeAgo && <time className="review-time">{timeAgo}</time>}
                        {typeof msg.Rating === "number" && (
                          <span className="review-rating" aria-label={`Rating ${msg.Rating}/5`}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FaStar
                                key={i}
                                className={i < Math.round(msg.Rating) ? "star-filled" : "star-empty"}
                              />
                            ))}
                            <span className="rating-number-inline">{msg.Rating}</span>
                          </span>
                        )}
                      </header>

                      <p className="review-text">{msg.CommentText}</p>

                      {tags.length > 0 && (
                        <ul className="review-tags">
                          {tags.map((t) => (
                            <li key={t} className="review-tag">{t}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="no-reviews">
                  No reviews yet. Be the first to add one!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <CommentModal
          newComment={newComment}
          setNewComment={setNewComment}
          postComment={postComment}
          closeModal={() => setShowModal(false)}
          rating={rating}
          setRating={setRating}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      )}
    <Footer />
    </div>
  );
};

export default Gym;