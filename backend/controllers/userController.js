import { fireStoreDb } from "../config/db.js";
import { Timestamp } from "firebase-admin/firestore";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";

const createComment = async (req, res) => {
  const { CommentID, UserName, CommentText, GymName, Time, Rating, Tags } = req.body;

  try {
    if (!CommentID || !UserName || !CommentText || !GymName) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    await fireStoreDb
      .collection(GymName + "_Comment")
      .doc(CommentID)
      .set({
        UserName,
        CommentText,
        Time,
        Rating: Rating || 0,
        Tags: Tags || [],
      });

    return res.status(201).json({ success: true, message: "Review added successfully" });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred",
    });
  }
};

// POST /api/adress route to handle address-related requests
const getAdress = async (req, res) => {
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
      res.status(400).json({ message: "No results found for the address" });
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    res.status(400).json({ message: "Error geocoding address" });
  }
};

// // Get user by ID
const getComments = async (req, res) => {
  const { GymName } = req.query;
  console.log("Requested GymName:", GymName);

  try {
    if (!GymName) {
      return res
        .status(400)
        .json({ success: false, error: "GymName is required" });
    }

    const userDoc = await fireStoreDb.collection(`${GymName}_Comment`).get();
    if (userDoc.empty) {
      return res
        .status(404)
        .json({ success: false, error: "No comments found" });
    }

    const comments = userDoc.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      Rating: doc.data().Rating || 0,
      Tags: doc.data().Tags || [],
    }));

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const profile = async (req, res) => {
  const { sendingdata } = req.body;

  try {
    console.log(
      sendingdata.email,
      sendingdata.username,
      sendingdata.firstName,
      sendingdata.gender
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error geocoding address:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export { createComment, getAdress, getComments, profile };
