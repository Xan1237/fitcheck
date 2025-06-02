import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import commentRouter  from './routes/userRoutes.js'; // Adjust path
// Load environment variables
dotenv.config();

const app = express();

// Increase payload size limit for file uploads (set to 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(commentRouter);

// Start Server
const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
