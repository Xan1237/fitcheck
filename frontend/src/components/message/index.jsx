import React, { useState } from 'react';
import './index.scss';



const Message = ({messageContent}) => {
    return(
    <>
    <h1 id="message">{messageContent}</h1>
    </>
    )
};


export default Message;