// UserProfile.jsx
import React, { useState } from 'react';
import './style.scss';

const UserProfile = () => {
  // Sample user data - replace with your actual data source
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    username: "@alexfit",
    bio: "Fitness enthusiast | Personal Trainer | Nutrition Coach",
    profileImage: "https://via.placeholder.com/100",
    coverImage: "https://via.placeholder.com/400x150",
    stats: {
      workoutsCompleted: 128,
      personalBests: 15,
      followers: 543,
      following: 267
    },
    gymStats: [
      { exercise: "Bench Press", weight: "225 lbs", reps: 8 },
      { exercise: "Squat", weight: "315 lbs", reps: 6 },
      { exercise: "Deadlift", weight: "405 lbs", reps: 5 },
      { exercise: "Pull-ups", weight: "Bodyweight", reps: 15 }
    ]
  });

  const [activeTab, setActiveTab] = useState('stats');


  try {
    const fetchComments = async () => {
      `/api/GetComments/?GymName=${encodeURIComponent(gymName)}`,
      { method: "GET" }
    }}
    catch{
      console.log("error")
    }

  return (
    <div className="user-profile">
      {/* Cover Photo */}
      <div className="cover-photo">
        <img src={userData.coverImage} alt="Cover" />
      </div>
      
      {/* Profile Info */}
      <div className="profile-info">
        {/* Profile Picture */}
        <div className="profile-picture">
          <img src={userData.profileImage} alt={userData.name} />
        </div>
        
        {/* User Info */}
        <div className="user-info">
          <h1>{userData.name}</h1>
          <p className="username">{userData.username}</p>
          <p className="bio">{userData.bio}</p>
        </div>

        {/* Quick Stats */}
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
      
      {/* Tabs */}
      <div className="profile-tabs">
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
            Progress
          </button>
          <button 
            className={activeTab === 'nutrition' ? 'active' : ''}
            onClick={() => setActiveTab('nutrition')}
          >
            Nutrition
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
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
          
          {activeTab === 'progress' && (
            <div className="progress-tab">
              <p>Progress charts will appear here</p>
            </div>
          )}
          
          {activeTab === 'nutrition' && (
            <div className="nutrition-tab">
              <p>Nutrition data will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;