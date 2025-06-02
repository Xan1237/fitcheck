import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Save, Camera, Dumbbell, Award, Clipboard, User, MapPin, Calendar, Activity } from 'lucide-react';
import './profile.scss';
import axios from 'axios';
import { getAuth } from "firebase/auth";
import ImageCropper from '../../components/ImageCropper/ImageCropper';

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
        
        const uploadResponse = await fetch('/api/uploadProfilePicture', {
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
  const [activeTab, setActiveTab] = useState('personal');
  const [submittedData, setSubmittedData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    username: '',
    email: '',
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
  
  // Effect to populate form fields whenever the active tab changes
  useEffect(() => {
    // Small timeout to ensure the DOM elements are available
    const timeout = setTimeout(() => {
      if (activeTab === 'personal') {
        // Populate personal info fields
        const elements = {
          firstName: document.getElementById('firstName'),
          lastName: document.getElementById('lastName'),
          username: document.getElementById('username'),
          email: document.getElementById('email'),
          birthdate: document.getElementById('birthdate'),
          gender: document.getElementById('gender'),
          location: document.getElementById('location'),
          bio: document.getElementById('bio')
        };
        
        // Only set values if elements exist
        if (elements.firstName) elements.firstName.value = data.firstName || '';
        if (elements.lastName) elements.lastName.value = data.lastName || '';
        if (elements.username) elements.username.value = data.username || '';
        if (elements.email) elements.email.value = data.email || '';
        if (elements.birthdate) elements.birthdate.value = data.birthdate || '';
        if (elements.gender) elements.gender.value = data.gender || '';
        if (elements.location) elements.location.value = data.location || '';
        if (elements.bio) elements.bio.value = data.bio || '';
      } 
      else if (activeTab === 'gymStats') {
        // Populate gym stats fields
        const elements = {
          gymExperience: document.getElementById('gymExperience'),
          trainingFrequency: document.getElementById('trainingFrequency'),
          fitnessGoals: document.getElementById('fitnessGoals'),
          preferredGymType: document.getElementById('preferredGymType')
        };
        
        if (elements.gymExperience) elements.gymExperience.value = data.gymExperience || '';
        if (elements.trainingFrequency) elements.trainingFrequency.value = data.trainingFrequency || '';
        if (elements.fitnessGoals) elements.fitnessGoals.value = data.fitnessGoals || '';
        if (elements.preferredGymType) elements.preferredGymType.value = data.preferredGymType || '';
      }
      else if (activeTab === 'personalRecords') {
        // Populate personal records fields
        const elements = {
          benchPR: document.getElementById('benchPR'),
          squatPR: document.getElementById('squatPR'),
          deadliftPR: document.getElementById('deadliftPR'),
          overheadPressPR: document.getElementById('overheadPressPR'),
          pullUpMax: document.getElementById('pullUpMax'),
          mile: document.getElementById('mile')
        };
        
        if (elements.benchPR) elements.benchPR.value = data.benchPR || '';
        if (elements.squatPR) elements.squatPR.value = data.squatPR || '';
        if (elements.deadliftPR) elements.deadliftPR.value = data.deadliftPR || '';
        if (elements.overheadPressPR) elements.overheadPressPR.value = data.overheadPressPR || '';
        if (elements.pullUpMax) elements.pullUpMax.value = data.pullUpMax || '';
        if (elements.mile) elements.mile.value = data.mile || '';
      }
      else if (activeTab === 'preferences') {
        // Populate preferences fields
        const elements = {
          favoriteEquipment: document.getElementById('favoriteEquipment'),
          workoutStyle: document.getElementById('workoutStyle'),
          newReviews: document.getElementById('newReviews'),
          prReminders: document.getElementById('prReminders'),
          gymAlerts: document.getElementById('gymAlerts'),
          communityMessages: document.getElementById('communityMessages')
        };
        
        if (elements.favoriteEquipment) elements.favoriteEquipment.value = data.favoriteEquipment || '';
        if (elements.workoutStyle) elements.workoutStyle.value = data.workoutStyle || '';
        if (elements.newReviews) elements.newReviews.checked = data.notificationPreferences?.newReviews || false;
        if (elements.prReminders) elements.prReminders.checked = data.notificationPreferences?.prReminders || false;
        if (elements.gymAlerts) elements.gymAlerts.checked = data.notificationPreferences?.gymAlerts || false;
        if (elements.communityMessages) elements.communityMessages.checked = data.notificationPreferences?.communityMessages || false;
      }
    }, 50); // Short delay to ensure DOM is ready
    
    return () => clearTimeout(timeout);
  }, [activeTab, data]); // Depend on activeTab and data
  
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
    const email = document.getElementById('email')?.value || '';
    const birthdate = document.getElementById('birthdate')?.value || '';
    const gender = document.getElementById('gender')?.value || '';
    const location = document.getElementById('location')?.value || '';
    const bio = document.getElementById('bio')?.value || '';
    
    setData(prevState => ({
      ...prevState,
      firstName,
      lastName,
      username,
      email,
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
  // Save data from the current tab before submitting
  if (activeTab === 'personal') {
    personalInformation();
    setSubmittedData({...data});
  } else if (activeTab === 'gymStats') {
    gymStatsInformation();
    setSubmittedData({...data});
  } else if (activeTab === 'personalRecords') {
    personalRecordsInformation();
    setSubmittedData({...data});
  } else if (activeTab === 'preferences') {
    // Use the callback version to ensure we have the latest data
      preferencesInformation()
      setSubmittedData({...data});
      console.log("All form datfewfwefwefwefa saved:", data);
  }


  let sendingdata = {
    // Personal info
    "firstName": data.firstName || '',
    "lastName": data.lastName || '',
    "username": data.username || '',
    "email": data.email || '',
    "birthdate": data.birthdate || '',
    "gender": data.gender || '',
    "location": data.location || '',
    "bio": data.bio || '',
    
    // Gym stats
    "gymExperience": data.gymExperience || '',
    "trainingFrequency": data.trainingFrequency,
    "fitnessGoals": data.fitnessGoals,
    "preferredGymType": data.preferredGymType,
    
    // Personal records
    "benchPR": data.benchPR,
    "squatPR": data.squatPR,
    "deadliftPR": data.deadliftPR,
   "overheadPressPR": data.overheadPressPR,
    "pullUpMax": data.pullUpMax,
    "mile": data.mile,
    
    // Preferences
   "favoriteEquipment": data.favoriteEquipment,
   "workoutStyle": data.workoutStyle,
   "notificationPreferences": {
   "newReviews": data.newReviews,
    "prReminders": data.prReminders,
    "gymAlerts": data.gymAlerts,
    "communityMessages": data.communityMessages
    }
  };
  const token = localStorage.getItem('token')
  axios.post("/api/profile", 
    { sendingdata }, 
    {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
        "Authorization": `Bearer ${token}` // Add the token here
      },
    }
  )
  .then(response => {
    console.log("Profile updated successfully:", response.data);
  })
  .catch(error => {
    console.error("Error updating profile:", error);
  });
  window.location.href = "/"
}
  // Tab content components
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
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
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
  
  const GymStatsTab = () => (
    <div className="tab-content">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="gymExperience">Gym Experience</label>
          <input
            type="text"
            id="gymExperience"
            name="gymExperience"
            placeholder="e.g., Beginner (0-1 years)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="trainingFrequency">Training Frequency</label>
          <input
            type="text"
            id="trainingFrequency"
            name="trainingFrequency"
            placeholder="e.g., 3-4 times per week"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="fitnessGoals">Fitness Goals</label>
        <input
          type="text"
          id="fitnessGoals"
          name="fitnessGoals"
          placeholder="e.g., Strength, Hypertrophy, Weight Loss (comma separated)"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="preferredGymType">Preferred Gym Type</label>
        <input
          type="text"
          id="preferredGymType"
          name="preferredGymType"
          placeholder="e.g., Commercial Gym, Home Gym"
        />
      </div>
    </div>
  );
  
  const PersonalRecordsTab = () => (
    <div className="tab-content">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="benchPR">Bench Press PR (1RM)</label>
          <div className="input-with-unit">
            <input
              type="text"
              id="benchPR"
              name="benchPR"
              placeholder="0"
              onKeyDown={(e) => {
                // Prevent form submission when Enter is pressed in this field
                if (e.key === 'Enter') {
                  e.preventDefault();
                  calculateOneRepMax(); // Call PR calculator instead if we're on this tab
                }
              }}
            />
            <span className="unit">lbs</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="squatPR">Squat PR (1RM)</label>
          <div className="input-with-unit">
            <input
              type="text"
              id="squatPR"
              name="squatPR"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            <span className="unit">lbs</span>
          </div>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="deadliftPR">Deadlift PR (1RM)</label>
          <div className="input-with-unit">
            <input
              type="text"
              id="deadliftPR"
              name="deadliftPR"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            <span className="unit">lbs</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="overheadPressPR">Overhead Press PR (1RM)</label>
          <div className="input-with-unit">
            <input
              type="text"
              id="overheadPressPR"
              name="overheadPressPR"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            <span className="unit">lbs</span>
          </div>
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="pullUpMax">Pull-ups (Max Reps)</label>
          <div className="input-with-unit">
            <input
              type="text"
              id="pullUpMax"
              name="pullUpMax"
              placeholder="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            <span className="unit">reps</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="mile">Mile Run</label>
          <div className="input-with-unit">
            <input
              type="text"
              id="mile"
              name="mile"
              placeholder="00:00"
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            <span className="unit">min:sec</span>
          </div>
        </div>
      </div>
      
      <div className="pr-calculator">
        <h3>PR Calculator</h3>
        <p>Enter your weight and reps to estimate your 1RM</p>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="calcWeight">Weight</label>
            <div className="input-with-unit">
              <input 
                type="text" 
                id="calcWeight" 
                placeholder="0" 
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    calculateOneRepMax();
                  }
                }}
              />
              <span className="unit">lbs</span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="calcReps">Reps</label>
            <input 
              type="text" 
              id="calcReps" 
              placeholder="0" 
              value={calcReps}
              onChange={(e) => setCalcReps(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  calculateOneRepMax();
                }
              }}
            />
          </div>
          <button 
            type="button" 
            className="pr-calc-button"
            onClick={calculateOneRepMax}
          >
            Calculate 1RM
          </button>
        </div>
        <div className="estimated-pr">
          <span>Estimated 1RM: </span>
          <span className="pr-result">{estimatedPR} lbs</span>
        </div>
      </div>
    </div>
  );
  
  const PreferencesTab = () => (
    <div className="tab-content">
     
    </div>
  );
  
  // Map tabs to their content components
  const tabContent = {
    personal: <PersonalInfoTab />,
    gymStats: <GymStatsTab />,
    personalRecords: <PersonalRecordsTab />,
    preferences: <PreferencesTab />
  };
  
  // Tabs array for easier navigation
  const tabs = ['personal', 'gymStats', 'personalRecords', 'preferences'];
  
  // Function to handle the "Next" button click
  const handleNext = () => {
    const currentIndex = tabs.indexOf(activeTab);
    
    // Save data from current tab
    if (activeTab === 'personal') {
      personalInformation();
    } else if (activeTab === 'gymStats') {
      gymStatsInformation();
    } else if (activeTab === 'personalRecords') {
      personalRecordsInformation();
    } else if (activeTab === 'preferences') {
      preferencesInformation();
    }
    
    // Move to next tab if available
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      setActiveTab(nextTab);
      updateProgressBar(nextTab);
    }
  };
  
  // Function to handle the "Previous" button click
  const handlePrevious = () => {
    const currentIndex = tabs.indexOf(activeTab);
    
    // Save data from current tab before going back
    if (activeTab === 'personal') {
      personalInformation();
    } else if (activeTab === 'gymStats') {
      gymStatsInformation();
    } else if (activeTab === 'personalRecords') {
      personalRecordsInformation();
    } else if (activeTab === 'preferences') {
      preferencesInformation();
    }
    
    // Move to previous tab if available
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      setActiveTab(prevTab);
      updateProgressBar(prevTab);
    }
  };
  
  // Prevent form submission on enter for all fields
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only process the submission if we're on the preferences tab and clicked the save button
      if (activeTab === 'preferences' && e.target.classList.contains('btn-submit')) {
        saveAllFormData();
      }
    }
  };
  
  const [profilePicture, setProfilePicture] = useState('');

  const handleProfilePictureUpload = (url) => {
    setProfilePicture(url);
    // Update the form data with the new profile picture URL
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
          
          <nav className="profile-navigation">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { 
                  // Save current tab data before switching
                  if (activeTab === 'personal') {
                    personalInformation();
                  } else if (activeTab === 'gymStats') {
                    gymStatsInformation();
                  } else if (activeTab === 'personalRecords') {
                    personalRecordsInformation();
                  } else if (activeTab === 'preferences') {
                    preferencesInformation();
                  }
                  
                  setActiveTab(tab);
                  updateProgressBar(tab);
                }}
                type="button"
              >
                {tab === 'personal' && <User size={18} />}
                {tab === 'gymStats' && <Activity size={18} />}
                {tab === 'personalRecords' && <Award size={18} />}
                {tab === 'preferences' && <Clipboard size={18} />}
                <span>
                  {tab === 'personal' && 'Personal Info'}
                  {tab === 'gymStats' && 'Gym Stats'}
                  {tab === 'personalRecords' && 'Personal Records'}
                  {tab === 'preferences' && 'Final Submititon'}
                </span>
              </button>
            ))}
          </nav>
          
          <div className="progress-container">
            <span className="progress-label">Profile Completion</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-percentage">{progress}%</span>
          </div>
        </div>
        
        <div className="profile-form-container">
          <div className="profile-header">
            <h1>Create Profile</h1>
          </div>
          <form onKeyDown={handleKeyDown}>
            <div className="tab-header">
              <h2>
                {activeTab === 'personal' && 'Personal Information'}
                {activeTab === 'gymStats' && 'Gym Experience & Stats'}
                {activeTab === 'personalRecords' && 'Personal Records'}
                {activeTab === 'preferences' && 'Final Submition'}
              </h2>
              <p>
                {activeTab === 'personal' && 'Tell us about yourself'}
                {activeTab === 'gymStats' && 'Share your fitness background'}
                {activeTab === 'personalRecords' && 'Track your lifting achievements'}
                {activeTab === 'preferences' && 'Update Your Profile'}
              </p>
            </div>
            
            {tabContent[activeTab]}
            
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevious}
                disabled={activeTab === 'personal'}
              >
                Previous
              </button>
              
              {activeTab !== 'preferences' ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Next
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-submit"
                  onClick={(e) => {
                    e.preventDefault();
                    saveAllFormData();
                    setProgress(100)
                  }}
                >
                  <Save size={16} />
                  Save Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;