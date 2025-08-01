import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import commentRouter  from './routes/userRoutes.js'; // Adjust path
import profileRouter from './routes/profileRoutes.js';
import postRouter from './routes/postRoutes.js'; // Adjust path
import gymRouter from './routes/gymRoutes.js';
import messageRoutes from './routes/messageRoutes.js'; // Adjust path
import { initializeStorage } from './config/supabaseStorage.js';
import { createServer } from 'http';
import { initializeSocket } from './websocket/messages.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize storage bucket and policies
initializeStorage().catch(console.error);

// Initialize socket
initializeSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(commentRouter);
app.use(profileRouter);
app.use(postRouter); // Ensure this is after profileRouter if it depends on user data
app.use(gymRouter);
app.use(messageRoutes);


// Start Server
const PORT = process.env.PORT || 5175;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
