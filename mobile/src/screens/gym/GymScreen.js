import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';
const { width, height } = Dimensions.get('window');

const GymScreen = ({ route, navigation }) => {
  const { gymId, gym: initialGym } = route.params;
  
  const [gym, setGym] = useState(initialGym || null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [gymTags, setGymTags] = useState([]);

  // Available tags for selection
  const availableTags = [
    'Equipment', 'Cleanliness', 'Staff', 'Hours', 'Price', 'Location',
    'Parking', 'Locker Rooms', 'Classes', 'Personal Training', 'Cardio',
    'Weights', 'Pool', 'Sauna', 'Busy', 'Quiet', 'Spacious', 'Modern'
  ];

  useEffect(() => {
    if (gymId) {
      fetchGymDetails();
      fetchComments();
    }
  }, [gymId]);

  const fetchGymDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.get(`${API_BASE_URL}/api/gym/${gymId}`, { headers });
      setGym(response.data);
    } catch (error) {
      console.error('Error fetching gym details:', error);
      Alert.alert('Error', 'Failed to load gym details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/GetComments/?GymName=${encodeURIComponent(gymId)}`);
      const commentsData = response.data || [];
      setComments(commentsData);
      
      // Calculate average rating and total reviews
      if (commentsData.length > 0) {
        const avgRating = commentsData.reduce((sum, comment) => sum + (comment.Rating || 0), 0) / commentsData.length;
        setAverageRating(avgRating);
        setTotalReviews(commentsData.length);
        
        // Calculate popular tags
        const tagCounts = {};
        commentsData.forEach(comment => {
          if (comment.Tags && Array.isArray(comment.Tags)) {
            comment.Tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        const popularTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 6)
          .map(([tag, count]) => ({ tag, count }));
        
        setGymTags(popularTags);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim() || rating === 0) {
      Alert.alert('Error', 'Please provide a rating and comment');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please sign in to leave a review');
        return;
      }

      const commentData = {
        CommentID: Date.now().toString(),
        UserName: 'Anonymous',
        CommentText: newComment,
        GymName: gym?.name || '',
        GymId: gymId,
        Time: new Date().toISOString(),
        Rating: rating,
        Tags: selectedTags,
      };

      const response = await axios.post(`${API_BASE_URL}/api/comment`, commentData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setComments([commentData, ...comments]);
        setNewComment('');
        setRating(0);
        setSelectedTags([]);
        setShowReviewModal(false);
        Alert.alert('Success', 'Review submitted successfully!');
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchGymDetails(), fetchComments()]);
    setRefreshing(false);
  };

  const renderStars = (rating, size = 16, interactive = false, onPress = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress && onPress(i)}
          disabled={!interactive}
        >
          <MaterialIcons
            name={i <= rating ? 'star' : 'star-border'}
            size={size}
            color="#ff6b00"
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderComment = (comment, index) => (
    <View key={index} style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <View style={styles.commentUser}>
          <MaterialIcons name="person" size={24} color="#666" />
          <Text style={styles.commentUsername}>{comment.UserName || 'Anonymous'}</Text>
        </View>
        <View style={styles.commentRating}>
          {renderStars(comment.Rating || 0, 14)}
          <Text style={styles.commentTime}>
            {new Date(comment.Time).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.commentText}>{comment.CommentText}</Text>
      
      {comment.Tags && comment.Tags.length > 0 && (
        <View style={styles.commentTags}>
          {comment.Tags.map((tag, idx) => (
            <View key={idx} style={styles.commentTag}>
              <Text style={styles.commentTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderReviewModal = () => (
    <Modal
      visible={showReviewModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowReviewModal(false)}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Write a Review</Text>
          <TouchableOpacity onPress={handleSubmitReview} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            {renderStars(rating, 32, true, setRating)}
          </View>
          
          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience at this gym..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          {/* Tags Section */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>Tags (optional)</Text>
            <View style={styles.tagsGrid}>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagOption,
                    selectedTags.includes(tag) && styles.selectedTagOption
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[
                    styles.tagOptionText,
                    selectedTags.includes(tag) && styles.selectedTagOptionText
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (!gym && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading gym details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gym?.name || 'Gym Details'}</Text>
        <TouchableOpacity>
          <MaterialIcons name="share" size={24} color="#ff6b00" />
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
        {/* Gym Header */}
        <View style={styles.gymHeader}>
          <Text style={styles.gymName}>{gym?.name}</Text>
          {gym?.location && (
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.location}>{gym.location}</Text>
            </View>
          )}
          
          {/* Rating Summary */}
          <View style={styles.ratingSummary}>
            {renderStars(averageRating, 20)}
            <Text style={styles.averageRating}>
              {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
            </Text>
            <Text style={styles.totalReviews}>({totalReviews} reviews)</Text>
          </View>
        </View>

        {/* Gym Tags */}
        {gymTags.length > 0 && (
          <View style={styles.gymTagsSection}>
            <Text style={styles.sectionTitle}>Popular Tags</Text>
            <View style={styles.gymTagsContainer}>
              {gymTags.map((tagData, index) => (
                <View key={index} style={styles.gymTag}>
                  <Text style={styles.gymTagText}>
                    {tagData.tag} ({tagData.count})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Gym Hours */}
        {gym?.gym_hours && (
          <View style={styles.hoursSection}>
            <Text style={styles.sectionTitle}>Hours</Text>
            <Text style={styles.hoursText}>{gym.gym_hours}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={() => setShowReviewModal(true)}
          >
            <MaterialIcons name="rate-review" size={20} color="#fff" />
            <Text style={styles.reviewButtonText}>Write Review</Text>
          </TouchableOpacity>
          
          {gym?.position && (
            <TouchableOpacity style={styles.directionButton}>
              <MaterialIcons name="directions" size={20} color="#ff6b00" />
              <Text style={styles.directionButtonText}>Directions</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Reviews ({totalReviews})</Text>
          {comments.length > 0 ? (
            comments.map(renderComment)
          ) : (
            <View style={styles.noReviewsContainer}>
              <MaterialIcons name="rate-review" size={48} color="#ccc" />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>Be the first to review this gym!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {renderReviewModal()}
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
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  
  // Gym Header
  gymHeader: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  gymName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    marginLeft: 4,
    fontSize: 16,
    color: '#666',
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  averageRating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
  },
  
  // Gym Tags
  gymTagsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  gymTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gymTag: {
    backgroundColor: '#fff5f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  gymTagText: {
    fontSize: 14,
    color: '#ff6b00',
    fontWeight: '500',
  },
  
  // Hours
  hoursSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hoursText: {
    fontSize: 16,
    color: '#666',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#ff6b00',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  directionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ff6b00',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionButtonText: {
    color: '#ff6b00',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Reviews
  reviewsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  commentCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentUsername: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  commentRating: {
    alignItems: 'flex-end',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  commentText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  commentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  commentTag: {
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  commentTagText: {
    fontSize: 12,
    color: '#666',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
  },
  noReviewsSubtext: {
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
  submitButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  ratingSection: {
    marginBottom: 30,
  },
  commentSection: {
    marginBottom: 30,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  tagsSection: {
    marginBottom: 30,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagOption: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedTagOption: {
    backgroundColor: '#ff6b00',
    borderColor: '#ff6b00',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTagOptionText: {
    color: '#ffffff',
  },
});

export default GymScreen;
