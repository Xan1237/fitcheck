import React, { useState } from "react";
import "./style.scss";
import { tagCategories } from "../../data/tagCategories";

// Categorized tags

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
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const toggleCategory = (category) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // Filter tags based on search query
  const filterTags = (tags) => {
    if (!searchQuery) return tags;
    return tags.filter((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Search tags */}
        <div className="tagSearchContainer">
          <input
            type="text"
            className="tagSearchInput"
            placeholder="Search for tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="selectedTagsContainer">
            <h3>Selected Tags ({selectedTags.length})</h3>
            <div className="selectedTags">
              {selectedTags.map((tag) => (
                <span key={tag} className="selectedTag">
                  {tag}
                  <button onClick={() => toggleTag(tag)}>×</button>
                </span>
              ))}
              {selectedTags.length > 0 && (
                <button
                  className="clearAllTags"
                  onClick={() => setSelectedTags([])}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Gym Tags Selection with Dropdowns */}
        <div className="tagSelection">
          <h3>Gym Tags:</h3>

          <div className="categoryDropdowns">
            {Object.entries(tagCategories).map(([category, tags]) => {
              const filteredTags = filterTags(tags);
              if (searchQuery && filteredTags.length === 0) return null;

              return (
                <div key={category} className="categoryDropdown">
                  <div
                    className="categoryHeader"
                    onClick={() => toggleCategory(category)}
                  >
                    <span className="categoryName">{category}</span>
                    <span className="categoryCount">
                      {filteredTags.filter((tag) => selectedTags.includes(tag))
                        .length > 0 &&
                        `(${
                          filteredTags.filter((tag) =>
                            selectedTags.includes(tag)
                          ).length
                        } selected)`}
                    </span>
                    <span
                      className={`expandIcon ${
                        expandedCategories[category] ? "expanded" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {(expandedCategories[category] || searchQuery) && (
                    <div className="categoryTags">
                      {filteredTags.map((tag) => (
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
                  )}
                </div>
              );
            })}
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
