import { Server } from 'socket.io';
import { supabase } from '../config/supabaseApp.js';

let io;

export function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle joining specific chat rooms
        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        // Handle new messages
        socket.on('sendMessage', async (data) => {
            const { chatId, message, senderId } = data;
            
            try {
                // Save message to database
                const { data: savedMessage, error } = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: chatId,
                        sender_id: senderId,
                        content: message,
                        created_at: new Date()
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Broadcast message to everyone in the chat
                io.to(chatId).emit('newMessage', savedMessage);
            } catch (error) {
                socket.emit('messageError', error.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
