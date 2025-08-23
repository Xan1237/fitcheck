import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../components/header';
// Use feed styles for post page
import '../feed/styles.scss';

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

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/post/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPost(response.data);
        fetchComments();
      } catch (err) {
        setError('Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
    // eslint-disable-next-line
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/post/${postId}/comments`);
      setComments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/addPostLike/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPost(prev => ({
          ...prev,
          is_liked: !prev.is_liked,
          total_likes: prev.is_liked ? prev.total_likes - 1 : prev.total_likes + 1
        }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/post/${postId}/comment`,
        {
          text: newComment,
          created_at: new Date()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setNewComment('');
      fetchComments();
      setPost(prev => ({
        ...prev,
        total_comments: (prev.total_comments || 0) + 1
      }));
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleShare = () => {
    setShowShare(true);
    setCopySuccess(false);
  };

  const handleCopyLink = () => {
    const url = `${VITE_SITE_URL}/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    });
  };

  const closeSharePopup = () => {
    setShowShare(false);
    setCopySuccess(false);
  };

  const parseTags = (tagsString) => {
    try {
      return typeof tagsString === 'string' ? JSON.parse(tagsString) : tagsString || [];
    } catch (e) {
      console.error('Error parsing tags:', e);
      return [];
    }
  };

  if (loading) return <div className="feed-page"><div className="loading-indicator">Loading...</div></div>;
  if (error) return <div className="feed-page"><div className="empty-state">{error}</div></div>;
  if (!post) return <div className="feed-page"><div className="empty-state">Post not found</div></div>;

  return (
    <>
      <Header />
      <div className="feed-page">
        <div className="posts-feed">
          <div className="post-card">
            <div className="post-header">
              <div className="post-user-info">
                <div className="user-avatar">
                  {post.author?.profile_picture_url ? (
                    <img src={post.author.profile_picture_url} alt={post.username} />
                  ) : (
                    <div className="default-avatar">{post.username?.[0]?.toUpperCase()}</div>
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">
                    <Link
                      to={`/profile/${post.username}`}
                      className="feed-post-author-link"
                    >
                      {post.username}
                    </Link>
                  </div>
                  <div className="user-meta">
                    @{post.username} <br /> {formatTimeSince(post.created_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="post-content">
              {post.title && <h1 className="post-title">{post.title}</h1>}
              <p className="post-description">{post.description}</p>
              {post.image_url && (
                <div className="post-image-container">
                  <img
                    src={post.image_url}
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

            {post.tags && (
              <div className="post-tags">
                {parseTags(post.tags).map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="post-actions">
              <button
                className={`action-btn like-btn ${post.is_liked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                {post.is_liked ? <FaHeart /> : <FaRegHeart />}
                <span>{post.total_likes || 0}</span>
              </button>
              <button className="action-btn comment-btn">
                <FaComment />
                <span>{post.total_comments || 0}</span>
              </button>
              <button className="action-btn share-btn" onClick={handleShare}>
                <FaShare />
              </button>
            </div>

            {/* Comments Section */}
            <div className="post-comments-section modern">
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div>No comments yet.</div>
                ) : (
                  comments.map((comment) => {
                    const avatar = comment.profile_picture_url;
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
              <form className="comment-input-row" onSubmit={handleAddComment}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="comment-input"
                />
                <button
                  type="submit"
                  className="add-comment-btn"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </form>
            </div>

            {/* Share Popup */}
            {showShare && (
              <div className="share-popup-overlay" onClick={closeSharePopup}>
                <div className="share-popup" onClick={e => e.stopPropagation()}>
                  <button className="share-close-btn" onClick={closeSharePopup}>&times;</button>
                  <div className="share-title">Share this post</div>
                  <input
                    className="share-link-input"
                    type="text"
                    value={`${VITE_SITE_URL}/post/${postId}`}
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
        </div>
      </div>
    </>
  );
};

export default PostPage;
