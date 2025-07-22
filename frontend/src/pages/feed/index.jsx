import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShare, 
  FaDumbbell,
  FaFire,
  FaTrophy,
  FaEllipsisV
} from 'react-icons/fa';
import './styles.scss';

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: string }
  const [comments, setComments] = useState({}); // { [postId]: [comments] }
  const [loadingComments, setLoadingComments] = useState({}); // { [postId]: bool }

  // Transform API post to UI post format
  const transformPostData = (apiPost) => {
    // Parse tags if it's a string
    const tags = typeof apiPost.tags === 'string' ? JSON.parse(apiPost.tags) : apiPost.tags || [];
    
    return {
      id: apiPost.postId, // <-- Use the actual primary key field from your DB, not uuid
      user: {
        username: apiPost.username || 'anonymous',
        name: apiPost.username?.split('@')[0] || 'Anonymous User',
        avatar: null,
        verified: false
      },
      content: apiPost.description || apiPost.title,
      image: apiPost.image_url,
      workoutType: 'General',
      gym: null,
      timestamp: new Date(apiPost.created_at).toLocaleDateString(),
      likes: 0,
      comments: apiPost.comment_id || 0,
      shares: 0,
      isLiked: false,
      tags: tags.map(tag => `#${tag}`)
    };
  };

  // Function to fetch posts from API using axios
  const getPosts = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await axios.get('/api/getPosts');
      
      // Transform each API post to the required format
      const transformedPosts = response.data.map(transformPostData);
      
      // Set posts to only API data
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Show empty state if API fails
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await axios.get(`/api/post/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: response.data.data || [] }));
    } catch (error) {
      setComments(prev => ({ ...prev, [postId]: [] }));
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Add a comment to a post
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      const token = localStorage.getItem('token');
      // Send all info in the body
      await axios.post(`/api/post/${postId}/comment`, {
        text,
        created_at: new Date(),
        username: userData?.username || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
    } catch (error) {
      alert('Failed to add comment');
      console.error('Failed to add comment:', error);
    }
  };

  useEffect(() => {
    // Get posts from API
    getPosts();
    
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
      
      {/* Simplified structure - single scrollable area */}
      {loading ? (
        <div className="loading-indicator">Loading posts...</div>
      ) : posts.length > 0 ? (
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
                      @{post.user.username}  {post.timestamp}
                    </div>
                  </div>
                </div>
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
                  <div className="post-image-container">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="responsive-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                      }}
                    />
                  </div>
                )}
              </div>

              {post.tags && post.tags.length > 0 && (
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
                <button 
                  className="action-btn comment-btn"
                  onClick={() => fetchComments(post.id)}
                >
                  <FaComment />
                  <span>{comments[post.id]?.length || post.comments}</span>
                </button>
                <button className="action-btn share-btn">
                  <FaShare />
                  <span>{post.shares}</span>
                </button>
              </div>

              {/* Post Comments Section */}
              {comments[post.id] && (
                <div className="post-comments-section">
                  <div className="comments-list">
                    {loadingComments[post.id] ? (
                      <div>Loading comments...</div>
                    ) : comments[post.id].length === 0 ? (
                      <div>No comments yet.</div>
                    ) : (
                      comments[post.id].map(comment => (
                        <div key={comment.id} className="comment-item">
                          <span className="comment-user">{comment.user_uuid?.slice(0, 8) || 'User'}:</span>
                          <span className="comment-text">{comment.text}</span>
                          <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="comment-input-row">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="comment-input"
                    />
                    <button
                      className="add-comment-btn"
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id] || !commentInputs[post.id].trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No posts found. Check back later!</p>
        </div>
      )}

      <div className="footer">
        <Footer />
      </div>
    </div>
  );
};



export default Feed;
