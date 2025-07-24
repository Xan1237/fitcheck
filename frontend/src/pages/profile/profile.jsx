import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Save, Camera, Dumbbell, Award, Clipboard, User, MapPin, Calendar, Activity } from 'lucide-react';
import './profile.scss';
import axios from 'axios';
import { getAuth } from "firebase/auth";
import ImageCropper from '../../components/ImageCropper/ImageCropper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfilePictureUpload = ({ onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleFileChange = async (e) => {
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

    // Create a temporary URL for the image
    const imageUrl = URL.createObjectURL(file);
    setTempImage(imageUrl);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedImageUrl) => {
    setShowCropper(false);
    setUploading(true);

    try {
      // Convert cropped image URL to base64
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const base64File = event.target.result;
        
        const uploadResponse = await fetch(`${API_BASE_URL}/api/uploadProfilePicture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            file: base64File
          })
        });

        const data = await uploadResponse.json();
        if (!data.success) {
          throw new Error(data.error);
        }

        onUploadSuccess(data.url);
        URL.revokeObjectURL(croppedImageUrl); // Clean up
        URL.revokeObjectURL(tempImage); // Clean up
        setTempImage(null);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
  };

  return (
    <div className="profile-picture-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload Profile Picture'}
      </button>

      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

const Profile = () => {
  const [submittedData, setSubmittedData] = useState(null);
  const [data, setData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    username: '',
    birthdate: '',
    gender: '',
    location: '',
    bio: '',
    
    // Gym stats
    gymExperience: '',
    trainingFrequency: '',
    fitnessGoals: '',
    preferredGymType: '',
    
    // Personal records
    benchPR: '',
    squatPR: '',
    deadliftPR: '',
    overheadPressPR: '',
    pullUpMax: '',
    mile: '',
    
    // Preferences
    favoriteEquipment: '',
    workoutStyle: '',
    notificationPreferences: {
      newReviews: false,
      prReminders: false,
      gymAlerts: false,
      communityMessages: false
    }
  });
  
  useEffect(() => {
    console.log("Updated data:", data);
  }, [data]); // This will run whenever `data` changes

  const [avatar, setAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  
  // New state for PR calculator
  const [calcWeight, setCalcWeight] = useState('');
  const [calcReps, setCalcReps] = useState('');
  const [estimatedPR, setEstimatedPR] = useState(0);
  
  // Only populate personal info fields
  useEffect(() => {
    const timeout = setTimeout(() => {
      const elements = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        username: document.getElementById('username'),
        birthdate: document.getElementById('birthdate'),
        gender: document.getElementById('gender'),
        location: document.getElementById('location'),
        bio: document.getElementById('bio')
      };
      if (elements.firstName) elements.firstName.value = data.firstName || '';
      if (elements.lastName) elements.lastName.value = data.lastName || '';
      if (elements.username) elements.username.value = data.username || '';
      if (elements.birthdate) elements.birthdate.value = data.birthdate || '';
      if (elements.gender) elements.gender.value = data.gender || '';
      if (elements.location) elements.location.value = data.location || '';
      if (elements.bio) elements.bio.value = data.bio || '';
    }, 50);
    return () => clearTimeout(timeout);
  }, [data]);
  
  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Updated progress bar function to be consistent with tab navigation
  const updateProgressBar = (tab) => {
    const progressValues = {
      'personal': 0,
      'gymStats': 25,
      'personalRecords': 50,
      'preferences': 75
    };
    
    setProgress(progressValues[tab] || 0);
  };
  
  // Calculate 1RM using Epley formula: weight * (1 + 0.0333 * reps)
  const calculateOneRepMax = () => {
    if (!calcWeight || !calcReps || isNaN(calcWeight) || isNaN(calcReps)) {
      return setEstimatedPR(0);
    }
    
    const weight = parseFloat(calcWeight);
    const reps = parseInt(calcReps);
    
    if (reps < 1) {
      return setEstimatedPR(0);
    }
    
    const oneRepMax = weight * (1 + (0.0333 * reps));
    setEstimatedPR(Math.round(oneRepMax));
  };
  
  // Handle form data collection for each tab
  // Personal Information tab data collection
  const personalInformation = () => {
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const username = document.getElementById('username')?.value || '';
    const birthdate = document.getElementById('birthdate')?.value || '';
    const gender = document.getElementById('gender')?.value || '';
    const location = document.getElementById('location')?.value || '';
    const bio = document.getElementById('bio')?.value || '';
    
    setData(prevState => ({
      ...prevState,
      firstName,
      lastName,
      username,
      birthdate,
      gender,
      location,
      bio
    }));
  };
  
  // Gym Stats tab data collection
  const gymStatsInformation = () => {
    const gymExperience = document.getElementById('gymExperience')?.value || '';
    const trainingFrequency = document.getElementById('trainingFrequency')?.value || '';
    const fitnessGoals = document.getElementById('fitnessGoals')?.value || '';
    const preferredGymType = document.getElementById('preferredGymType')?.value || '';
    
    setData(prevState => ({
      ...prevState,
      gymExperience,
      trainingFrequency,
      fitnessGoals,
      preferredGymType
    }));
  };
  
  // Personal Records tab data collection
  const personalRecordsInformation = () => {
    const benchPR = document.getElementById('benchPR')?.value || '';
    const squatPR = document.getElementById('squatPR')?.value || '';
    const deadliftPR = document.getElementById('deadliftPR')?.value || '';
    const overheadPressPR = document.getElementById('overheadPressPR')?.value || '';
    const pullUpMax = document.getElementById('pullUpMax')?.value || '';
    const mile = document.getElementById('mile')?.value || '';
    
    setData(prevState => ({
      ...prevState,
      benchPR,
      squatPR,
      deadliftPR,
      overheadPressPR,
      pullUpMax,
      mile
    }));
  };
  
  // Preferences tab data collection
  // Alternative fix for the preferencesInformation function:
const preferencesInformation = (callback) => {
  const favoriteEquipment = document.getElementById('favoriteEquipment')?.value || '';
  const workoutStyle = document.getElementById('workoutStyle')?.value || '';
  
  // For checkboxes, get the checked status
  const newReviews = document.getElementById('newReviews')?.checked || false;
  const prReminders = document.getElementById('prReminders')?.checked || false;
  const gymAlerts = document.getElementById('gymAlerts')?.checked || false;
  const communityMessages = document.getElementById('communityMessages')?.checked || false;
  
  setData(prevState => {
    const newState = {
      ...prevState,
      favoriteEquipment,
      workoutStyle,
      notificationPreferences: {
        newReviews,
        prReminders,
        gymAlerts,
        communityMessages
      }
    };
    
    // If callback is provided, call it with the new state
    if (callback) callback(newState);
    
    return newState;
  });
};

// Then update saveAllFormData:
const saveAllFormData = () => {
  // Collect form values directly
  const sendingdata = {
    firstName: document.getElementById('firstName')?.value || '',
    lastName: document.getElementById('lastName')?.value || '',
    username: document.getElementById('username')?.value || '',
    birthdate: document.getElementById('birthdate')?.value || '',
    gender: document.getElementById('gender')?.value || '',
    location: document.getElementById('location')?.value || '',
    bio: document.getElementById('bio')?.value || '',
    // ...other fields if needed...
  };
  const token = localStorage.getItem('token');
  console.log("Sending data to backend:", sendingdata);
  axios.post(`${API_BASE_URL}/api/profile`, 
    sendingdata,
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": `Bearer ${token}`
      },
    }
  )
  .then(response => {
    console.log("Profile updated successfully:", response.data);
    // window.location.href = "/"; // Remove redirect
  })
  .catch(error => {
    console.error("Error updating profile:", error);
    alert("Failed to save profile. Please try again.");
  });
}
  // Only show personal info tab
  const PersonalInfoTab = () => (
    <div className="tab-content">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name*</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name*</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="username">Username*</label>
          <input
            type="text"
            id="username"
            name="username"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="birthdate">Date of Birth</label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            id="gender"
            name="gender"
            placeholder="Enter your gender"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          placeholder="City, State/Province, Country"
        />
      </div>
      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows="4"
          placeholder="Tell us about your fitness journey..."
        ></textarea>
      </div>
    </div>
  );
  
  const [profilePicture, setProfilePicture] = useState('');
  const handleProfilePictureUpload = (url) => {
    setProfilePicture(url);
    setData(prevState => ({
      ...prevState,
      profilePictureUrl: url
    }));
  };
  
  return (
    <div className="profile-setup-container">    
      <div className="profile-setup-content">
        <div className="profile-sidebar">
          <div className="avatar-container">
            <div className="avatar">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="profile-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <User size={40} />
                </div>
              )}
            </div>
            <ProfilePictureUpload 
              onUploadSuccess={handleProfilePictureUpload}
            />
          </div>
        </div>
        <div className="profile-form-container">
          <div className="profile-header">
            <h1>Create Profile</h1>
          </div>
          <form onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
            <div className="tab-header">
              <h2>Personal Information</h2>
              <p>Tell us about yourself</p>
            </div>
            <PersonalInfoTab />
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-submit"
                onClick={(e) => {
                  e.preventDefault();
                  saveAllFormData();
                }}
              >
                <Save size={16} />
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;