import React, { useState, useEffect, memo, useRef } from 'react';
import { Search, MoreVertical, Send, ArrowLeft, User } from 'lucide-react';
import { joinChat, sendMessage, subscribeToMessages } from '../../services/websocket';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './styles.scss';
import Header from '../../components/header';

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [mobileView, setMobileView] = useState('list');
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const { chatId } = useParams();

  useEffect(() => {
    if (chatId) {
      // Join the chat room
      joinChat(chatId);
      
      // Load existing messages
      loadMessages();
      
      // Subscribe to new messages
      subscribeToMessages((message) => {
        setMessages(prev => [...prev, message]);
      });
    }
  }, [chatId]);

  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/getUserChats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success) {
          const chats = response.data.chats;
          // Transform the chat data into the format your component expects
          const formattedChats = await Promise.all(chats.map(async (chat) => {
            // Get the other user's ID (not the current user)
            const otherUserId = chat.uuid1 === localStorage.getItem('userId') ? chat.uuid2 : chat.uuid1;
            
            // Fetch other user's details if needed
            // You might need to create a new endpoint for this
            return {
              id: chat.id,
              user: {
                name: otherUserId, // You might want to fetch the actual name
                avatar: null,
                username: otherUserId,
                lastActive: 'Online' // You might want to track this
              },
              lastMessage: {
                text: 'Click to view messages',
                timestamp: new Date(chat.created_at).toLocaleString(),
                unread: false
              }
            };
          }));
          
          setConversations(formattedChats);
        }
      } catch (error) {
        console.error('Error fetching user chats:', error);
      }
    };

    fetchUserChats();
  }, []);

  const loadMessages = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/getChatMessages`, {
        chatId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setMessages(response.data.messages);
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
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!messageInput.trim()) return;

      const userId = localStorage.getItem('userId');
      
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/newMessage`,
          {
            chatId: conversation.id,
            message: messageInput,
            ownerUUID: userId
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          // Send via WebSocket
          sendMessage({
            chatId: conversation.id,
            text: messageInput,
            ownerUUID: userId,
            created_at: new Date().toISOString()
          });
          
          // Update local messages state
          setMessages(prev => [...prev, {
            chat_id: conversation.id,
            text: messageInput,
            ownerUUID: userId,
            created_at: new Date().toISOString()
          }]);
          
          setMessageInput('');
        }
      } catch (error) {
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
              className={`message-bubble ${message.ownerUUID === localStorage.getItem('userId') ? 'me' : 'them'}`}
            >
              <p>{message.text || message.message}</p>
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
                  <span className="timestamp">{conversation.lastMessage.timestamp}</span>
                </div>
                <p className="last-message">{conversation.lastMessage.text}</p>
              </div>
              {conversation.lastMessage.unread && <div className="unread-indicator" />}
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

