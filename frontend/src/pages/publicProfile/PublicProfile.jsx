// UserProfile.jsx
import React, { useState, useEffect, useRef } from 'react';
import './style.scss';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
import { User } from 'lucide-react';
import Header from "../../components/header";
import GymSearch from '../../components/GymSearch/GymSearch';

/**
 * UserProfile Component
 * Displays a user's profile information, stats, and various data tabs
 */
const UserProfile = () => {
  // Extract the name parameter from the URL
  const { name } = useParams();
  const navigate = useNavigate();

  // State management for user data with default values
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    username: "@alexfit",
    bio: "Fitness enthusiast | Personal Trainer | Nutrition Coach",
    profilePicture: null,
    stats: {
      workoutsCompleted: 128,
      personalBests: 15,
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
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '',
    description: '',
    imageFile: null,
    tags: ''  // Will be split into array before sending
  });
  const [posts, setPosts] = useState([]);
  const fileInputRef = useRef(null);
  const [userGyms, setUserGyms] = useState([]);
  const [showGymSearch, setShowGymSearch] = useState(false);

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

  const getFollowerCount = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/getFollowerCount/${name}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setUserData(prevData => ({
      ...prevData,
      stats: {
        ...prevData.stats,
        followers: response.data.follower_count 
      }
    }))
  }

  const getFollowingCount = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/getFollowingCount/${name}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setUserData(prevData => ({
      ...prevData,
      stats: {
        ...prevData.stats,
        following: response.data.following_count 
      }
    }))
  }

  const getPostCount = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/getNumberPost/${name}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setUserData(prevData => ({
      ...prevData,
      stats: {
        ...prevData.stats,
        workoutsCompleted: response.data.post_count
      }
    }))
  }

  const getPrCount = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/getNumberPR/${name}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    setUserData(prevData => ({
      ...prevData,
      stats: {
        ...prevData.stats,
        personalBests: response.data.pr_count
      }
    }))
  }

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

      // Set posts data
      setPosts(result.user.posts || []);
      
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      throw error;
    }
  };
  
  // Fetch user data when component mounts or name parameter changes
  useEffect(() => {
    const fetchAll = async () => {
      await checkProfileOwnership();
      await getData();
      await getFollowerCount();
      await getFollowingCount();
      await getPrCount();
      await getPostCount();
      await fetchUserGyms();
  
      
    };
    fetchAll();
  }, [name]);

  /**
   * Handles saving a new PR
   */

  async function fetchUserGyms() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/getUserGyms/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.gyms) {
        console.log('User gyms fetched successfully:', response.data.gyms);
        setUserGyms(response.data.gyms.map(gym => ({
          id: gym.id,
          name: gym.name,
          address: gym.address
        }))
        );  
      } else {
        console.error('No gyms found for this user');
        setUserGyms([]);
      }
    } catch (error) {
      console.error('Error fetching user gyms:', error);
      setUserGyms([]);
    }
  };
          

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

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/newFollower', {
        targetUserName: name
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
    getFollowerCount()
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPost(prev => ({ ...prev, imageFile: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/createPost', 
        { 
          title: newPost.title,
          description: newPost.description,
          imageFile: newPost.imageFile,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') // Convert comma-separated string to array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Add the new post to the posts array
        setPosts(prevPosts => [{
          id: response.data.data[0].id,
          title: newPost.title,
          description: newPost.description,
          image_url: response.data.data[0].image_url,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
          created_at: new Date(),
          username: userData.username
        }, ...prevPosts]);

        // Close modal and reset form
        setShowAddPostModal(false);
        setNewPost({ title: '', description: '', imageFile: null, tags: '' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleGymSelect = async (gym) => {
    // Prevent adding duplicate gyms
    if (userGyms.some(g => g.id === gym.id)) {
      alert('This gym is already in your profile!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      axios.post('/api/addUserGym', {
        gymId: gym.id,
        username: userData.username,
        gymName: gym.name,
        gymAdress: gym.address
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserGyms(prev => [...prev, gym]);
      setShowGymSearch(false);
    } catch (error) {
      console.error('Error adding gym:', error);
      alert('Failed to add gym. Please try again.');
    }
  };

  const handleGymClick = (gymId) => {
    navigate(`/gym/${gymId}`);
  };

  return (
    <div className="user-profile">
      <Header />
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
            <><button
              className="edit-profile-btn"
              onClick={() => window.location.href = '/profile'}
            >
              Edit Profile
            </button>
            <button
              className="add-post-btn"
              onClick={() => [setShowAddPostModal(true), setActiveTab("nutrition")]}
            >
              <span className="plus-icon">+</span>
              New Post
            </button></>
          )}
        </div>

        {/* User Statistics Summary */}
        <div className="quick-stats">
          <div className="stat-item">
            <p className="stat-value">{userData.stats.workoutsCompleted}</p>
            <p className="stat-label">Posts</p>
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
            <button className="follow-btn" onClick={handleFollow}>
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
          
          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="progress-tab">
              {isOwnProfile && (
                <button 
                  className="add-gym-btn orange-btn"
                  onClick={() => setShowGymSearch(true)}
                >
                  + Add Gym
                </button>
              )}
              <div className="gym-list horizontal">
                {userGyms.map((gym) => (
                  <div 
                    key={gym.id} 
                    className="gym-card"
                    onClick={() => handleGymClick(gym.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h3>{gym.name}</h3>
                    <p>{gym.address}</p>
                  </div>
                ))}
              </div>
              {showGymSearch && (
                <div className="modal-overlay">
                  <div className="modal-content gym-search-modal">
                    <div className="modal-header">
                      <h3>Search Gyms</h3>
                      <button className="close-btn" onClick={() => setShowGymSearch(false)}>×</button>
                    </div>
                    <GymSearch onGymSelect={handleGymSelect} />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <div className="nutrition-tab">
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <img src={post.image_url} alt={post.title} className="post-image" />
                    <div className="post-details">
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-description">{post.description}</p>
                      <div className="post-tags">
                        {Array.isArray(post.tags) ? 
                          post.tags.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                          ))
                          :
                          (typeof post.tags === 'string' ? 
                            post.tags.split(',')
                              .map(tag => tag.trim())
                              .filter(tag => tag !== '')
                              .map((tag, index) => (
                                <span key={index} className="tag">#{tag}</span>
                              ))
                            : null)
                        }
                      </div>
                      <span className="post-date">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* Add Post Modal */}
      {showAddPostModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Post</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for your post..."
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                {newPost.imageFile && (
                  <img 
                    src={newPost.imageFile} 
                    alt="Selected" 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover',
                      marginTop: '10px',
                      borderRadius: '4px'
                    }} 
                  />
                )}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Write a description..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="e.g., workout, fitness, gym"
                />
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setShowAddPostModal(false);
                    setNewPost({ title: '', description: '', imageFile: null, tags: '' });
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreatePost}
                  disabled={!newPost.imageFile || !newPost.title || !newPost.description}
                >
                  Post
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