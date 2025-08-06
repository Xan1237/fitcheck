import React from "react";
import "./index.scss";

const Message = ({ messageContent, timeStamp, rating, tags, username }) => {
  return (
    <div className="message">
      <div className="messageHeader">
        <div className="username">{username}</div>
        <div className="stars">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </div>
        <div className="timeStamp">{timeStamp}</div>
      </div>

      <div className="messageContent">{messageContent}</div>

      {tags && tags.length > 0 && (
        <div className="gymFeatures">
          {tags.map((tag, index) => (
            <span key={index}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;
