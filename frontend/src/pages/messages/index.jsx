import React, { useState, useEffect, memo, useRef } from 'react';
import { Search, MoreVertical, Send, ArrowLeft, User } from 'lucide-react';
import { joinChat, sendMessage, subscribeToMessages, initializeSocket, disconnectSocket } from '../../services/websocket';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles.scss';
import Header from '../../components/header';
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [mobileView, setMobileView] = useState('list');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const { chatId } = useParams();
  const [userName, setUserName] = useState("");

    const fetchUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${VITE_API_BASE_URL}/api/getUserName`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success && response.data?.username) {
        setUserName(response.data.username);
        console.log(userName);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  useEffect(() => {
    if (chatId) {
      // Join the chat room
      joinChat(chatId);
      
      // Load existing messages
      loadMessages();
      
      // Subscribe to new messages
      subscribeToMessages((message) => {
        setMessages(prev => {
          // Check if this message is from the current user and replace optimistic message
          if (message.ownerUUID === userName) {
            // Remove optimistic message and add the real one
            return prev.filter(msg => !msg.isOptimistic || msg.text !== message.text).concat({
              id: message.id,
              text: message.text,
              created_at: message.created_at,
              ownerUUID: message.ownerUUID
            });
          } else {
            // For messages from other users, just add them
            return [...prev, {
              id: message.id,
              text: message.text,
              created_at: message.created_at,
              ownerUUID: message.ownerUUID
            }];
          }
        });
      });
    }
  }, [chatId, userName]);

  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getUserChats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          console.log('Raw chats data:', response.data.chats); // Debug log
          const formattedChats = response.data.chats.map((chat) => {
            console.log('Processing chat:', chat); // Debug log
            return {
              id: chat.chat_id,
              uuid1: chat.uuid1,
              uuid2: chat.uuid2,
              user: {
                name: `User ${chat.uuid2.slice(0, 8)}`,
                avatar: null,
                lastActive: 'Online'
              }
            };
          });
          console.log('Formatted chats:', formattedChats); // Debug log
          setConversations(formattedChats);
        }
      } catch (error) {
        console.error('Error fetching user chats:', error);
      }
    };

    fetchUserChats();
  }, []);

  useEffect(() => {
    subscribeToMessages((message) => {
      console.log('New message received:', message);
      setMessages(prev => {
        // Check if this message is from the current user and replace optimistic message
        if (message.ownerUUID === userName) {
          // Remove optimistic message and add the real one
          return prev.filter(msg => !msg.isOptimistic || msg.text !== message.text).concat({
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            ownerUUID: message.ownerUUID
          });
        } else {
          // For messages from other users, just add them
          return [...prev, {
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            ownerUUID: message.ownerUUID
          }];
        }
      });
    });
  }, [userName]);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
      joinChat(activeChat.id); // Join the chat room when active chat changes
    }
  }, [activeChat]);

  // Initialize socket connection once when component mounts
  useEffect(() => {
    const socket = initializeSocket();
    
    // Set up message subscription
    subscribeToMessages((message) => {
      console.log('New message received:', message);
      setMessages(prev => {
        // Check if this message is from the current user and replace optimistic message
        if (message.ownerUUID === userName) {
          // Remove optimistic message and add the real one
          return prev.filter(msg => !msg.isOptimistic || msg.text !== message.text).concat({
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            ownerUUID: message.ownerUUID
          });
        } else {
          // For messages from other users, just add them
          return [...prev, {
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            ownerUUID: message.ownerUUID
          }];
        }
      });
    });

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [userName]);

  const loadMessages = async (selectedChatId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/getChatMessages`,
        { chatId: selectedChatId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.uuid,
          text: msg.text,
          created_at: msg.created_at,
          ownerUUID: msg.ownerUsername
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const renderAvatar = (user) => {
    if (user.avatar) {
      return <img src={user.avatar} alt={user.name} className="avatar-img" />;
    }
    return (
      <div className="avatar-placeholder">
        <User size={24} />
      </div>
    );
  };

  const ChatView = memo(({ conversation, messages }) => {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); // Remove smooth animation, go directly to bottom
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!messageInput.trim()) return;

      const newMessage = {
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        text: messageInput,
        created_at: new Date().toISOString(),
        ownerUUID: userName,
        isOptimistic: true // Flag to identify optimistic messages
      };

      // Optimistically add message to UI
      setMessages(prev => [...prev, newMessage]);
      
      try {
        sendMessage(conversation.id, messageInput);
        setMessageInput('');
      } catch (error) {
        // Remove optimistic message if failed
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    };

    return (
      <div className="chat-view">
        <div className="chat-header">
          <button 
            className="back-button"
            onClick={() => setMobileView('list')}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="chat-user-info">
            {renderAvatar(conversation.user)}
            <div className="user-details">
              <h2>{conversation.user.name}</h2>
              <span className="last-active">{conversation.user.lastActive}</span>
            </div>
          </div>
          <button className="more-options">
            <MoreVertical size={24} />
          </button>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={message.id || `${message.created_at}-${index}`}
              className={`message-bubble ${message.ownerUUID == userName ? 'me' : 'them'}`}
            >
              <p>{message.text || message.message}</p>
              {message.ownerUUID !== userName && (
                <span className="sender-name">{message.ownerUUID}</span>
              )}
              <span className="timestamp">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button type="submit">
            <Send size={24} />
          </button>
        </form>
      </div>
    );
  });

  return (
    <div className="messages-page">
      <Header />
      <div className="messages-container">
        <div className={`conversations-list ${mobileView === 'chat' ? 'hidden' : ''}`}>
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search messages..." />
          </div>

          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${activeChat?.id === conversation.id ? 'active' : ''}`}
              onClick={() => {
                setActiveChat(conversation);
                setMobileView('chat');
              }}
            >
              {renderAvatar(conversation.user)}
              <div className="conversation-content">
                <div className="conversation-header">
                  <h3>{conversation.user.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`chat-container ${mobileView === 'list' ? 'hidden' : ''}`}>
          {activeChat ? (
            <ChatView 
              conversation={activeChat} 
              messages={messages}
            />
          ) : (
            <div className="no-chat-selected">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};











export default Messages;


