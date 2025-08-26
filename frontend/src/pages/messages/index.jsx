import React, { useState, useEffect, memo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, Send, ArrowLeft, User } from 'lucide-react';
import { joinChat, sendMessage, subscribeToMessages, initializeSocket, disconnectSocket } from '../../services/websocket';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './styles.scss';
import Header from '../../components/header';

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Shared formatter used in both bubbles and list
function formatMessageTime(dateString) {
  if (!dateString) return '';
  const createdAt = new Date(dateString);
  const now = new Date();
  const diffMs = now - createdAt;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

function makeSnippet(text, maxLen = 80) {
  if (!text) return '';
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
}

const Messages = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [mobileView, setMobileView] = useState('list');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [convosHydrating, setConvosHydrating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { chatId } = useParams();
  const [userName, setUserName] = useState('');
  const [isLoadingUsername, setIsLoadingUsername] = useState(true);

  // --- Username (owner handle) ---
  const fetchUsername = async () => {
    try {
      setIsLoadingUsername(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setUserName('');
        return;
      }
      const response = await axios.post(`${VITE_API_BASE_URL}/api/getUserName`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success && response.data?.username) {
        setUserName(response.data.username);
      } else {
        setUserName('');
      }
    } catch {
      setUserName('');
    } finally {
      setIsLoadingUsername(false);
    }
  };

  useEffect(() => {
    fetchUsername();
  }, []);

  // --- Fetch chat list, then hydrate each with latest message/snippet/time ---
  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const response = await axios.get(`${VITE_API_BASE_URL}/api/getUserChats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
          // If backend conveniently provides last message metadata, pick it up; else null and hydrate.
          const formattedChats = response.data.chats.map((chat) => ({
            id: chat.chat_id,
            uuid1: chat.uuid1,
            uuid2: chat.uuid2,
            user: {
              name: chat.uuid1 === 'You' ? chat.uuid2 : chat.uuid1,
              avatar: null,
              lastActive: 'Online',
              lastMessage: chat.last_message ?? null,
              lastMessageAt: chat.last_message_at ?? null,
              unreadCount: Number(chat.unread_count ?? 0)
            }
          }));

          setConversations(formattedChats);

          // Preselect route chat if present
          if (chatId) {
            const preselect = formattedChats.find((c) => String(c.id) === String(chatId));
            if (preselect) {
              setActiveChat(preselect);
              setMobileView('chat');
            }
          }

          // Hydrate list items that still lack last message metadata
          const needsHydration = formattedChats.filter((c) => !c.user.lastMessageAt);
          if (needsHydration.length > 0) {
            hydrateConversationsWithLasts(needsHydration.map((c) => c.id));
          }
        }
      } catch (error) {
        console.error('Error fetching user chats:', error);
      }
    };

    fetchUserChats();
  }, [chatId]);

  // --- Hydrate conversations with latest message/snippet/time (without opening) ---
  const hydrateConversationsWithLasts = async (chatIds) => {
    try {
      setConvosHydrating(true);

      // Batch in parallel; if your API supports a batch endpoint, swap to that for efficiency.
      await Promise.all(
        chatIds.map(async (cid) => {
          try {
            // Prefer a tiny query; if your API supports it, pass limit:1 or lastOnly:true
            const res = await axios.post(
              `${VITE_API_BASE_URL}/api/getChatMessages`,
              { chatId: cid, limit: 1 }, // backend may ignore 'limit'; we handle fallback below
              { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (res.data?.success && Array.isArray(res.data.messages)) {
              const msgs = res.data.messages;
              const last = msgs.length > 0 ? msgs[msgs.length - 1] : null;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === cid
                    ? {
                        ...c,
                        user: {
                          ...c.user,
                          lastMessage: last ? (last.text ?? last.message ?? '') : null,
                          lastMessageAt: last ? last.created_at : null
                        }
                      }
                    : c
                )
              );
            }
          } catch (e) {
            console.warn('Failed to hydrate last message for chat', cid, e?.message);
          }
        })
      );
    } finally {
      setConvosHydrating(false);
    }
  };

  // --- Socket: realtime updates keep the list fresh immediately ---
  useEffect(() => {
    const socket = initializeSocket();

    const handleIncoming = (message) => {
      // Update message pane (optimistic replacement handled by ID/text match)
      setMessages((prev) => {
        // If optimistic, replace; otherwise append
        if (message.ownerUUID === userName) {
          return prev
            .filter((msg) => !msg.isOptimistic || msg.text !== message.text)
            .concat({
              id: message.id,
              text: message.text,
              created_at: message.created_at,
              ownerUUID: message.ownerUUID
            });
        } else {
          return prev.concat({
            id: message.id,
            text: message.text,
            created_at: message.created_at,
            ownerUUID: message.ownerUUID
          });
        }
      });

      // Keep conversation list current (works even if you never opened the chat)
      if (message.chatId) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.chatId
              ? {
                  ...c,
                  user: {
                    ...c.user,
                    lastMessage: message.text,
                    lastMessageAt: message.created_at,
                    unreadCount:
                      activeChat && activeChat.id === message.chatId
                        ? 0
                        : Math.max(0, Number(c.user.unreadCount || 0) + 1)
                  }
                }
              : c
          )
        );
      }
    };

    subscribeToMessages(handleIncoming);
    return () => disconnectSocket();
  }, [userName, activeChat]);

  // --- Load messages when a chat becomes active ---
  useEffect(() => {
    if (activeChat) {
      joinChat(activeChat.id);
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  // --- If URL has chatId but no activeChat yet (direct link), join & load ---
  useEffect(() => {
    if (chatId && !activeChat) {
      joinChat(chatId);
      loadMessages(chatId);
    }
  }, [chatId, activeChat]);

  const loadMessages = async (selectedChatId) => {
    try {
      setLoadingMessages(true);
      setMessages([]); // Clear old conversation content immediately

      const response = await axios.post(
        `${VITE_API_BASE_URL}/api/getChatMessages`,
        { chatId: selectedChatId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.success) {
        const formattedMessages = response.data.messages.map((msg) => ({
          id: msg.uuid ?? msg.id,
          text: msg.text ?? msg.message,
          created_at: msg.created_at,
          ownerUUID: msg.ownerUsername ?? msg.ownerUUID
        }));

        setMessages(formattedMessages);

        // Update conversation snippet/time
        const last = formattedMessages[formattedMessages.length - 1] || null;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedChatId
              ? {
                  ...c,
                  user: {
                    ...c.user,
                    lastMessage: last ? last.text : c.user.lastMessage,
                    lastMessageAt: last ? last.created_at : c.user.lastMessageAt
                  }
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
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

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ChatView = memo(function ChatView({ conversation, messages }) {
    const [messageInput, setMessageInput] = useState('');
    const [typingIndicator, setTypingIndicator] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages, loadingMessages]);

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!messageInput.trim()) return;

      const newMessage = {
        id: `temp-${Date.now()}`,
        text: messageInput,
        created_at: new Date().toISOString(),
        ownerUUID: userName,
        isOptimistic: true
      };

      // Optimistic add
      setMessages((prev) => [...prev, newMessage]);

      try {
        sendMessage(conversation.id, messageInput);
        setMessageInput('');

        // Update list immediately
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversation.id
              ? {
                  ...c,
                  user: {
                    ...c.user,
                    lastMessage: newMessage.text,
                    lastMessageAt: newMessage.created_at
                  }
                }
              : c
          )
        );

        // Fake typing indicator
        setTypingIndicator(true);
        setTimeout(() => setTypingIndicator(false), 2000);
      } catch (error) {
        setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    };

    return (
      <div className="chat-view">
        <div className="chat-header">
          <button className="back-button" onClick={() => setMobileView('list')}>
            <ArrowLeft size={24} />
          </button>
          <div className="chat-user-info">
            {renderAvatar(conversation.user)}
            <div className="user-details">
              <h2>
                <Link to={`/profile/${conversation.user.name}`}>{conversation.user.name}</Link>
              </h2>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {loadingMessages ? (
            <div className="loading-messages" />
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || `${message.created_at}-${index}`}
                className={`message-bubble ${message.ownerUUID === userName ? 'me' : 'them'}`}
              >
                <div className="sender-row">
                  {message.ownerUUID === userName ? (
                    <span className="sender-name">You</span>
                  ) : (
                    <span className="sender-name">
                      <Link to={`/profile/${message.ownerUUID}`}>{message.ownerUUID}</Link>
                    </span>
                  )}
                  <span className="timestamp">{formatMessageTime(message.created_at)}</span>
                </div>
                <p>{message.text}</p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button type="submit" disabled={!messageInput.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    );
  });

  ChatView.displayName = 'ChatView';

  ChatView.propTypes = {
    conversation: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        lastActive: PropTypes.string,
        lastMessage: PropTypes.string,
        lastMessageAt: PropTypes.string,
        unreadCount: PropTypes.number
      }).isRequired
    }).isRequired,
    messages: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        text: PropTypes.string,
        created_at: PropTypes.string,
        ownerUUID: PropTypes.string,
        isOptimistic: PropTypes.bool
      })
    ).isRequired
  };

  return (
    <div className="messages-container">
      <div className={`conversations-list ${mobileView === 'chat' ? 'hidden' : ''}`}>
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-header">
          <h3>Messages</h3>
          <span className="conversation-count">{filteredConversations.length} conversations</span>
        </div>

        {filteredConversations.length === 0 ? (
          <div className="no-conversations">
            <div className="no-conversations-icon">💬</div>
            <p>No conversations found</p>
            <span>Try adjusting your search</span>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const hasAnyMessage = Boolean(conversation.user.lastMessageAt);
            const subtitle = hasAnyMessage
              ? makeSnippet(conversation.user.lastMessage)
              : 'Start a conversation!';
            const ts = hasAnyMessage ? formatMessageTime(conversation.user.lastMessageAt) : '';

            return (
              <div
                key={conversation.id}
                className={`conversation-item ${activeChat?.id === conversation.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveChat(conversation);
                  setMobileView('chat');
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === conversation.id ? { ...c, user: { ...c.user, unreadCount: 0 } } : c
                    )
                  );
                }}
              >
                {renderAvatar(conversation.user)}
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h3>{conversation.user.name}</h3>
                    <span className="timestamp">{ts}</span>
                  </div>
                  <p className="last-message">{subtitle}</p>
                </div>
                {conversation.user.unreadCount > 0 && (
                  <div className="unread-badge">{conversation.user.unreadCount}</div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className={`chat-container ${mobileView === 'list' ? 'hidden' : ''}`}>
        {activeChat ? (
          <ChatView conversation={activeChat} messages={messages} />
        ) : (
          <div className="no-chat-selected" />
        )}
      </div>
    </div>
  );
};

export default Messages;
