import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import commentRouter  from './routes/userRoutes.js'; // Adjust path
// Load environment variables
dotenv.config();


const app = express();



app.use(commentRouter);




// POST /api/search route to handle the search query
app.post('/api/search', (req, res) => {
  const { q } = req.body;  // Extract search query from request body
  console.log(`Searching for: ${q}`);

  // Your mock logic (e.g., return a mock response)
  res.json({ message: `Search results for "${q}"` });  // Only send this response
});









// Start Server
const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
