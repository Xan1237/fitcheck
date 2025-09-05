import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';

const MessagesScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat =>
        chat.participants.some(participant =>
          participant.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setChats(response.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get chat partner name from chat object
  const getChatName = (chat) => {
    if (chat.uuid1 && chat.uuid1.trim().toLowerCase() === "you") return chat.uuid2;
    if (chat.uuid2 && chat.uuid2.trim().toLowerCase() === "you") return chat.uuid1;
    return 'Unknown Chat';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const handleChatPress = (chat) => {
    navigation.navigate('ChatDetail', { 
      chatId: chat.chat_id, 
      participants: [chat], // pass as array for detail screen logic
      chatName: getChatName(chat)
    });
  };

  const renderChatItem = ({ item }) => {
    const chatName = getChatName(item);
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.groupAvatar}>
            <MaterialIcons name="person" size={24} color="#666" />
          </View>
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{chatName}</Text>
            {/* No timestamp in this format */}
          </View>

          <View style={styles.messagePreview}>
            <Text style={styles.lastMessage}>No messages yet</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="chat-bubble-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with someone from your network
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <MaterialIcons name="edit" size={24} color="#ff6b00" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
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

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderChatItem}
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
        style={styles.chatList}
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
  newChatButton: {
    padding: 8,
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
  
  // Chat List
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadChat: {
    backgroundColor: '#fff8f5',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
    color: '#222',
  },
  unreadBadge: {
    backgroundColor: '#ff6b00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
export default MessagesScreen;
