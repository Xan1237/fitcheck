import React from 'react';
import Message from '../message';
import CommentModal from '../CommentModal';
import './GymReviews.scss';

const GymReviews = ({
  messages,
  showModal,
  setShowModal,
  newComment,
  setNewComment,
  postComment,
  rating,
  setRating,
  selectedTags,
  setSelectedTags,
}) => {
  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews</h2>
        <button onClick={() => setShowModal(true)} className="add-review-button">
          Write a Review
        </button>
      </div>

      <div className="reviews-list">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <Message
              key={msg.CommentID || index}
              messageContent={msg.CommentText}
              username={msg.UserNamedata}
              timeStamp={msg.Time}
              rating={msg.Rating}
              tags={msg.Tags}
            />
          ))
        ) : (
          <div className="no-reviews">No reviews yet. Be the first to add one!</div>
        )}
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
    </div>
  );
};

export default GymReviews; 