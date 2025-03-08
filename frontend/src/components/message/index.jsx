import React from 'react';
import './index.scss';

const Message = ({ messageContent, timeStamp, rating, chalkAllowed, calibratedPlatesAllowed }) => {
    return (
        <div className="message">
            <div className="messageHeader">
                <span className="stars">
                    {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                </span>
                <span className="timeStamp">{timeStamp}</span>
            </div>

            <p className="messageContent">{messageContent}</p>

            <div className="gymFeatures">
                <span>{chalkAllowed ? "✅ Allows Lifting Chalk" : "❌ No Lifting Chalk"}</span>
                <span>{calibratedPlatesAllowed ? "✅ Has Calibrated Plates" : "❌ No Calibrated Plates"}</span>
            </div>
        </div>
    );
};

export default Message;
