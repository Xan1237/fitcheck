import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  try {
    if (!socket) {
      const token = localStorage.getItem('token');
      
      socket = io(import.meta.env.VITE_API_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
        auth: {
          token: token
        }
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        if (error.message.includes('Authentication')) {
          disconnectSocket();
          window.location.href = '/login';
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
        if (reason === 'io server disconnect') {
          socket.connect();
        }
      });
    }
  } catch (error) {
    console.error('Socket initialization error:', error);
  }
  return socket;
};

export const joinChat = (chatId) => {
  if (socket) {
    socket.emit('joinChat', chatId);
  }
};

export const sendMessage = (chatId, message) => {
  if (socket) {
    console.log('Sending message:', message, 'to chat:', chatId);
    const senderId = localStorage.getItem('userId');
    socket.emit('sendMessage', { 
      chatId, 
      message, 
      senderId 
    });
  }
};

export const subscribeToMessages = (callback) => {
  if (socket) {
    console.log('Subscribing to new messages');
    socket.on('newMessage', (message) => {
      console.log('New message received:', message);
      const formattedMessage = {
        id: message.uuid,
        text: message.text,
        created_at: message.created_at,
        ownerUUID: message.sender_uuid
      };
      callback(formattedMessage);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.close();
    socket = null;
  }
};
