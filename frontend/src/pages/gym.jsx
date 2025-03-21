import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gymData from "../data/gymData.js";
import Message from "../components/message";
import Header from "../components/header";
import CommentModal from "../components/CommentModal";
import "./index.scss";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { FaExternalLinkAlt } from "react-icons/fa";
import Star from "../data/StarImg/Star.png";

const Gym = () => {
  const { gym } = useParams();
  const gymsData = gymData[gym];
  const [newComment, setNewComment] = useState("");
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);

  // Function to post a new comment
  const postComment = async () => {
    if (!newComment.trim()) {
      return; // Prevent posting empty comments
    }

    const commentData = {
      CommentID: uuidv4(),
      UserName: "Anonymous",
      CommentText: newComment,
      GymName: gymsData.name,
      Time: dayjs().format("YYYY-MM-DD HH:mm"),
      Rating: rating,
      Tags: selectedTags || [],
    };

    console.log("Sending Comment Data:", commentData); // ✅ Debugging log
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(commentData),
      });

      const result = await response.json();
      console.log("Server Response:", result); // ✅ Debugging log

      if (response.ok) {
        setMessages([commentData, ...messages]);
        setNewComment("");
        setRating(0);
        setSelectedTags([]);
        setShowModal(false);
      } else {
        console.error("Error:", result.message);
      }
      if(result.message == "Invalid or expired authentication token"){
        window.alert("Please Sign in")
      }
    } catch  {
      console.error("Error posting comment:", error);
    }
  };

  // Function to fetch comments from the API
  const fetchComments = async () => {
    const gymName = gymsData.name;
    try {
      const response = await fetch(
        `/api/GetComments/?GymName=${encodeURIComponent(gymName)}`,
        { method: "GET" }
      );

      const result = await response.json();
      console.log("Fetched Comments:", result.data); // ✅ Debugging log

      if (response.ok) {
        const formattedMessages = result.data.map((comment) => ({
          ...comment,
          Tags: comment.Tags || [], // Ensure Tags is always an array
        }));
        setMessages(formattedMessages);
      } else {
        console.error("Error fetching comments:", result.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Fetch comments when the component mounts
  useEffect(() => {
    fetchComments();
  }, [gymsData.name]); // Re-fetch comments if gymsData.name changes

  return (
    <div>
      <Header />
      <div className="page">
        <img className="GymPic" src={gymsData.img} alt={gymsData.name} />
        {gymsData.website && (
          <a href={gymsData.website} target="_blank" rel="noopener noreferrer">
            Website <FaExternalLinkAlt />
          </a>
        )}

        <div id="messageSection">
          <button
            onClick={() => setShowModal(true)}
            className="addCommentButton"
          >
            Add Comment
          </button>

          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <Message
                key={msg.CommentID || index}
                messageContent={msg.CommentText}
                username = {msg.UserNamedata}
                timeStamp={msg.Time}
                rating={msg.Rating}
                tags={msg.Tags}
              />
            ))
          ) : (
            <div id="noReviews">No comments yet. Be the first to add one!</div>
          )}
        </div>
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

export default Gym;
