import { Server } from 'socket.io';
import { supabase } from '../config/supabaseApp.js';

let io;

export function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:5173"],
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        // Handle joining specific chat rooms
        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        // Handle new messages
        socket.on('sendMessage', async ({ chatId, message, senderId }) => {
            try {
                // Save message to database
                const { data: savedMessage, error } = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: chatId,
                        text: message,
                        ownerUUID: senderId,
                        created_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Broadcast message to everyone in the chat
                io.to(chatId).emit('newMessage', savedMessage);
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('messageError', error.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    io.engine.on("connection_error", (err) => {
        console.log('Connection error:', err);
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
