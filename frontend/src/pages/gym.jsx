import React, { useState } from 'react';
import Search from '../components/search';
import Map from '../components/map';
import Header from '../components/header';  // Make sure to import Header
import Footer from '../components/footer';  // Ensure Footer is also imported
import Title from '../components/title';  // Ensure Title is imported
import { useParams } from "react-router-dom";
import gymData from "../data/gymData.js";
import Message from "../components/message";
import "./index.scss";


const postComment = async () => {
  const commentData = {
    CommentID: "1", 
    UserName: "This is a great post!", 
    CommentText: "hello"
  };

  try {
    const response = await fetch("/api/comment", {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // Indicate that we are sending JSON
      },
      body: JSON.stringify(commentData), // Convert the comment data to a JSON string
    });

    const result = await response.json();
    if (response.ok) {
      console.log("Comment added:", result);
    } else {
      console.log("Error:", result.message);
    }
  } catch (error) {
    console.error("Error making POST request:", error);
  }
};

postComment();



const gym = () => {
  const {gym} = useParams();
  const gymsData = gymData[gym];
  console.log(gymsData.img)
  return (
    <div>
        <Header/>
        <div className='page'>
          <img className = "GymPic" src={gymsData.img} alt="" />
          <div id="messageSection">
            <Message messageContent="This Gym rly sucks "/>
          </div>
        </div>
    </div>
  );
};

export default gym;
