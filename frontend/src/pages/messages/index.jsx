import React, { useState } from 'react';
import { Search, MoreVertical, Send, ArrowLeft, User } from 'lucide-react';
import './styles.scss';
import Header from '../../components/header';

const mockConversations = [
  {
    id: 1,
    user: {
      name: 'John Smith',
      avatar: null,
      username: 'johnsmith',
      lastActive: 'Just now'
    },
    lastMessage: {
      text: 'Hey, want to hit the gym tomorrow?',
      timestamp: '2:30 PM',
      unread: true
    }
  },
  {
    id: 2,
    user: {
      name: 'Sarah Wilson',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      username: 'sarahw',
      lastActive: '2 hours ago'
    },
    lastMessage: {
      text: 'Great workout session today!',
      timestamp: 'Yesterday',
      unread: false
    }
  },
  // Add more mock conversations as needed
];

const mockMessages = [
  {
    id: 1,
    sender: 'them',
    text: 'Hey, want to hit the gym tomorrow?',
    timestamp: '2:30 PM'
  },
  {
    id: 2,
    sender: 'me',
    text: 'Sure! What time were you thinking?',
    timestamp: '2:31 PM'
  },
  {
    id: 3,
    sender: 'them',
    text: 'How about 9am? We can work on that new routine.',
    timestamp: '2:32 PM'
  }
];

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    // Handle sending message here
    setMessageInput('');
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

  const ChatView = ({ conversation }) => (
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
        {mockMessages.map((message) => (
          <div 
            key={message.id} 
            className={`message-bubble ${message.sender}`}
          >
            <p>{message.text}</p>
            <span className="timestamp">{message.timestamp}</span>
          </div>
        ))}
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

  return (
    <div className="messages-page">
      <Header />
      <div className="messages-container">
        <div className={`conversations-list ${mobileView === 'chat' ? 'hidden' : ''}`}>
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search messages..." />
          </div>

          {mockConversations.map((conversation) => (
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
            <ChatView conversation={activeChat} />
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
