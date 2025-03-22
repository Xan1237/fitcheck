// UserProfile.jsx
import React, { useState, useEffect } from 'react';
import './style.scss';
import { useParams } from "react-router-dom";

/**
 * UserProfile Component
 * Displays a user's profile information, stats, and various data tabs
 */
const UserProfile = () => {
  // Extract the name parameter from the URL
  const { name } = useParams();
  
  // State management for user data with default values
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    username: "@alexfit",
    bio: "Fitness enthusiast | Personal Trainer | Nutrition Coach",
    stats: {
      workoutsCompleted: 128,
      personalBests: 15,
      followers: 543,
      following: 267
    },
    gymStats: [
      { exercise: "Bench Press", weight: "225 lbs", reps: "Max" },
      { exercise: "Squat", weight: "315 lbs", reps: "Max" },
      { exercise: "Deadlift", weight: "405 lbs", reps: "Max" },
      { exercise: "Pull-ups", weight: "Bodyweight", reps: 15 }
    ]
  });

  // Track which content tab is currently active
  const [activeTab, setActiveTab] = useState('stats');

  /**
   * Fetches user data from the API
   * @returns {Promise} The data returned from the API
   */
  const getData = async () => {
    try {
      // Validate URL parameter
      if (!name) {
        console.error("Error: No username provided in URL parameters");
        throw new Error("Username parameter is required");
      }
      
      console.log(`Fetching data for user: ${name}`);
      
      // Make API request to get user data
      const response = await fetch(
        `/api/GetUserData/?userName=${encodeURIComponent(name)}`,
        { method: "GET" }
      );
      
      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Process response data
      const result = await response.json();
      setUserData({
        ...userData,
        name: result.user.firstName + " "+ result.user.lastName,
        username: result.user.username,
        bio: result.user.bio,
        gymStats: [
          { ...userData.gymStats[0], weight: result.user.benchPR+" lbs" },
          { ...userData.gymStats[1], weight: result.user.squatPR+" lbs"},
          { ...userData.gymStats[2], weight: result.user.deadliftPR+" lbs"}
        ]
      });
     
      return result.data;
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      // You could also implement user-facing error handling here
      // For example: setError(error.message);
      
      // Re-throw the error to allow calling functions to handle it
      throw error;
    }
  };
  
  // Fetch user data when component mounts or name parameter changes
  useEffect(() => {
    getData();
  }, [name]); // Re-run when name changes

  return (
    <div className="user-profile">

      {/* User Information Section */}
      <div className="profile-info">
        {/* Profile Picture */}

        
        {/* Basic User Information */}
        <div className="user-info">
          <h1 id="userName">{userData.name}</h1>
          <p className="username">{"@"+userData.username}</p>
          <p className="bio">{userData.bio}</p>
        </div>

        {/* User Statistics Summary */}
        <div className="quick-stats">
          <div className="stat-item">
            <p className="stat-value">{userData.stats.workoutsCompleted}</p>
            <p className="stat-label">Workouts</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{userData.stats.personalBests}</p>
            <p className="stat-label">PRs</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{userData.stats.followers}</p>
            <p className="stat-label">Followers</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{userData.stats.following}</p>
            <p className="stat-label">Following</p>
          </div>
        </div>
      </div>
      
      {/* Content Tabs Section */}
      <div className="profile-tabs">
        {/* Tab Navigation */}
        <div className="tabs-header">
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            Gym Stats
          </button>
          <button 
            className={activeTab === 'progress' ? 'active' : ''}
            onClick={() => setActiveTab('progress')}
          >
            Gym Frequented
          </button>
          <button 
            className={activeTab === 'nutrition' ? 'active' : ''}
            onClick={() => setActiveTab('nutrition')}
          >
            Posts
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {/* Gym Stats Tab */}
          {activeTab === 'stats' && (
            <div className="stats-tab">
              <h2>Personal Records</h2>
              <div className="gym-stats">
                {userData.gymStats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-header">
                      <span className="exercise-name">{stat.exercise}</span>
                      <span className="exercise-weight">{stat.weight}</span>
                    </div>
                    <div className="stat-details">
                      <span className="detail-label">Reps</span>
                      <span className="detail-value">{stat.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Progress Tab - Currently a placeholder */}
          {activeTab === 'progress' && (
            <div className="progress-tab">
              <p>Progress charts will appear here</p>
            </div>
          )}
          
          {/* Nutrition Tab - Currently a placeholder */}
          {activeTab === 'nutrition' && (
            <div className="nutrition-tab">
              <p>Nutrition data will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;