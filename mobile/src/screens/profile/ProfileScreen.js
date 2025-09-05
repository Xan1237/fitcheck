import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';
const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [stats, setStats] = useState({
    totalPosts: 0,
    personalRecords: 0,
  });

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
    fetchUserStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const username = await AsyncStorage.getItem('username');
      if (!username) return;

      const response = await axios.get(`${API_BASE_URL}/api/GetUserData/?userName=${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success && response.data.user) {
        const userData = response.data.user;
        setProfile({
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          bio: userData.bio,
          location: userData.location,
          gymExperience: userData.gymExperience,
          preferredGymType: userData.preferredGymType,
          trainingFrequency: userData.trainingFrequency,
          profileImage: userData.profilePictureUrl,
          pr: userData.pr || [],
        });
        setEditedBio(userData.bio || '');
        // Followers/following not present in response, set to 0 or handle as needed
        setFollowers(0);
        setFollowing(0);
        // Posts from user data
        setPosts(userData.posts || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/user/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/user/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setStats({
          totalPosts: response.data.posts || 0,
          personalRecords: response.data.personalRecords || 0,
        });
        setFollowers(response.data.followers || 0);
        setFollowing(response.data.following || 0);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      uploadProfileImage(result.assets[0]);
    }
  };

  const uploadProfileImage = async (imageAsset) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      formData.append('profileImage', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        setProfile(prev => ({ ...prev, profileImage: response.data.imageUrl }));
        Alert.alert('Success', 'Profile image updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload profile image');
    }
  };

  const handleUpdateBio = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.put(
        `${API_BASE_URL}/api/profile/bio`,
        { bio: editedBio },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        setProfile(prev => ({ ...prev, bio: editedBio }));
        setShowEditModal(false);
        Alert.alert('Success', 'Bio updated successfully!');
      }
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update bio');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchUserPosts(), fetchUserStats()]);
    setRefreshing(false);
  };

  const renderPost = (post, index) => (
    <TouchableOpacity key={index} style={styles.postCard}>
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{post.content}</Text>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <MaterialIcons name="favorite" size={16} color="#ff6b00" />
            <Text style={styles.postStatText}>{post.likes || 0}</Text>
          </View>
          <View style={styles.postStat}>
            <MaterialIcons name="comment" size={16} color="#666" />
            <Text style={styles.postStatText}>{post.comments || 0}</Text>
          </View>
          <Text style={styles.postDate}>
            {new Date(post.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowEditModal(false)}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Bio</Text>
          <TouchableOpacity onPress={handleUpdateBio} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <Text style={styles.bioLabel}>Bio</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Tell us about yourself..."
            value={editedBio}
            onChangeText={setEditedBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.charCount}>{editedBio.length}/300</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#ff6b00" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b00']}
            tintColor="#ff6b00"
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.defaultImage}>
                <MaterialIcons name="person" size={40} color="#ccc" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <MaterialIcons name="camera-alt" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.username}>
            {profile?.username || user?.displayName || 'User'}
          </Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <MaterialIcons name="edit" size={16} color="#ff6b00" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalPosts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.personalRecords}</Text>
            <Text style={styles.statLabel}>PRs</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>
            {profile?.bio || 'No bio available. Tap edit to add one!'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="fitness-center" size={20} color="#ff6b00" />
            <Text style={styles.actionButtonText}>My Workouts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="location-on" size={20} color="#ff6b00" />
            <Text style={styles.actionButtonText}>Favorite Gyms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <MaterialIcons name="settings" size={20} color="#ff6b00" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>My Posts</Text>
          {posts.length > 0 ? (
            posts.map(renderPost)
          ) : (
            <View style={styles.noPostsContainer}>
              <MaterialIcons name="post-add" size={48} color="#ccc" />
              <Text style={styles.noPostsText}>No posts yet</Text>
              <Text style={styles.noPostsSubtext}>Share your fitness journey!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  content: {
    flex: 1,
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  defaultImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff6b00',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff6b00',
  },
  editButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '500',
  },
  
  // Stats
  statsContainer: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    paddingVertical: 20,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  
  // Bio
  bioSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  
  // Action Buttons
  actionButtons: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  
  // Posts
  postsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  postCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 16,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postContent: {
    gap: 8,
  },
  postText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 14,
    color: '#666',
  },
  postDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
  noPostsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPostsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
  },
  noPostsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  saveButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 20,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
});

export default ProfileScreen;
