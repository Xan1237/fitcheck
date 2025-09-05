import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5175';

const ChatDetailScreen = ({ route, navigation }) => {
  const { chatId, participants, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    getCurrentUser();
    
    // Set up polling for new messages (in a real app, you'd use WebSockets)
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setMessages(response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please sign in to send messages');
        return;
      }

      const messageData = {
        chatId,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      // Optimistically add message to UI
      const tempMessage = {
        ...messageData,
        id: Date.now().toString(),
        senderId: currentUser?.id,
        senderName: currentUser?.username,
        isTemp: true,
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      const response = await axios.post(`${API_BASE_URL}/api/messages`, messageData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        // Remove temp message and add real one
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      // Remove failed message
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }) => {
    const isCurrentUser = item.senderId === currentUser?.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = !previousMessage || 
      formatDate(item.timestamp) !== formatDate(previousMessage.timestamp);

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
          {!isCurrentUser && participants?.length > 2 && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
            item.isTemp && styles.tempMessage
          ]}>
            <Text style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText
            ]}>
              {item.content}
            </Text>
          </View>
          
          <Text style={[
            styles.timeText,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime
          ]}>
            {formatTime(item.timestamp)}
            {item.isTemp && ' ⏳'}
          </Text>
        </View>
      </View>
    );
  };

  // Helper to get chat partner name from chat response
  const getChatPartnerName = () => {
    if (!participants) return chatName;
    // participants is an array of chat objects, not user objects
    const chat = participants.find(c => c.chat_id === chatId);
    if (!chat) return chatName;
    // If uuid1 is "You", partner is uuid2; if uuid2 is "You", partner is uuid1
    if (chat.uuid1 && chat.uuid1.trim().toLowerCase() === "you") return chat.uuid2;
    if (chat.uuid2 && chat.uuid2.trim().toLowerCase() === "you") return chat.uuid1;
    // fallback
    return chatName;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{getChatPartnerName()}</Text>
        </View>
        
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Start the conversation!</Text>
          </View>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialIcons name="attach-file" size={24} color="#666" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <MaterialIcons 
              name="send" 
              size={24} 
              color={newMessage.trim() ? "#ff6b00" : "#ccc"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  
  // Messages
  messagesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginVertical: 2,
  },
  currentUserMessage: {
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: '#ff6b00',
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  tempMessage: {
    opacity: 0.6,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#ffffff',
  },
  otherUserText: {
    color: '#222',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 12,
  },
  currentUserTime: {
    color: '#999',
    textAlign: 'right',
  },
  otherUserTime: {
    color: '#999',
    textAlign: 'left',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  
  // Input
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f8f8',
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatDetailScreen;

