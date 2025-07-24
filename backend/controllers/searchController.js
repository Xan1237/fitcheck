// Import Supabase client (not used in this file, but included for consistency)
import { supabase } from '../config/supabaseApp.js'
// Import axios for making HTTP requests
import axios from "axios";
// Import dotenv to load environment variables
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Geocodes an address using the Nominatim API (OpenStreetMap).
 * Expects 'searchResults' in req.body containing the address string.
 * Returns latitude and longitude of the first matching result.
 */
const getAdress = async (req, res) => {
  // Extract address from request body
  const { searchResults } = req.body;

  try {
    // Assuming searchResults contains the address as a string
    const address = searchResults;

    // Make request to Nominatim API (OpenStreetMap's geocoding service)
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'FitCheckApp/1.0 (roughleopard548@gmail.com)' // Use your app name and a contact email
        }
      }
    );

    // Check if results are returned
    if (response.data.length > 0) {
      // Get the coordinates from the first result
      const { lat, lon } = response.data[0];
      console.log(`Coordinates: Latitude = ${lat}, Longitude = ${lon}`);

      // Send coordinates as a response
      res.json({ latitude: lat, longitude: lon });
    } else {
      // No results found for the address
      res.status(400).json({ message: "No results found for the address" });
    }
  } catch (error) {
    // Handle error during geocoding request
    console.error("Error geocoding address:", error);
    res.status(400).json({ message: "Error geocoding address" });
  }
};

// Export controller function for use in routes
export {getAdress}