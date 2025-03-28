import { fireStoreDb } from "../config/db.js";
import { Timestamp } from "firebase-admin/firestore";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import admin from "firebase-admin";
import { app } from "../middlewares/FireBaseApp.js";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth(app);

const createComment = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Missing or invalid authorization header");
    return res
      .status(401)
      .json({ success: false, error: "Authorization header is required" });
  }

  const token = authHeader.split("Bearer ")[1];

  // Verify Firebase token - with detailed logging
  let decodedToken;
  try {
    console.log("Attempting to verify token...");
    decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Token verified successfully for user:", decodedToken.uid);
  } catch (verifyError) {
    console.error("Token verification failed:", verifyError);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token",
    });
  }

  const { CommentID, CommentText, GymName, Time, Rating, Tags, GymId } =
    req.body;

  // Log received rating for debugging
  console.log(`[createComment] Received rating: ${Rating}, type: ${typeof Rating}`);

  let userDoc;
  try {
    userDoc = await fireStoreDb.collection("users").doc(decodedToken.uid).get();
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(404).json({ success: false, error: "User not found" });
  }

  let userData = userDoc.data();
  let UserNamedata = userData.username;

  try {
    if (!CommentID || !CommentText || !GymName || !GymId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Enhanced tag processing to ensure valid tags
    // First check if Tags is defined and is an array
    let processedTags = [];
    if (Tags) {
      // If it's a string (single tag), convert to array
      if (typeof Tags === "string") {
        const trimmedTag = Tags.trim();
        if (trimmedTag !== "") {
          processedTags = [trimmedTag];
        }
      }
      // If it's already an array, filter out empty strings and trim values
      else if (Array.isArray(Tags)) {
        processedTags = Tags.filter(
          (tag) => tag && typeof tag === "string" && tag.trim() !== ""
        ).map((tag) => tag.trim());
      }
    }

    // Process rating - ensure it's a number
    const numericRating = Rating !== undefined && Rating !== null ? Number(Rating) : 0;
    
    // First, save the comment
    await fireStoreDb
      .collection(`${GymId}__Comment`)
      .doc(CommentID)
      .set({
        UserNamedata,
        CommentText,
        Time,
        GymId,
        Rating: numericRating, // Ensure we save as a number
        Tags: processedTags,
      });

    console.log(`[createComment] Comment saved with Rating=${numericRating}`);

    // Now update the gym tags and rating
    try {
      console.log(`[createComment] Updating gym tags and rating for gym ${GymId}`);
      const result = await updateGymTags(GymId);
      console.log(`[createComment] Gym updated successfully. Rating: ${result.rating}`);
    } catch (tagError) {
      console.error("Error updating gym tags:", tagError);
      // We'll still consider the comment creation successful even if tag update fails
      
      // But we'll send a more specific response
      return res.status(201).json({ 
        success: true, 
        message: "Review added but gym stats may not be updated. Please refresh the page."
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Review added successfully" });
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

// Get comments by GymName
const getComments = async (req, res) => {
  const { GymName } = req.query;
  console.log("Requested GymName:", GymName);

  try {
    if (!GymName) {
      return res
        .status(400)
        .json({ success: false, error: "GymName is required" });
    }

    const userDoc = await fireStoreDb.collection(`${GymName}__Comment`).get();
    if (userDoc.empty) {
      return res
        .status(404)
        .json({ success: false, error: "No comments found" });
    }

    const comments = userDoc.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      Rating: doc.data().Rating || 0,
      UserNamedata: doc.data().UserNamedata,
      Tags: doc.data().Tags || [], // Ensure Tags is included in response
    }));

    console.log("Fetched Comments with Tags:", comments); // Debugging

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getUserName = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  let decodedToken = await admin.auth().verifyIdToken(token);
  const userDoc = await fireStoreDb
    .collection("users")
    .doc(decodedToken.uid)
    .get();
  res.status(200).json({ success: true, username: userDoc.data().username });
};

const profile = async (req, res) => {
  try {
    // Extract user data from request
    const { sendingdata } = req.body;
    if (!sendingdata) {
      return res
        .status(400)
        .json({ success: false, error: "Profile data is required" });
    }

    // Validate essential fields
    if (!sendingdata.email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    // Authentication - Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return res
        .status(401)
        .json({ success: false, error: "Authorization header is required" });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token - with detailed logging
    let decodedToken;
    try {
      console.log("Attempting to verify token...");
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Token verified successfully for user:", decodedToken.uid);
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired authentication token",
      });
    }

    // Create a sanitized profile object
    try {
      console.log(sendingdata.overheadPressPR);
    } catch {
      console.log("failed");
    }
    const profileData = {
      benchPR: sendingdata.benchPR || null,
      bio: sendingdata.bio || "",
      birthdate: sendingdata.birthdate || null,
      deadliftPR: sendingdata.deadliftPR || null,
      email: sendingdata.email,
      firstName: sendingdata.firstName || "",
      fitnessGoals: sendingdata.fitnessGoals || [],
      gender: sendingdata.gender || "",
      gymExperience: sendingdata.gymExperience || "",
      lastName: sendingdata.lastName || "",
      location: sendingdata.location || "",
      mile: sendingdata.mile || null,
      overheadPressPR: sendingdata.overheadPressPR,
      preferredGymType: sendingdata.preferredGymType,
      pullUpMax: sendingdata.pullUpMax,
      squatPR: sendingdata.squatPR,
      trainingFrequency: sendingdata.trainingFrequency,
      username: sendingdata.username,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update profile in Firestore - with better error handling
    try {
      await fireStoreDb
        .collection("users")
        .doc(decodedToken.uid)
        .set(profileData, { merge: true });
      console.log("Profile updated successfully for user:", decodedToken.uid);
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update profile" });
    }
    await fireStoreDb
      .collection("publicData")
      .doc(profileData.username)
      .set(profileData, { merge: true });

    return res
      .status(200)
      .json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Unexpected error in updateUserProfile:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const userInfo = async (req, res) => {
  try {
    const { userName } = req.query;
    console.log("pinged");

    if (!userName) {
      return res
        .status(400)
        .json({ success: false, error: "Username is required" });
    }

    // Get the user document directly by username as document ID
    const userDoc = await fireStoreDb
      .collection("publicData")
      .doc(userName)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const userData = userDoc.data();

    // Create a sanitized object with only the fields you want to expose publicly
    const publicUserData = {
      benchPR: userData.benchPR,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      gender: userData.gender,
      pullUpMax: userData.pullUpMax,
      squatPR: userData.squatPR,
      overheadPressPR: userData.overheadPressPR,
      mile: userData.mile,
      deadliftPR: userData.deadliftPR,
      bio: userData.bio,
      location: userData.location,
      fitnessGoals: userData.fitnessGoals,
      gymExperience: userData.gymExperience,
      preferredGymType: userData.preferredGymType,
      trainingFrequency: userData.trainingFrequency,
    };

    // Include fitness stats if they exist
    if (userData.benchPR) publicUserData.benchPR = userData.benchPR;
    if (userData.deadliftPR) publicUserData.deadliftPR = userData.deadliftPR;
    if (userData.squatPR) publicUserData.squatPR = userData.squatPR;
    if (userData.overheadPressPR)
      publicUserData.overheadPressPR = userData.overheadPressPR;
    if (userData.pullUpMax) publicUserData.pullUpMax = userData.pullUpMax;
    if (userData.mile) publicUserData.mile = userData.mile;

    return res.status(200).json({ success: true, user: publicUserData });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * Calculates and updates popular tags for a gym based on review data
 * A tag is considered "popular" if it appears in at least 25% of reviews
 * @param {string|number} gymId - The ID of the gym
 * @returns {Promise<{tags: string[], rating: number}>} - Array of popular tags and average rating
 */
const updateGymTags = async (gymId) => {
  try {
    // Convert gymId to string to ensure it's a valid document path
    const gymIdString = String(gymId);
    console.log(`[updateGymTags] Processing gym ID: ${gymIdString}`);

    // 1. Get all comments for the gym
    const commentsSnapshot = await fireStoreDb
      .collection(`${gymId}__Comment`)
      .get();

    if (commentsSnapshot.empty) {
      console.log(`[updateGymTags] No comments found for gym ${gymIdString}`);
      // Still create/update the gym document with empty tags
      await fireStoreDb.collection("gyms").doc(gymIdString).set(
        {
          tags: [],
          rating: 0,
          ratingCount: 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return { tags: [], rating: 0 };
    }

    const comments = commentsSnapshot.docs.map((doc) => doc.data());
    const totalComments = comments.length;
    console.log(`[updateGymTags] Found ${totalComments} comments for gym ${gymIdString}`);

    // 2. Count tag occurrences
    const tagCounts = {};

    let totalRating = 0;
    let ratingCount = 0;

    comments.forEach((comment) => {
      // Process tags
      if (comment.Tags && Array.isArray(comment.Tags)) {
        // Filter out empty tags and normalize
        const validTags = comment.Tags.filter(
          (tag) => tag && typeof tag === "string" && tag.trim() !== ""
        ).map((tag) => tag.trim());

        validTags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }

      // Process rating
      if (comment.Rating !== undefined && comment.Rating !== null) {
        const numericRating = Number(comment.Rating);
        if (!isNaN(numericRating)) {
          totalRating += numericRating;
          ratingCount++;
        }
      }
    });

    console.log(`[updateGymTags] Calculated ratings: total=${totalRating}, count=${ratingCount}`);

    // Calculate average rating
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    // Round to 1 decimal place
    const roundedRating = Math.round(averageRating * 10) / 10;
    console.log(`[updateGymTags] Final average rating: ${roundedRating}`);

    // 3. Calculate which tags appear in at least 25% of comments
    const threshold = Math.max(1, Math.ceil(totalComments * 0.25)); // At least 25% of comments, minimum 1

    const popularTags = Object.keys(tagCounts)
      .filter((tag) => tag.trim() !== "") // Extra safety check for empty strings
      .filter((tag) => tagCounts[tag] >= threshold);

    console.log(`[updateGymTags] Popular tags: ${popularTags.join(', ')}`);

    // 4. Update the gym document with the popular tags and rating
    // BUT DO NOT include the rating as a tag
    try {
      console.log(`[updateGymTags] Updating gym document with rating=${roundedRating} and ${popularTags.length} tags`);
      // Use gymIdString to ensure it's a string
      const gymDocRef = fireStoreDb.collection("gyms").doc(gymIdString);
      
      // Important: We do NOT add a rating tag now
      await gymDocRef.set(
        {
          tags: [...popularTags],  // No rating tag here
          rating: roundedRating,
          ratingCount: ratingCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      
      console.log(`[updateGymTags] Successfully updated gym document`);
    } catch (writeError) {
      console.error(`[updateGymTags] Error writing to gym document:`, writeError);
      throw writeError;
    }

    return { 
      tags: [...popularTags],  // Return without the rating tag
      rating: roundedRating 
    };
  } catch (error) {
    console.error(`[updateGymTags] Error processing gym ${gymId}:`, error);
    throw error;
  }
};

const getGymData = async (req, res) => {
  try {
    // Get all gyms from the gyms collection
    const gymsSnapshot = await fireStoreDb.collection("gyms").get();

    const gyms = {};

    // Process each gym document
    if (!gymsSnapshot.empty) {
      gymsSnapshot.docs.forEach((doc) => {
        const gymData = doc.data();
        gyms[doc.id] = {
          id: doc.id,
          tags: gymData.tags || [],
          rating: gymData.rating || 0,
          ratingCount: gymData.ratingCount || 0,
          // Include other gym properties as needed
          // These would be merged with the static data from the frontend
        };
      });
    }

    return res.status(200).json({ success: true, data: gyms });
  } catch (error) {
    console.error("Error retrieving gym data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export {
  createComment,
  getAdress,
  getComments,
  profile,
  userInfo,
  getGymData,
  updateGymTags,
  getUserName,
};