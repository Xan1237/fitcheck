import React from "react";
import "./index.scss";

const Message = ({ messageContent, timeStamp, rating, tags }) => {
  return (
    <div className="message">
      <div className="messageHeader">
        <span className="stars">
          {"★".repeat(rating)}
          {"☆".repeat(5 - rating)}
        </span>
        <span className="timeStamp">{timeStamp}</span>
      </div>

      <p className="messageContent">{messageContent}</p>

      <div className="gymFeatures">
        {tags && tags.length > 0 ? (
          tags.map((tag, index) => <span key={index}>{tag}</span>)
        ) : (
          <span>No additional features listed.</span>
        )}
      </div>
    </div>
  );
};

export default Message;
