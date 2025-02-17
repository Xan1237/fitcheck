import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
// Load environment variables
dotenv.config();





// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json()); // Parse incoming JSON requests

// POST /api/search route to handle the search query
app.post('/api/search', (req, res) => {
  const { q } = req.body;  // Extract search query from request body
  console.log(`Searching for: ${q}`);

  // Your mock logic (e.g., return a mock response)
  res.json({ message: `Search results for "${q}"` });  // Only send this response
});

// POST /api/adress route to handle address-related requests
app.post('/api/address', async (req, res) => {
  console.log("JJJJJ");
  const { searchResults } = req.body;

  try {
    // Assuming searchResults contains the address as a string
    const address = searchResults;
    
    // Make request to Nominatim API (OpenStreetMap's geocoding service)
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        addressdetails: 1
      }
    });

    // Check if results are returned
    if (response.data.length > 0) {
      // Get the coordinates from the first result
      const { lat, lon } = response.data[0];
      console.log(`Coordinates: Latitude = ${lat}, Longitude = ${lon}`);
      
      // Send coordinates as a response
      res.json({ latitude: lat, longitude: lon });
    } else {
      res.status(400).json({ message: 'No results found for the address' });
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    res.status(400).json({ message: 'Error geocoding address' });
  }
});

// Start Server
const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
