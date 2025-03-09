import React, { useState } from "react";
import "./style.scss";

const tagOptions = [
  "Clean",
  "Crowded",
  "Great Equipment",
  "Powerlifting Friendly",
  "Bodybuilding Focused",
  "Cardio Machines",
  "Friendly Staff",
  "Expensive",
  "Affordable",
  "Open 24/7",
  "Good Music",
  "Locker Rooms",
  "Showers Available",
  "Parking Available",
  "No Parking",
  "Sauna",
  "CrossFit Friendly",
  "Personal Trainers",
  "Women Friendly",
];

const CommentModal = ({
  newComment,
  setNewComment,
  postComment,
  closeModal,
  rating,
  setRating,
  selectedTags,
  setSelectedTags,
}) => {
  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  return (
    <div className="commentModal">
      <div className="commentModalContent">
        <h2>Leave a Review</h2>

        {/* Star Rating */}
        <div className="ratingSection">
          <span>Rate the gym:</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className={`star ${rating >= value ? "selected" : ""}`}
                onClick={() => setRating(value)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Gym Tags Selection */}
        <div className="tagSelection">
          <h3>Gym Tags:</h3>
          <div className="tagsGrid">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                className={`tagButton ${
                  selectedTags.includes(tag) ? "selected" : ""
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your comment here..."
          className="commentTextArea"
        />

        {/* Buttons */}
        <div className="commentModalButtons">
          <button onClick={postComment} className="submitCommentButton">
            Submit
          </button>
          <button onClick={closeModal} className="closeCommentButton">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
