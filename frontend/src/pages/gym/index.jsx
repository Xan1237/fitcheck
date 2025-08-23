import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import Header from '../../components/header';
import GymHeader from '../../components/gym_components/GymHeader.jsx';
import GymDetails from '../../components/gym_components/GymDetails.jsx';
import GymTags from '../../components/gym_components/GymTags.jsx';
import GymMap from '../../components/gym_components/GymMap.jsx';
import GymReviews from '../../components/gym_components/GymReviews.js';
import { calculateGymTags, calculateAverageRating } from './utils/gymUtils';
import gymData from '../../data/gymData.js';
import './index.scss';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Gym = () => {
  const { gym } = useParams();
  const gymsData = gymData[gym];
  const [newComment, setNewComment] = useState('');
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [gymTags, setGymTags] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [newComment]);

  useEffect(() => {
    if (showModal === true) {
      if (!localStorage.getItem('token')) {
        window.alert('Please Sign In To Leave A Comment');
        setShowModal(false);
      }
    }
  }, [showModal]);

  // Function to post a new comment
  const postComment = async () => {
    if (!newComment.trim()) {
      return; // Prevent posting empty comments
    }

    const commentData = {
      CommentID: uuidv4(),
      UserName: 'Anonymous',
      CommentText: newComment,
      GymName: gymsData.name,
      GymId: gymsData.id,
      Time: dayjs().format('YYYY-MM-DD HH:mm'),
      Rating: rating,
      Tags: selectedTags || [],
    };
    const token = localStorage.getItem('token');
    try {
      console.log(commentData);
      const response = await fetch(`/api/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      });

      const result = await response.json();

      if (response.ok) {
        const updatedMessages = [commentData, ...messages];
        setMessages(updatedMessages);
        setNewComment('');
        setRating(0);
        setSelectedTags([]);
        setShowModal(false);
        
        // Update ratings and tags
        const newAverageRating = calculateAverageRating(updatedMessages);
        setAverageRating(newAverageRating);
        const updatedGymTags = calculateGymTags(updatedMessages, 0.25);
        setGymTags(updatedGymTags);
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  // Function to fetch comments from the API
  const fetchComments = async () => {
    const gymName = gymsData.id;
    try {
      const response = await fetch(
        `/api/GetComments/?GymName=${encodeURIComponent(gymName)}`,
        { method: 'GET' }
      );

      const result = await response.json();

      if (response.ok) {
        const formattedMessages = result.data.map((comment) => ({
          ...comment,
          Tags: comment.Tags || [], // Ensure Tags is always an array
        }));

        setMessages(formattedMessages);
        setTotalReviews(formattedMessages.length);
        
        // Calculate average rating and gym tags
        const newAverageRating = calculateAverageRating(formattedMessages);
        setAverageRating(newAverageRating);
        const aggregatedGymTags = calculateGymTags(formattedMessages, 0.25);
        setGymTags(aggregatedGymTags);
      } else {
        console.error('Error fetching comments:', result.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="gym-page">
        <GymHeader
          gymName={gymsData.name}
          averageRating={averageRating}
          totalReviews={totalReviews}
        />

        <div className="gym-content">
          <GymDetails gymData={gymsData} />
          <GymTags gymTags={gymTags} />
          <GymMap location={gymsData.location} gymName={gymsData.name} />
          <GymReviews
            messages={messages}
            showModal={showModal}
            setShowModal={setShowModal}
            newComment={newComment}
            setNewComment={setNewComment}
            postComment={postComment}
            rating={rating}
            setRating={setRating}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </div>
      </div>
    </div>
  );
};

export default Gym;