import React, { useState, useEffect, useParams} from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VITE_SITE_URL = import.meta.env.VITE_SITE_URL;

function formatTimeSince(dateString) {
  const createdAt = new Date(dateString);
  const now = new Date();
  const diffMs = now - createdAt;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  } else if (diffHours < 24) {
    return `${diffHours}h`;
  } else {
    return `${diffDays}d`;
  }
}

const getCommentAvatar = (c) =>
  c.profile_picture_url ||
  c.author_profile?.profile_picture_url ||
  c.author_user?.profile_picture_url ||
  null;

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: string }
  const [comments, setComments] = useState({}); // { [postId]: [comments] }
  const [loadingComments, setLoadingComments] = useState({}); // { [postId]: bool }
  const [expandedPosts, setExpandedPosts] = useState({}); // { [postId]: true/false }
  const [openComments, setOpenComments] = useState({}); // { [postId]: true/false }
  const [sharePostId, setSharePostId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);


  // Transform API post to UI post format
  const transformPostData = (apiPost) => {
    const tags = typeof apiPost.tags === 'string' ? JSON.parse(apiPost.tags) : apiPost.tags || [];
    return {
      id: apiPost.postId,
      user: {
        username: apiPost.username || 'anonymous',
        name: apiPost.username?.split('@')[0] || 'Anonymous User',
        avatar:
          apiPost.profilePictureUrl ||
          apiPost.profile_picture_url ||
          apiPost.author?.profile_picture_url ||
          apiPost.author_profile?.profile_picture_url ||
          null,
        verified: apiPost.verified || false
      },
      description: apiPost.description || '', // <-- always a string!
      image: apiPost.image_url,
      gym: apiPost.gym || null,
      timestamp: formatTimeSince(apiPost.created_at),
      likes: apiPost.total_likes || 0,
      comments: apiPost.total_comments || 0,
      isLiked: apiPost.is_liked || false,
      tags: tags.map(tag => `#${tag}`)
    };
  };


  // Function to fetch posts from API using axios
  const getPosts = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/getPosts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      const response = await axios.get(`${API_BASE_URL}/api/post/${postId}/comments`);
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
      await axios.post(`${API_BASE_URL}/api/post/${postId}/comment`, {
        text,
        created_at: new Date(),
        username: userData?.username || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      await fetchComments(postId);
      setPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );
    } catch (error) {
      alert('Failed to add comment');
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = (postId) => {
    setSharePostId(postId);
    setCopySuccess(false);
  };

  const handleCopyLink = () => {
    const url = `${VITE_SITE_URL}/post/${sharePostId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  const closeSharePopup = () => {
    setSharePostId(null);
    setCopySuccess(false);
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

  // Extract and save token from hash if present (for Google sign-in)
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', ''));
    const token = params.get('access_token');
    const provider = params.get('provider_token');
    // Only save token if Google sign-in (provider_token present or redirect from Google)
    if (token && (provider || window.location.search.includes('provider=google'))) {
      window.location.hash = '';
      window.location.href = "/"; // Redirect to feed page
       localStorage.setItem('token', token);
    }
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/addPostLike/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
              }
            : post
        ));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      alert('Failed to like post. Please try again.');
    }
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

  // Helper to toggle expanded state
  const toggleExpand = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="feed-page">
      <Header />
      <div className="feed-top">
        <div className="feed-title-section">
          <h1 className="fitcheck-title">FitCheck</h1>
          <Link to="/messages" className="messages-link">
            <FaComment />
          </Link>
        </div>
      </div>
      {loading ? (
        <div className="loading-indicator">Loading posts...</div>
      ) : posts.length > 0 ? (
        <div className="posts-feed">
          {posts.map(post => {
            const isExpanded = expandedPosts[post.id];
            const maxLength = 220;
            const isLong = post.description && post.description.length > maxLength;
            const previewText = isLong && !isExpanded
              ? post.description.slice(0, maxLength) + '...'
              : post.description;

            return (
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
                        <Link
                          to={`/profile/${post.user.username}`}
                          className="feed-post-author-link"
                        >
                          {post.user.name}
                        </Link>
                        {post.user.verified && <span className="verified-badge">✓</span>}
                      </div>
                      <div className="user-meta">
                        @{post.user.username} <br/> {post.timestamp}
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
                  <p className="post-description">
                    {isLong && !isExpanded
                      ? post.description.slice(0, maxLength)
                      : post.description}
                    {isLong && (
                      <span
                        className="expand-toggle subtle"
                        onClick={() => toggleExpand(post.id)}
                        role="button"
                        tabIndex={0}
                        style={{ userSelect: 'none' }}
                        onKeyPress={e => {
                          if (e.key === 'Enter' || e.key === ' ') toggleExpand(post.id);
                        }}
                      >
                        {isExpanded ? ' show less' : '...more'}
                      </span>
                    )}
                  </p>
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
                    onClick={() => {
                      setOpenComments(prev => ({
                        ...prev,
                        [post.id]: !prev[post.id]
                      }));
                      if (!openComments[post.id]) fetchComments(post.id);
                    }}
                  >
                    <FaComment />
                    <span>{post.comments}</span>
                  </button>
                  <button className="action-btn share-btn" onClick={() => handleShare(post.id)}>
                    <FaShare />
                  </button>
                </div>

                {/* Post Comments Section */}
                {openComments[post.id] && (
                  <div className="post-comments-section modern">
                    <div className="comments-list">
                      {loadingComments[post.id] ? (
                        <div>Loading comments...</div>
                      ) : comments[post.id].length === 0 ? (
                        <div>No comments yet.</div>
                      ) : (
                        comments[post.id].map((comment) => {
                          const avatar = getCommentAvatar(comment);
                          const uname = comment.username || 'user';
                          const initial = uname.charAt(0).toUpperCase();
                          return (
                            <div key={comment.id} className="comment">
                              <div className="comment-avatar">
                                {avatar ? (
                                  <img src={avatar} alt={`${uname}'s avatar`} />
                                ) : (
                                  <div className="avatar-fallback">{initial}</div>
                                )}
                              </div>

                              <div className="comment-body">
                                <div className="comment-header">
                                  <Link to={`/profile/${uname}`} className="comment-author">@{uname}</Link>
                                  <span className="dot">•</span>
                                  <time className="comment-time">{formatTimeSince(comment.created_at)}</time>
                                </div>
                                <div className="comment-text">{comment.text}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="comment-input-row">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="comment-input"
                        onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
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
                {/* Share Popup */}
                {sharePostId === post.id && (
                  <div className="share-popup-overlay" onClick={closeSharePopup}>
                    <div className="share-popup" onClick={e => e.stopPropagation()}>
                      <button className="share-close-btn" onClick={closeSharePopup}>&times;</button>
                      <div className="share-title">Share this post</div>
                      <input
                        className="share-link-input"
                        type="text"
                        value={`${VITE_SITE_URL}/post/${post.id}`}
                        readOnly
                        onFocus={e => e.target.select()}
                      />
                      <div className="share-actions-row">
                        <button className="share-action" onClick={handleCopyLink}>
                          Copy Link
                        </button>
                        {copySuccess && <span style={{ color: '#ff6b35', marginLeft: 8 }}>Copied!</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
