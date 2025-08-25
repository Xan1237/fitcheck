import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/getPosts');
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const renderPost = (post) => (
    <View key={post.id || post.PostID} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ 
              uri: post.userAvatar || 'https://via.placeholder.com/40' 
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>{post.Username || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>
              {new Date(post.Time || post.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{post.PostText || post.content}</Text>

      {post.ImageURL && (
        <Image source={{ uri: post.ImageURL }} style={styles.postImage} />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{post.Likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{post.Comments || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FitCheck</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.username}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Ready for your fitness journey today?
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('FindGyms')}
          >
            <Ionicons name="location" size={32} color="#007AFF" />
            <Text style={styles.quickActionText}>Find Gyms</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add-circle" size={32} color="#FF9500" />
            <Text style={styles.quickActionText}>Share Post</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Ionicons name="people" size={32} color="#34C759" />
            <Text style={styles.quickActionText}>Connect</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedSection}>
          <Text style={styles.sectionTitle}>Your Feed</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading your feed...</Text>
            </View>
          ) : posts.length > 0 ? (
            posts.map(renderPost)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No posts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Follow some users to see their posts here
              </Text>
            </View>
          )}
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  quickActionCard: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  feedSection: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  postCard: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
