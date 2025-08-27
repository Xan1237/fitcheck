import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { User, Plus, PencilLine, UserPlus, MapPin, X, MessageCircle, Settings, LogOut } from 'lucide-react';
import Header from '../../components/header';
import GymSearch from '../../components/GymSearch/GymSearch';
import ImageCropper from '../../components/ImageCropper/ImageCropper';
import './style.scss';
import gymData from '../../data/gymData.js'; // If you want to use static data

const TABS = [
  { id: 'stats', label: 'PRs' },
  { id: 'progress', label: 'Gyms' },
  { id: 'nutrition', label: 'Posts' },
];

function getTabFromQuery(search) {
  const params = new URLSearchParams(search);
  const tab = params.get('tab');
  if (tab === 'posts') return 'nutrition';
  if (tab === 'gyms') return 'progress';
  if (tab === 'prs') return 'stats';
  return 'stats';
}

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

const UserProfile = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserUuid, setCurrentUserUuid] = useState(null);



  // Fetch current user's UUID
  useEffect(() => {
      if(name == ""){
    navigate('/setUsername');
  }
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/GetUserData/?userName=${encodeURIComponent(localStorage.getItem('username'))}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCurrentUserUuid(data.user.uuid);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove the post from the state
        setPosts(prev => prev.filter(post => post.postId !== postId));
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const [userData, setUserData] = useState({
    name: '',
    username: '',
    bio: '',
    profilePicture: null,
    stats: { workoutsCompleted: '-', personalBests: '-', followers: '-', following: '-' },
    gymStats: []
  });

  // Set initial tab from query string
  const [activeTab, setActiveTab] = useState(() => getTabFromQuery(location.search));
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const [showAddPRModal, setShowAddPRModal] = useState(false);
  const [newPR, setNewPR] = useState({ exercise: '', weight: '', reps: '' });

  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ description: '', imageFile: null, tags: '' });
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [userGyms, setUserGyms] = useState([]);
  const [showGymSearch, setShowGymSearch] = useState(false);
  const [allGyms, setAllGyms] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({}); // Add this near other useState hooks
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const profilePictureInputRef = useRef(null);

  const [showEditPRModal, setShowEditPRModal] = useState(false);
  const [editingPR, setEditingPR] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Ownership check
  const checkProfileOwnership = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setIsOwnProfile(false);
      const res = await axios.get(`${API_BASE_URL}/api/checkProfileOwnership/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      setIsOwnProfile(!!res.data.isOwner);
    } catch (e) {
      console.error('Error checking profile ownership:', e);
      setIsOwnProfile(false);
    }
  };

  const getFollowerCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/getFollowerCount/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, stats: { ...prev.stats, followers: res.data.follower_count } }));
    } catch (e) { console.error(e); }
  };

  const getFollowingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/getFollowingCount/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, stats: { ...prev.stats, following: res.data.following_count } }));
    } catch (e) { console.error(e); }
  };

  const getPostCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/getNumberPost/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, stats: { ...prev.stats, workoutsCompleted: res.data.post_count } }));
    } catch (e) { console.error(e); }
  };

  const getPrCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/getNumberPR/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, stats: { ...prev.stats, personalBests: res.data.pr_count } }));
    } catch (e) { console.error(e); }
  };

  const isFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/isFollowing`, { targetUserName: name }, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, stats: { ...prev.stats, isFollowing: res.data.isFollowing } }));
    } catch (e) { console.error(e); }
  };

  const unfollowUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/unfollowUser`, { targetUserName: name }, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, stats: { ...prev.stats, isFollowing: false } }));
    } catch (e) { console.error(e); }
  };

  const getData = async () => {
    try {
      if (!name) throw new Error('Username parameter is required');
      const response = await fetch(`${API_BASE_URL}/api/GetUserData/?userName=${encodeURIComponent(name)}`);
      if (!response.ok) {
        if (response.status === 404) return; // graceful 404
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to fetch user data');

      setUserData(prev => ({
        ...prev,
        name: result.user.username,
        username: result.user.username,
        bio: result.user.bio,
        profilePicture: result.user.profilePictureUrl,
        gymStats: result.user.pr.map(pr => ({ exercise: pr.exercise_name, weight: `${pr.weight} lbs`, reps: pr.reps }))
      }));

      setPosts(result.user.posts || []);
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  };

  const fetchUserGyms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/getUserGyms/${name}`, { headers: { Authorization: `Bearer ${token}` } });
      const gyms = res?.data?.gyms || [];
      setUserGyms(gyms.map(gym => ({ id: gym.id, name: gym.name, address: gym.address })));
    } catch (e) {
      console.error('Error fetching user gyms:', e);
      setUserGyms([]);
    }
  };

  // Fetch all gyms (static or from backend)
  useEffect(() => {
    // If you want to use static gymData:
    const gymsArray = Object.entries(gymData).map(([id, data]) => ({
      ...data,
      id: parseInt(id),
      tags: data.tags || [],
      rating: data.rating || 0,
      ratingCount: data.ratingCount || 0
    }));
    setAllGyms(gymsArray);

    // If you want to fetch from backend, use this instead:
    // const fetchGyms = async () => {
    //   try {
    //     const response = await fetch(`${API_BASE_URL}/api/getGymsByProvince/Nova Scotia`);
    //     const result = await response.json();
    //     setAllGyms(result.gyms || []);
    //   } catch (e) {
    //     setAllGyms([]);
    //   }
    // };
    // fetchGyms();
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkProfileOwnership();
      await getData();
      await Promise.all([getFollowerCount(), getFollowingCount(), getPrCount(), getPostCount(), fetchUserGyms()]);
      await isFollowing();
    };
    init();
  }, [name]);

  useEffect(() => {
    setActiveTab(getTabFromQuery(location.search));
  }, [location.search]);

  // Handle clicks outside settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('expiresAt');
    
    // Dispatch custom event to notify other components about auth state change
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Redirect to home page
    navigate('/');
  };

  const handleSavePR = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/addPersonalRecord`, {
        newPR: {
          exercise: newPR.exercise.trim(),
          weight: Number(newPR.weight),
          reps: Number(newPR.reps)
        } 
      }, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({
        ...prev,
        stats: { ...prev.stats, personalBests: Number(prev.stats.personalBests) + 1 },
        gymStats: [...prev.gymStats, {
          exercise: newPR.exercise.trim(),
          weight: `${Number(newPR.weight)} lbs`,
          reps: Number(newPR.reps)
        }]
      }));
      setShowAddPRModal(false);
      setNewPR({ exercise: '', weight: '', reps: '' });
    } catch (e) { console.error('Error saving PR:', e); }
  };

  const handleUpdatePR = async () => {
    try {
      const token = localStorage.getItem('token');
      // Allow changing the exercise name too (optional)
      const originalWeight = Number(String(editingPR.weight).toString());
      const originalReps   = Number(String(editingPR.reps).toString());
      const payload = {
        exerciseName: editingPR.exercise,      // original exercise
        weight: originalWeight,                // original weight
        reps: originalReps,                    // original reps
        // optional new values:
        newExerciseName: editingPR.newExercise ?? undefined,
        newWeight: (editingPR.newWeight != null) ? Number(editingPR.newWeight) : undefined,
        newReps:   (editingPR.newReps != null)   ? Number(editingPR.newReps)   : undefined,
      };


      await axios.put(`${API_BASE_URL}/api/pr`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update UI state
      setUserData(prev => {
        const next = { ...prev };
        next.gymStats = prev.gymStats.map(item => {
          if (item.exercise !== editingPR.exercise
              || Number(String(item.weight).replace(/[^0-9.]/g,'')) !== originalWeight
              || Number(item.reps) !== originalReps) return item;

          const newW = editingPR.newWeight != null ? Number(editingPR.newWeight) : originalWeight;
          const newR = editingPR.newReps   != null ? Number(editingPR.newReps)   : originalReps;
          const newE = editingPR.newExercise ?? editingPR.exercise;

          return { exercise: newE, weight: `${newW} lbs`, reps: newR };
        });
        return next;
      });

      setShowEditPRModal(false);
      setEditingPR(null);
    } catch (e) {
      console.error('Error updating PR:', e);
      alert('Failed to update PR.');
    }
  };

  const handleDeletePR = async (exerciseName, weight, reps) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/pr`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { exerciseName, weight: Number(weight), reps: Number(reps) }
      });


      // Update UI state
      setUserData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          personalBests: Math.max(0, Number(prev.stats.personalBests) - 1)
        },
        gymStats: prev.gymStats.filter(item =>
          !(item.exercise === exerciseName &&
            Number(String(item.weight).replace(/[^0-9.]/g,'')) === Number(weight) &&
            Number(item.reps) === Number(reps))
        )
      }));
    } catch (e) {
      console.error('Error deleting PR:', e);
      alert('Failed to delete PR.');
    }
  };


  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/newFollower`, { targetUserName: name }, { headers: { Authorization: `Bearer ${token}` } });
      await isFollowing();
      getFollowerCount();
    } catch (e) { console.error('Error following user:', e); }
  };

  const handleFileSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please upload an image file');
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return alert('File size must be less than 5MB');
    const reader = new FileReader();
    reader.onload = ev => setNewPost(prev => ({ ...prev, imageFile: ev.target?.result }));
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        description: newPost.description,
        imageFile: newPost.imageFile,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const res = await axios.post(`${API_BASE_URL}/api/createPost`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setPosts(prev => [{
          id: res.data.data[0].id,
          description: newPost.description,
          image_url: res.data.data[0].image_url,
          tags: payload.tags,
          created_at: new Date(),
          username: userData.username
        }, ...prev]);
        setShowAddPostModal(false);
        setNewPost({ description: '', imageFile: null, tags: '' });
      }
    } catch (e) {
      console.error('Error creating post:', e);
      alert('Failed to create post. Please try again.');
    }
  };

  function handleMessage() {
    const token = localStorage.getItem('token'); 
    axios.post(`${API_BASE_URL}/api/newChat`, { targetUserName: userData.username }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        window.location.href = '/messages';
      })
      .catch(error => {   
        window.location.href = '/messages';
      })
  }

  const handleGymSelect = async gym => {
    if (userGyms.some(g => g.id === gym.id)) return alert('This gym is already in your profile');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/addUserGym`, { gymId: gym.id, username: userData.username, gymName: gym.name, gymAdress: gym.address }, { headers: { Authorization: `Bearer ${token}` } });
      setUserGyms(prev => [...prev, gym]);
      setShowGymSearch(false);
    } catch (e) {
      console.error('Error adding gym:', e);
      alert('Failed to add gym. Please try again.');
    }
  };

  const handleGymClick = id => navigate(`/gym/${id}`);

  const handleRemoveGym = async (gymId) => {
    try {
      const token = localStorage.getItem('token');
      // Optionally, call your backend to remove the gym for this user
      await axios.post(`${API_BASE_URL}/api/removeUserGym`, { gymId, username: userData.username }, { headers: { Authorization: `Bearer ${token}` } });
      setUserGyms(prev => prev.filter(gym => gym.id !== gymId));
    } catch (e) {
      console.error('Error removing gym:', e);
      alert('Failed to remove gym. Please try again.');
    }
  };

  const parseTags = tagsVal => {
    try {
      if (Array.isArray(tagsVal)) return tagsVal;
      if (typeof tagsVal === 'string') {
        try { return JSON.parse(tagsVal); } catch { return tagsVal.split(',').map(t => t.trim()).filter(Boolean); }
      }
      return [];
    } catch { return []; }
  };

  const toggleExpand = (postId) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleProfilePictureSelect = (e) => {
    const file = e.target.files?.[0];
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

    const imageUrl = URL.createObjectURL(file);
    setTempImage(imageUrl);
    setShowImageCropper(true);
  };

  const handleCropComplete = async (croppedImageUrl) => {
    try {
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

        setUserData(prev => ({
          ...prev,
          profilePicture: data.url
        }));
        
        URL.revokeObjectURL(croppedImageUrl);
        URL.revokeObjectURL(tempImage);
        setTempImage(null);
        setShowImageCropper(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  return (
    <div className="profile-page">
      <Header />
      
      {/* Settings Icon - Only show on own profile */}
      {isOwnProfile && (
        <div className="profile-settings-container" style={{ color: "#ffffff" }} ref={settingsDropdownRef}>
          <button
            className="profile-settings-icon"
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
          >
            <Settings className="settings-gear" />
          </button>
          {showSettingsDropdown && (
            <div className="profile-settings-dropdown">
              <button 
                className="settings-option logout-option"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero */}
      <section className="profile-hero no-gradient">
        <div className="hero-inner container">
          <div className="avatar-wrap">
            {isOwnProfile && (
              <input
                type="file"
                ref={profilePictureInputRef}
                onChange={handleProfilePictureSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
            )}
            <div
              className="avatar-container"
              data-clickable={isOwnProfile ? "true" : "false"}
              onClick={() => isOwnProfile && profilePictureInputRef.current?.click()}
            >
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="avatar-img"
                />
              ) : (
                <User size={84} /> // Just the icon, no wrapper
              )}
              {isOwnProfile && <div className="avatar-overlay"><Plus size={24} /></div>}
            </div>
            {showImageCropper && tempImage && (
              <ImageCropper
                image={tempImage}
                onCropComplete={handleCropComplete}
                onCancel={() => {
                  setShowImageCropper(false);
                  setTempImage(null);
                }}
              />
            )}
          </div>

          <div className="identity">
            <h1 id="userName" className="display">{userData.name}</h1>
            <p className="bio">{userData.bio}</p>

            <div className="actions">
              {isOwnProfile ? (
                <>
                  <button className="btn" onClick={() => navigate('/editBio')}>
                    <PencilLine size={16} />
                    <span>Edit bio</span>
                  </button>
                  <button
                    className="btn primary"
                    onClick={() => navigate('/createPost')}
                  >
                    <Plus size={16} />
                    <span>New post</span>
                  </button>
                </>
              ) : (
                <>
                <button className="btn primary" onClick={handleFollow}>
                  <UserPlus size={16} />
                  <span>{userData.stats.isFollowing ? "Unfollow" : "Follow"}</span>
                </button>
                  <button className="btn primary" onClick={handleMessage}>
                  <MessageCircle size={16} />
                  <span>
                    Message
                  </span>
                </button>
                </>
              )}
            </div>
          </div>

          <div className="quick-stats">
            <div className="stat">
              <div className="value">{userData.stats.workoutsCompleted}</div>
              <div className="label">Posts</div>
            </div>
            <div className="stat">
              <div className="value">{userData.stats.personalBests}</div>
              <div className="label">PRs</div>
            </div>
            <div className="stat" onClick={() => { if (userData.stats.followers > 0) navigate(`/followers/${userData.username}`) }}>
              <div className="value">{userData.stats.followers}</div>
              <div className="label">Followers</div>
            </div>
            <div className="stat" onClick={() => { if (userData.stats.following > 0) navigate(`/following/${userData.username}`) }}>
              <div className="value">{userData.stats.following}</div>
              <div className="label">Following</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container">
        <nav className="tabs tabs--segmented" role="tablist" aria-label="Profile sections">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* PRs */}
        {activeTab === 'stats' && (
          <section className="panel" role="tabpanel">
            <header className="panel-head">
              <h2>Personal Records</h2>
              {isOwnProfile && (
                <button className="btn subtle" onClick={() => setShowAddPRModal(true)}>
                  <Plus size={16} />
                  <span>Add PR</span>
                </button>
              )}
            </header>
            {userData.gymStats?.length ? (
              <div className="pr-grid">
                {userData.gymStats.map((stat, i) => (
                  <article key={`${stat.exercise}-${i}`} className="card pr-card">
                    <div className="row between">
                      <span className="exercise">{stat.exercise}</span>
                      <span className="weight">{stat.weight}</span>
                    </div>
                    <div className="meta"><span>Reps</span><strong>{stat.reps}</strong></div>

                    {isOwnProfile && (
                      <div className="row gap-8" style={{ marginTop: 8 }}>
                        <button
                          className="btn subtle"
                          onClick={() => {
                            const w = typeof stat.weight === 'string'
                              ? Number(String(stat.weight).replace(/[^0-9.]/g, ''))
                              : Number(stat.weight);
                            setEditingPR({
                              exercise: stat.exercise,
                              weight: w || 0,
                              reps: Number(stat.reps) || 1
                            });
                            setShowEditPRModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn subtle"
                          onClick={() => handleDeletePR(
                            stat.exercise,
                            Number(String(stat.weight).replace(/[^0-9.]/g,'')),
                            Number(stat.reps)
                          )}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">No PRs yet</div>
            )}
          </section>
        )}

        {/* Gyms */}
        {activeTab === 'progress' && (
          <section className="panel" role="tabpanel">
            <header className="panel-head">
              <h2>Gyms</h2>
              {isOwnProfile && (
                <button className="btn subtle" onClick={() => setShowGymSearch(true)}>
                  <Plus size={16} />
                  <span>Add gym</span>
                </button>
              )}
            </header>

            {userGyms?.length ? (
              <div className="gym-strip" role="list">
                {userGyms.map(gym => (
                  <article key={gym.id} role="listitem" className="card gym-card" onClick={() => handleGymClick(gym.id)} style={{ position: 'relative' }}>
                    {/* Remove button */}
                    <button
                      className="remove-gym-btn"
                      aria-label="Remove gym"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveGym(gym.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'none',
                        border: 'none',
                        color: '#FF5722',
                        fontSize: '18px',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                    >
                      ×
                    </button>
                    <div className="gym-title">{gym.name}</div>
                    <div className="gym-sub"><MapPin size={14} /> {gym.address}</div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">No gyms added</div>
            )}

            {showGymSearch && (
              <div className="modal" role="dialog" aria-modal="true">
                <div className="modal-box">
                  <header className="modal-head">
                    <h3>Search gyms</h3>
                    <button className="icon-btn" aria-label="Close" onClick={() => setShowGymSearch(false)}>
                      <X size={18} />
                    </button>
                  </header>
                  <div className="modal-body gym-search-body">
                    <GymSearch gyms={allGyms} onGymSelect={handleGymSelect} />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Posts */}
        {activeTab === 'nutrition' && (
          <section className="panel" role="tabpanel">
            {posts?.length ? (
              <div className="post-grid">
                {posts.map((post, idx) => {
                  const postKey = post.id ?? idx;
                  const isExpanded = expandedPosts[postKey];
                  const maxLength = 220;
                  const isLong = post.description && post.description.length > maxLength;
                  const previewText = isLong && !isExpanded
                    ? post.description.slice(0, maxLength)
                    : post.description;

                  return (
                    <article
                      key={postKey}
                      className="card post-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/post/${post.postId || post.id}`)}
                    >
                      {isOwnProfile && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeletePost(post.postId);
                          }}
                          className="delete-post-btn"
                          aria-label="Delete post"
                        >
                          <X size={16} />
                        </button>
                      )}
                      {post.image_url && (
                        <img src={post.image_url} className="post-img" loading="lazy" />
                      )}
                      <div className="post-body">
                        <p className="post-desc" style={{ whiteSpace: 'pre-line' }}>
                          {previewText}
                          {isLong && (
                            <span 
                              className="expand-toggle subtle"
                              onClick={e => {
                                e.stopPropagation();
                                toggleExpand(postKey);
                              }}
                              role="button"
                              tabIndex={0}
                              style={{ userSelect: 'none' }}
                              onKeyPress={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  toggleExpand(postKey);
                                }
                              }}
                            >
                              {isExpanded ? ' show less' : '...more'}
                            </span>
                          )}
                        </p>
                        <div className="profile-post-tags">
                          {parseTags(post.tags).map((tag, idx) => (
                            <span key={`${postKey}-tag-${idx}`} className="tag">#{tag}</span>
                          ))}
                        </div>
                        <time className="date">{formatTimeSince(post.created_at)}</time>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty">No posts yet</div>
            )}
          </section>
        )}
      </div>

      {showEditPRModal && editingPR && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <header className="modal-head">
              <h3>Edit personal record</h3>
              <button className="icon-btn" aria-label="Close" onClick={() => { setShowEditPRModal(false); setEditingPR(null); }}>
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field">
                  <span>Exercise</span>
                  <input
                    type="text"
                    value={editingPR.newExercise ?? editingPR.exercise}
                    onChange={e => setEditingPR(prev => ({ ...prev, newExercise: e.target.value }))}
                    placeholder="Bench Press"
                  />
                </label>
                <label className="field">
                  <span>Weight (lbs)</span>
                  <input
                    type="number"
                    value={editingPR.newWeight ?? editingPR.weight}
                    onChange={e => setEditingPR(prev => ({ ...prev, newWeight: e.target.value }))}
                    placeholder="225"
                    min={1}
                  />
                </label>
                <label className="field">
                  <span>Reps</span>
                  <input
                    type="number"
                    value={editingPR.newReps ?? editingPR.reps}
                    onChange={e => setEditingPR(prev => ({ ...prev, newReps: e.target.value }))}
                    placeholder="5"
                    min={1}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => { setShowEditPRModal(false); setEditingPR(null); }}>Cancel</button>
                <button className="btn primary" onClick={handleUpdatePR}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Add PR Modal */}
      {showAddPRModal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <header className="modal-head">
              <h3>Add personal record</h3>
              <button className="icon-btn" aria-label="Close" onClick={() => setShowAddPRModal(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field">
                  <span>Exercise</span>
                  <input type="text" value={newPR.exercise} onChange={e => setNewPR({ ...newPR, exercise: e.target.value })} placeholder="Bench Press" />
                </label>
                <label className="field">
                  <span>Weight (lbs)</span>
                  <input type="number" value={newPR.weight} onChange={e => setNewPR({ ...newPR, weight: e.target.value })} placeholder="225" />
                </label>
                <label className="field">
                  <span>Reps</span>
                  <input type="number" value={newPR.reps} onChange={e => setNewPR({ ...newPR, reps: e.target.value })} placeholder="5" />
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => setShowAddPRModal(false)}>Cancel</button>
                <button className="btn primary" onClick={handleSavePR}>Save PR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Post Modal */}
      {showAddPostModal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-box">
            <header className="modal-head">
              <h3>Create new post</h3>
              <button className="icon-btn" aria-label="Close" onClick={() => setShowAddPostModal(false)}>
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <div className="form-grid">
                <label className="field">
                  <span>Description*</span>
                  <textarea rows={4} value={newPost.description} onChange={e => setNewPost(prev => ({ ...prev, description: e.target.value }))} placeholder="Write a description" />
                </label>
                <label className="field">
                  <span>Image</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} ref={fileInputRef} />
                  {newPost.imageFile && (
                    <img src={newPost.imageFile} alt="Selected" className="preview" />
                  )}
                </label>
                <label className="field">
                  <span>Tags (comma separated)</span>
                  <input type="text" value={newPost.tags} onChange={e => setNewPost(prev => ({ ...prev, tags: e.target.value }))} placeholder="workout, fitness, gym" />
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => setShowAddPostModal(false)}>Cancel</button>
                <button className="btn primary" onClick={handleCreatePost} disabled={!newPost.imageFile || !newPost.description}>Post</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;