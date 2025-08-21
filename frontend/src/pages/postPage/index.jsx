import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare } from 'react-icons/fa';
import axios from 'axios';
import Header from '../../components/header';
import './style.scss';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatTimestamp(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/post/${postId}`, {
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
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/post/${postId}/comments`);
      setComments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/addPostLike/${postId}`,
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
        `${API_BASE_URL}/api/post/${postId}/comment`,
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

  const parseTags = (tagsString) => {
    try {
      return typeof tagsString === 'string' ? JSON.parse(tagsString) : tagsString || [];
    } catch (e) {
      console.error('Error parsing tags:', e);
      return [];
    }
  };

  if (loading) return <div className="post-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="post-page"><div className="error">{error}</div></div>;
  if (!post) return <div className="post-page"><div className="error">Post not found</div></div>;

  return (
    <>
      <Header />
      <div className="post-page">
        <div className="post-container">
          <div className="post-header">
            <div className="user-avatar">
              {post.author?.profile_picture_url ? (
                <img src={post.author.profile_picture_url} alt={post.username} />
              ) : (
                <div className="default-avatar">{post.username?.[0]?.toUpperCase()}</div>
              )}
            </div>
            <div className="user-info">
              <Link to={`/profile/${post.username}`} className="username">
                @{post.username}
              </Link>
              <div className="timestamp">{formatTimestamp(post.created_at)}</div>
            </div>
          </div>

          <div className="post-content">
            {post.title && <h1 className="post-title">{post.title}</h1>}
            <p className="post-text">{post.description}</p>
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt="Post content" 
                className="post-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                }}
              />
            )}
            {post.tags && (
              <div className="tags">
                {parseTags(post.tags).map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="post-actions">
            <button 
              className={`action-btn ${post.is_liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              {post.is_liked ? <FaHeart /> : <FaRegHeart />}
              <span>{post.total_likes || 0}</span>
            </button>
            <button className="action-btn">
              <FaComment />
              <span>{post.total_comments || 0}</span>
            </button>
            <button className="action-btn">
              <FaShare />
              <span>{post.shares || 0}</span>
            </button>
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">Comments</div>
          <form className="comment-input" onSubmit={handleAddComment}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" disabled={!newComment.trim()}>
              Post
            </button>
          </form>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div className="comment-avatar">
                  {comment.profile_picture_url ? (
                    <img src={comment.profile_picture_url} alt={comment.username} />
                  ) : (
                    <div className="default-avatar">{comment.username?.[0]?.toUpperCase()}</div>
                  )}
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <Link to={`/profile/${comment.username}`} className="comment-author">
                      @{comment.username}
                    </Link>
                    <span className="comment-time">
                      {formatTimestamp(comment.created_at)}
                    </span>
                  </div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostPage;
