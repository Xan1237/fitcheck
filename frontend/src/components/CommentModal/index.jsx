import React, { useState } from "react";
import "./style.scss";

const CommentModal = ({
  newComment,
  setNewComment,
  postComment,
  closeModal,
  rating,
  setRating,
  chalkAllowed,
  setChalkAllowed,
  calibratedPlatesAllowed,
  setCalibratedPlatesAllowed,
}) => {
  // Function to handle star rating
  const handleRating = (value) => {
    setRating(value);
  };

  return (
    <div className="commentModal">
      <div className="commentModalContent">
        <h2>Leave a Review</h2>

        {/* Star Rating Section */}
        <div className="ratingSection">
          <span>Rate the gym:</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className={`star ${rating >= value ? "selected" : ""}`}
                onClick={() => handleRating(value)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Gym Features */}
        <div className="featureSelection">
          <label>
            <input
              type="checkbox"
              checked={chalkAllowed}
              onChange={() => setChalkAllowed(!chalkAllowed)}
            />
            Allows Lifting Chalk
          </label>

          <label>
            <input
              type="checkbox"
              checked={calibratedPlatesAllowed}
              onChange={() => setCalibratedPlatesAllowed(!calibratedPlatesAllowed)}
            />
            Has Calibrated Powerlifting Plates
          </label>
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
