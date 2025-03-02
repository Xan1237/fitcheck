import{ db }  from "../config/db.js";
import { Timestamp } from "firebase-admin/firestore";
import axios from "axios";
// Create a new user
const createComment = async (req, res) => {
  console.log(req.body)
  const { CommentID, UserName, CommentText } = req.body;
  try {
    await db.collection("CommentID").doc(CommentID).set({
        UserName,
        CommentText,
        createdAt: Timestamp.now(),
    });
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// POST /api/adress route to handle address-related requests
const getAdress =  async (req, res) => {
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
};

// // Get user by ID
// const getUserById = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const userDoc = await db.collection("users").doc(userId).get();
//     if (!userDoc.exists) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }
//     res.status(200).json({ success: true, data: userDoc.data() });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Update user
// const updateUser = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     await db.collection("users").doc(userId).update(req.body);
//     res.status(200).json({ success: true, message: "User updated" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// // Delete user
// const deleteUser = async (req, res) => {
//   const { userId } = req.params;
//   try {
//     await db.collection("users").doc(userId).delete();
//     res.status(200).json({ success: true, message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

export { createComment, getAdress};
