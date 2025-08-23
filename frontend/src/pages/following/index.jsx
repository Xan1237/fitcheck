import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Header from '../../components/header';
import './style.scss';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FollowingDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/profile/${username}`);
  };

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/following/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch following users');
        }

        const data = await response.json();
        
        // Fetch profile pictures for each following user
        const followingWithProfilePics = await Promise.all(
          (data.following || []).map(async (following) => {
            try {
              const pfpResponse = await fetch(`${API_BASE_URL}/api/getProfilePicture/${following.username}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
              });
              if (pfpResponse.ok) {
                const pfpData = await pfpResponse.json();
                return { ...following, profilePicture: pfpData.profile_picture.profile_picture_url };
              }
              return { ...following, profilePicture: null };
            } catch (error) {
              console.error(`Error fetching profile picture for ${following.username}:`, error);
              return { ...following, profilePicture: null };
            }
          })
        );

        setUsers(followingWithProfilePics);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (username) {
      fetchFollowing();
    }
  }, [username]);

  const getAvatarLetter = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="following-directory">
        <Header />
        <div className="directory-header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="following-directory">
        <Header />
        <div className="directory-header">
          <h1>Error</h1>
        </div>
        <div className="empty-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="following-directory">
      <Header />
      <div className="directory-header">
        <button onClick={handleBack} className="back-button" aria-label="Back to profile page">
          <FaArrowLeft />
        </button>
        <h1>Following</h1>
      </div>
      {users.length > 0 ? (
        <div className="users-grid">
          {users.map((user, index) => (
            <Link 
              to={`/profile/${user.username}`} 
              className="user-card" 
              key={index}
            >
              <div className="user-avatar">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={`${user.username}'s profile`} 
                    className="profile-image"
                  />
                ) : (
                  <span className="avatar-text">
                    {getAvatarLetter(user.username)}
                  </span>
                )}
              </div>
              <h2 className="username">{user.username}</h2>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Not following anyone yet.</p>
        </div>
      )}
    </div>
  );
};

export default FollowingDirectory;
