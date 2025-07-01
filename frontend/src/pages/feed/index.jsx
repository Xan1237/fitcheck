import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaImage, 
  FaVideo, 
  FaPlus,
  FaDumbbell,
  FaFire,
  FaTrophy,
  FaCamera,
  FaMapMarkerAlt,
  FaEllipsisV
} from 'react-icons/fa';
import './styles.scss';

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [userData, setUserData] = useState(null);

  // Mock data for posts - in real app, this would come from API
  const mockPosts = [
    {
      id: 1,
      user: {
        username: 'fitness_mike',
        name: 'Mike Johnson',
        avatar: null,
        verified: true
      },
      content: 'Just hit a new PR on bench press! 225lbs x 5 reps 💪 The grind never stops!',
      image: null,
      workoutType: 'Strength Training',
      gym: 'Gold\'s Gym Downtown',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      tags: ['#benchpress', '#PR', '#strength']
    },
    {
      id: 2,
      user: {
        username: 'sarah_lifts',
        name: 'Sarah Williams',
        avatar: null,
        verified: false
      },
      content: 'Morning cardio session complete! 5 miles in 35 minutes. Beautiful sunrise made it even better 🌅',
      image: null,
      workoutType: 'Cardio',
      gym: 'Central Park Track',
      timestamp: '4 hours ago',
      likes: 42,
      comments: 12,
      shares: 7,
      isLiked: true,
      tags: ['#running', '#cardio', '#morning']
    },
    {
      id: 3,
      user: {
        username: 'beast_mode_22',
        name: 'Alex Chen',
        avatar: null,
        verified: false
      },
      content: 'Leg day is the best day! Squats, deadlifts, and Bulgarian split squats. Feeling the burn 🔥',
      image: null,
      workoutType: 'Leg Day',
      gym: 'FitnessFX',
      timestamp: '6 hours ago',
      likes: 18,
      comments: 5,
      shares: 2,
      isLiked: false,
      tags: ['#legday', '#squats', '#gains']
    }
  ];

  useEffect(() => {
    setPosts(mockPosts);
    // Fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      // Mock user data - in real app, fetch from API
      setUserData({
        username: 'current_user',
        name: 'Current User',
        avatar: null
      });
    }
  }, []);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      user: userData || { username: 'anonymous', name: 'Anonymous User', avatar: null },
      content: newPost,
      image: selectedImage,
      workoutType: 'General',
      gym: null,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      tags: []
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setSelectedImage(null);
    setShowCreatePost(false);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const getWorkoutIcon = (workoutType) => {
    switch (workoutType) {
      case 'Strength Training':
        return <FaDumbbell />;
      case 'Cardio':
        return <FaFire />;
      case 'Leg Day':
        return <FaTrophy />;
      default:
        return <FaDumbbell />;
    }
  };

  return (
    <div className="feed-page">
        <Header />
      
      <div className="feed-container">
        <div className="feed-content">
          
          {/* Create Post Section */}
          <div className="create-post-card">
            <div className="create-post-header">
              <div className="user-avatar">
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="Your avatar" />
                ) : (
                  <div className="default-avatar">{userData?.name?.charAt(0) || 'U'}</div>
                )}
              </div>
              <div 
                className="create-post-input"
                onClick={() => setShowCreatePost(true)}
              >
                What's your workout today?
              </div>
            </div>
            
            {showCreatePost && (
              <div className="create-post-expanded">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share your fitness journey..."
                  rows="4"
                />
                <div className="create-post-actions">
                  <div className="media-buttons">
                    <button className="media-btn">
                      <FaCamera /> Photo
                    </button>
                    <button className="media-btn">
                      <FaMapMarkerAlt /> Location
                    </button>
                  </div>
                  <div className="post-buttons">
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowCreatePost(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="post-btn"
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Feed Tabs */}
          <div className="feed-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Posts
            </button>
            <button 
              className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
            <button 
              className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveTab('trending')}
            >
              Trending
            </button>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-user-info">
                    <div className="user-avatar">
                      {post.user.avatar ? (
                        <img src={post.user.avatar} alt={post.user.name} />
                      ) : (
                        <div className="default-avatar">{post.user.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {post.user.name}
                        {post.user.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="user-meta">
                        @{post.user.username} • {post.timestamp}
                      </div>
                    </div>
                  </div>
                  <button className="post-menu-btn">
                    <FaEllipsisV />
                  </button>
                </div>

                {post.workoutType && (
                  <div className="workout-badge">
                    {getWorkoutIcon(post.workoutType)}
                    <span>{post.workoutType}</span>
                    {post.gym && <span className="gym-location">at {post.gym}</span>}
                  </div>
                )}

                <div className="post-content">
                  <p>{post.content}</p>
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Post content" />
                    </div>
                  )}
                </div>

                {post.tags.length > 0 && (
                  <div className="post-tags">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="post-actions">
                  <button 
                    className={`action-btn like-btn ${post.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{post.likes}</span>
                  </button>
                  <button className="action-btn comment-btn">
                    <FaComment />
                    <span>{post.comments}</span>
                  </button>
                  <button className="action-btn share-btn">
                    <FaShare />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="feed-sidebar">
          <div className="sidebar-section">
            <h3>Trending Workouts</h3>
            <div className="trending-list">
              <div className="trending-item">
                <FaDumbbell className="trending-icon" />
                <div>
                  <div className="trending-name">#PushPullLegs</div>
                  <div className="trending-count">2.4k posts</div>
                </div>
              </div>
              <div className="trending-item">
                <FaFire className="trending-icon" />
                <div>
                  <div className="trending-name">#HIIT</div>
                  <div className="trending-count">1.8k posts</div>
                </div>
              </div>
              <div className="trending-item">
                <FaTrophy className="trending-icon" />
                <div>
                  <div className="trending-name">#PersonalRecord</div>
                  <div className="trending-count">956 posts</div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Suggested Users</h3>
            <div className="suggested-users">
              <div className="suggested-user">
                <div className="user-avatar small">
                  <div className="default-avatar">J</div>
                </div>
                <div className="user-info">
                  <div className="user-name">John Doe</div>
                  <div className="user-meta">@johndoe</div>
                </div>
                <button className="follow-btn">Follow</button>
              </div>
              <div className="suggested-user">
                <div className="user-avatar small">
                  <div className="default-avatar">E</div>
                </div>
                <div className="user-info">
                  <div className="user-name">Emma Stone</div>
                  <div className="user-meta">@emmastone</div>
                </div>
                <button className="follow-btn">Follow</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
};

export default Feed;
