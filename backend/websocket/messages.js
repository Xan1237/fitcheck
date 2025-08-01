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

    const connectedUsers = new Map();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Handle user authentication
        socket.on('authenticate', async (userId) => {
            connectedUsers.set(userId, socket.id);
            socket.userId = userId;
            socket.join(userId); // Create a personal room for private messages
            
            // Set user as online
            await supabase
                .from('users')
                .update({ online_status: true })
                .eq('id', userId);
                
            // Broadcast user's online status
            socket.broadcast.emit('userOnline', userId);
        });

        // Handle joining specific chat rooms
        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
        });

        // Handle new messages
        socket.on('sendMessage', async (data) => {
            const { chatId, message, recipientId } = data;
            
            try {
                // Save message to database
                const { data: savedMessage, error } = await supabase
                    .from('messages')
                    .insert([{
                        chat_id: chatId,
                        sender_id: socket.userId,
                        content: message,
                        created_at: new Date()
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // Emit to all users in the chat
                io.to(chatId).emit('newMessage', savedMessage);

                // Send notification to recipient if they're not in the chat
                const recipientSocketId = connectedUsers.get(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('messageNotification', {
                        chatId,
                        message: savedMessage
                    });
                }
            } catch (error) {
                socket.emit('messageError', error.message);
            }
        });

        // Handle typing indicators
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(chatId).emit('userTyping', {
                userId: socket.userId,
                isTyping
            });
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            
            if (socket.userId) {
                // Set user as offline
                await supabase
                    .from('users')
                    .update({ online_status: false })
                    .eq('id', socket.userId);
                
                // Broadcast user's offline status
                socket.broadcast.emit('userOffline', socket.userId);
                
                // Remove from connected users map
                connectedUsers.delete(socket.userId);
            }
        });
    });
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
