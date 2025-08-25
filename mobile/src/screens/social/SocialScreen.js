import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';

const SocialScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please sign in to follow users');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/follow`, 
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setUsers(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        ));
      }
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Failed to follow user');
    }
  };

  const handleUserPress = (user) => {
    navigation.navigate('UserProfile', { userId: user.id, user });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item)}
    >
      <Image
        source={{ uri: item.avatar || 'https://via.placeholder.com/60' }}
        style={styles.userAvatar}
      />
      
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.displayName}>{item.displayName || item.email}</Text>
        <Text style={styles.userStats}>
          {item.followers || 0} followers · {item.posts || 0} posts
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.followButton,
          item.isFollowing && styles.followingButton
        ]}
        onPress={() => handleFollow(item.id)}
      >
        <Text style={[
          styles.followButtonText,
          item.isFollowing && styles.followingButtonText
        ]}>
          {item.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Users Found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or check back later
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover People</Text>
        <TouchableOpacity>
          <MaterialIcons name="filter-list" size={24} color="#ff6b00" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b00']}
            tintColor="#ff6b00"
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
        style={styles.usersList}
      />
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
  
  // Search
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#222',
  },
  
  // Users List
  usersList: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 12,
    color: '#999',
  },
  followButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  followingButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ff6b00',
  },
  followButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#ff6b00',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default SocialScreen;
