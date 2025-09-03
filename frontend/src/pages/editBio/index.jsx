import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './style.scss';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditBio = () => {
  const [bio, setBio] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  useEffect(() => {
    fetchCurrentBio();
  }, []);

  const fetchCurrentBio = async () => {

  };

  const handleBioChange = (e) => {
    const newBio = e.target.value;
    if (newBio.length <= maxChars) {
      setBio(newBio);
      setCharCount(newBio.length);
    }
  };

  const handleSave = async () => {
    if (bio.trim() === originalBio.trim()) {
      setMessage({ type: 'info', text: 'No changes to save' });
      return;
    }

    if (bio.trim().length === 0) {
      setMessage({ type: 'error', text: 'Bio cannot be empty' });
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required' });
        return;
      }

      const response = await axios.put(`${API_BASE_URL}/api/updateUserBio`, 
        { bio: bio.trim() },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Bio updated successfully!' });
        setOriginalBio(bio.trim());
        // Redirect back to profile after a short delay
        setTimeout(() => {
          window.history.back();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update bio' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (bio !== originalBio) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.history.back();
      }
    } else {
      window.history.back();
    }
  };

  const hasChanges = bio !== originalBio;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="edit-bio-container">
      {/* Header */}
      <div className="edit-bio-header">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={80} />
        </button>
        <h1>Edit Bio</h1>
        <button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving || isOverLimit}
          className={`save-button ${!hasChanges ? 'disabled' : ''}`}
        >
          {isSaving ? (
            <>
              <div className="spinner"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="edit-bio-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Loading your current bio...</p>
          </div>
        ) : (
          <>
            {/* Bio Input Section */}
            <div className="bio-input-section">
              <div className="input-header">
                <User size={20} />
                <h3>Tell us about yourself</h3>
              </div>
              
              <div className="textarea-container">
                <textarea
                  value={bio}
                  onChange={handleBioChange}
                  placeholder="Share your fitness journey, goals, or anything you'd like others to know about you..."
                  className={`bio-textarea ${isOverLimit ? 'error' : ''}`}
                  rows={6}
                  maxLength={maxChars}
                />
                
                {/* Character Counter */}
                <div className={`char-counter ${isOverLimit ? 'error' : ''}`}>
                  <span className="current-count">{charCount}</span>
                  <span className="separator">/</span>
                  <span className="max-count">{maxChars}</span>
                  {isOverLimit && (
                    <AlertCircle size={16} className="error-icon" />
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="bio-tips">
                <h4>💡 Tips for a great bio:</h4>
                <ul>
                  <li>Share your fitness goals and experience level</li>
                  <li>Mention your preferred workout style</li>
                  <li>Include what motivates you</li>
                  <li>Keep it friendly and authentic</li>
                </ul>
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' && <CheckCircle size={20} />}
                {message.type === 'error' && <AlertCircle size={20} />}
                {message.type === 'info' && <Edit3 size={20} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                onClick={handleBack}
                className="cancel-button"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isOverLimit}
                className={`primary-button ${!hasChanges ? 'disabled' : ''}`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditBio;
