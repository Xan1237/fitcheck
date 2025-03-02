import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import commentRouter  from './routes/userRoutes.js'; // Adjust path
// Load environment variables
dotenv.config();


const app = express();
app.use(express.json());
app.use(commentRouter);










// Start Server
const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
