import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }
  return socket;
};

export const joinChat = (chatId) => {
  if (socket) {
    socket.emit('joinChat', chatId);
  }
};

export const sendMessage = (chatId, message, senderId) => {
  if (socket) {
    socket.emit('sendMessage', { chatId, message, senderId });
  }
};

export const subscribeToMessages = (callback) => {
  if (socket) {
    socket.on('newMessage', (message) => {
      callback(message);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
