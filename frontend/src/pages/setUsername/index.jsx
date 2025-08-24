import React, { useState } from 'react';
import axios from 'axios';
import { User } from 'lucide-react';
import './style.scss';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SetUsername = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/set-username`, {
        username
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.setItem('username', username);
      window.location.href = '/';
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="set-username-container">
      <div className="set-username-card">
        <div className="card-header">
          <div className="icon-circle">
            <User size={32} />
          </div>
          <h1>Choose your username</h1>
          <p>This is how others will see you on FitCheck</p>
        </div>

        <form onSubmit={handleSubmit} className="username-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="Username must be 3-20 characters and can only contain letters, numbers, and underscores"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetUsername;
