import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';
const { width } = Dimensions.get('window');

const CreatePostScreen = ({ navigation }) => {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gymTag, setGymTag] = useState('');
  const [workoutType, setWorkoutType] = useState('');

  const workoutTypes = [
    'Cardio', 'Strength', 'Yoga', 'HIIT', 'CrossFit', 'Running', 
    'Swimming', 'Cycling', 'Weightlifting', 'Calisthenics'
  ];

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmitPost = async () => {
    if (!postText.trim()) {
      Alert.alert('Error', 'Please write something to share!');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please sign in to create a post');
        return;
      }

      const formData = new FormData();
      formData.append('PostText', postText);
      formData.append('Time', new Date().toISOString());
      
      if (gymTag) {
        formData.append('GymName', gymTag);
      }
      
      if (workoutType) {
        formData.append('WorkoutType', workoutType);
      }

      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'post-image.jpg',
        });
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Post shared successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to share post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          style={[styles.shareButton, !postText.trim() && styles.shareButtonDisabled]}
          onPress={handleSubmitPost}
          disabled={!postText.trim() || isSubmitting}
        >
          <Text style={[styles.shareButtonText, !postText.trim() && styles.shareButtonTextDisabled]}>
            {isSubmitting ? 'Sharing...' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Post Input */}
        <View style={styles.postSection}>
          <TextInput
            style={styles.postInput}
            placeholder="What's your workout story?"
            value={postText}
            onChangeText={setPostText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
            autoFocus
          />
          <Text style={styles.charCount}>{postText.length}/500</Text>
        </View>

        {/* Image Section */}
        {selectedImage ? (
          <View style={styles.imageSection}>
            <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
            <MaterialIcons name="add-a-photo" size={24} color="#ff6b00" />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>
        )}

        {/* Gym Tag */}
        <View style={styles.tagSection}>
          <Text style={styles.tagLabel}>Tag a Gym (optional)</Text>
          <TextInput
            style={styles.tagInput}
            placeholder="Which gym are you at?"
            value={gymTag}
            onChangeText={setGymTag}
            maxLength={100}
          />
        </View>

        {/* Workout Type */}
        <View style={styles.tagSection}>
          <Text style={styles.tagLabel}>Workout Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.workoutTypeScroll}>
            {workoutTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.workoutTypeChip,
                  workoutType === type && styles.selectedWorkoutTypeChip
                ]}
                onPress={() => setWorkoutType(workoutType === type ? '' : type)}
              >
                <Text style={[
                  styles.workoutTypeText,
                  workoutType === type && styles.selectedWorkoutTypeText
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for great posts:</Text>
          <Text style={styles.tipText}>• Share your workout achievements</Text>
          <Text style={styles.tipText}>• Tag the gym you're at</Text>
          <Text style={styles.tipText}>• Add photos of your progress</Text>
          <Text style={styles.tipText}>• Inspire others with your journey</Text>
        </View>
      </ScrollView>
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
  shareButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  shareButtonDisabled: {
    backgroundColor: '#ccc',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Post Section
  postSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  postInput: {
    fontSize: 16,
    color: '#222',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  
  // Image Section
  imageSection: {
    position: 'relative',
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderStyle: 'dashed',
  },
  addImageText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#ff6b00',
    fontWeight: '500',
  },
  
  // Tag Sections
  tagSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  tagLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#f8f8f8',
  },
  workoutTypeScroll: {
    marginTop: 8,
  },
  workoutTypeChip: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedWorkoutTypeChip: {
    backgroundColor: '#ff6b00',
  },
  workoutTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedWorkoutTypeText: {
    color: '#ffffff',
  },
  
  // Tips Section
  tipsSection: {
    backgroundColor: '#fff5f0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b00',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default CreatePostScreen;
