// UserProfile.jsx
import React, { useState, useEffect } from 'react';
import './style.scss';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { User } from 'lucide-react';

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
    profilePicture: null,
    stats: {
      workoutsCompleted: 128,
      personalBests: 15,
      followers: 543,
      following: 267
    },
    gymStats: [
      
    ]
  });

  // Track which content tab is currently active
  const [activeTab, setActiveTab] = useState('stats');
  // Track if the current user owns this profile
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  // State for managing the Add PR modal
  const [showAddPRModal, setShowAddPRModal] = useState(false);
  const [newPR, setNewPR] = useState({ exercise: '', weight: '', reps: '' });

  /**
   * Checks if the current authenticated user owns this profile
   */
  const checkProfileOwnership = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsOwnProfile(false);
        return;
      }

      const response = await axios.get(`/api/checkProfileOwnership/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIsOwnProfile(response.data.isOwner);
    } catch (error) {
      console.error('Error checking profile ownership:', error);
      setIsOwnProfile(false);
    }
  };

  /**
   * Fetches user data from the API
   * @returns {Promise} The data returned from the API
   */
  const getData = async () => {
    try {
      if (!name) {
        console.error("Error: No username provided in URL parameters");
        throw new Error("Username parameter is required");
      }
      
      console.log(`Fetching data for user: ${name}`);
      
      const response = await fetch(
        `/api/GetUserData/?userName=${encodeURIComponent(name)}`,
        { method: "GET" }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          console.error(`User not found: ${name}`);
          return;
        }
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch user data");
      }
      
      setUserData({
        ...userData,
        name: result.user.firstName + " "+ result.user.lastName,
        username: result.user.username,
        bio: result.user.bio,
        profilePicture: result.user.profilePictureUrl,
        gymStats: [
          ...result.user.pr.map(pr => ({
            exercise: pr.exercise_name,
            weight: pr.weight + " lbs",
            reps: pr.reps
          }))
        ]
      });
      
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      throw error;
    }
  };
  
  // Fetch user data when component mounts or name parameter changes
  useEffect(() => {
    getData();
    checkProfileOwnership();
  }, [name]); // Re-run when name changes

  /**
   * Handles saving a new PR
   */
  const handleSavePR = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/addPersonalRecord', {
        newPR: newPR},
        {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the local state with the new PR
      setUserData(prevData => ({
        ...prevData,
        stats: {
          ...prevData.stats,
          personalBests: prevData.stats.personalBests + 1
        },
        gymStats: [
          ...prevData.gymStats,
          {
            exercise: newPR.exercise,
            weight: `${newPR.weight} lbs`,
            reps: newPR.reps
          }
        ]
      }));

      // Close modal and reset form
      setShowAddPRModal(false);
      setNewPR({ exercise: '', weight: '', reps: '' });
    } catch (error) {
      console.error('Error saving PR:', error);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-info">
        <div className="profile-picture">
          {userData.profilePicture ? (
            <img 
              src={userData.profilePicture} 
              alt={`${userData.name}'s profile`} 
            />
          ) : (
            <div className="profile-picture-placeholder">
              <User size={72} />
            </div>
          )}
        </div>

        <div className="user-info">
          <h1 id="userName">{userData.name}</h1>
          <p className="username">{"@"+userData.username}</p>
          <p className="bio">{userData.bio}</p>
          {isOwnProfile && (
            <button 
              className="edit-profile-btn"
              onClick={() => window.location.href = '/profile'}
            >
              Edit Profile
            </button>
          )}
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
          {!isOwnProfile && (
            <button className="follow-btn">
              Follow
            </button>
          )}
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
              <div className="stats-header">
                <h2>Personal Records</h2>
                {isOwnProfile && (
                  <button 
                    className="add-pr-btn"
                    onClick={() => setShowAddPRModal(true)}
                  >
                    + Add PR
                  </button>
                )}
              </div>
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

      {/* Add PR Modal */}
      {showAddPRModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Personal Record</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Exercise</label>
                <input
                  type="text"
                  value={newPR.exercise}
                  onChange={(e) => setNewPR({...newPR, exercise: e.target.value})}
                  placeholder="e.g., Bench Press"
                />
              </div>
              <div className="form-group">
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  value={newPR.weight}
                  onChange={(e) => setNewPR({...newPR, weight: e.target.value})}
                  placeholder="e.g., 225"
                />
              </div>
              <div className="form-group">
                <label>Reps</label>
                <input
                  type="number"
                  value={newPR.reps}
                  onChange={(e) => setNewPR({...newPR, reps: e.target.value})}
                  placeholder="e.g., 5"
                />
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddPRModal(false);
                    setNewPR({ exercise: '', weight: '', reps: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleSavePR}
                >
                  Save PR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;