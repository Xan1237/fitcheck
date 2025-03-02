import React, { useState } from 'react';
import './index.scss';



const Message = ({messageContent, timeStamp}) => {
    return(
    <>
    <div id="message">
    <span id="messageContent">{messageContent}</span>
    <br />
    <span id="timeStamp">{timeStamp}</span>
    </div>
    </>
    )
};


export default Message;