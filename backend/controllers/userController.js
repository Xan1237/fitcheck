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

  let userDoc;
  try {
    userDoc = await fireStoreDb.collection("users").doc(decodedToken.uid).get();
  } catch {
    return res.status(404).json({ success: false, error: "user not found" });
  }

  let userData = userDoc.data();
  let UserNamedata = userData.username;

  try {
    if (!CommentID || !CommentText || !GymName) {
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

    console.log("TAGS_DEBUG: Processed tags for new comment:", processedTags);

    // First, save the comment
    await fireStoreDb
      .collection(GymId + "__Comment")
      .doc(CommentID)
      .set({
        UserNamedata,
        CommentText,
        Time,
        GymId,
        Rating: Rating || 0,
        Tags: processedTags,
      });

    console.log("TAGS_DEBUG: Comment saved successfully to Firestore");

    // Now update the gym tags in a separate try/catch to ensure we can handle failures
    try {
      console.log(`TAGS_DEBUG: Starting gym tag update for gym ${GymId}`);
      const updatedTags = await updateGymTags(GymId);
      console.log(
        `TAGS_DEBUG: Gym tag update completed. Updated tags:`,
        updatedTags
      );
    } catch (tagError) {
      console.error("TAGS_DEBUG: Error updating gym tags:", tagError);
      // We'll still consider the comment creation successful even if tag update fails
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
 * @returns {Promise<string[]>} - Array of popular tags
 */
const updateGymTags = async (gymId) => {
  try {
    // Convert gymId to string to ensure it's a valid document path
    const gymIdString = String(gymId);
    
    console.log(`TAGS_DEBUG: Starting tag update for gym ${gymIdString}`);

    // 1. Get all comments for the gym
    const commentsSnapshot = await fireStoreDb
      .collection(`${gymId}__Comment`)
      .get();

    if (commentsSnapshot.empty) {
      console.log(`TAGS_DEBUG: No comments found for gym ${gymIdString}`);
      
      // Still create/update the gym document with empty tags
      console.log(`TAGS_DEBUG: Creating gym document with empty tags`);
      await fireStoreDb.collection("gyms").doc(gymIdString).set(
        {
          tags: [],
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return [];
    }

    const comments = commentsSnapshot.docs.map((doc) => doc.data());
    const totalComments = comments.length;

    console.log(`TAGS_DEBUG: Found ${totalComments} comments for gym ${gymIdString}`);

    // 2. Count tag occurrences
    const tagCounts = {};

    comments.forEach((comment) => {
      if (comment.Tags && Array.isArray(comment.Tags)) {
        // Filter out empty tags and normalize
        const validTags = comment.Tags.filter((tag) => tag && tag.trim() !== "")
          .map((tag) => tag.trim());

        validTags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    console.log("TAGS_DEBUG: Tag counts for gym", gymIdString, ":", tagCounts);

    // 3. Calculate which tags appear in at least 25% of comments
    const threshold = Math.max(1, Math.ceil(totalComments * 0.25)); // At least 25% of comments, minimum 1
    console.log(
      `TAGS_DEBUG: Threshold for popular tags: ${threshold} comments (25% of ${totalComments})`
    );

    const popularTags = Object.keys(tagCounts)
      .filter((tag) => tag.trim() !== "") // Extra safety check for empty strings
      .filter((tag) => tagCounts[tag] >= threshold);

    console.log(`TAGS_DEBUG: Popular tags for gym ${gymIdString}:`, popularTags);

    // 4. Update the gym document with the popular tags
    console.log(`TAGS_DEBUG: Attempting to write to gyms/${gymIdString}`);
    
    try {
      // Use gymIdString to ensure it's a string
      const gymDocRef = fireStoreDb.collection("gyms").doc(gymIdString);
      await gymDocRef.set(
        {
          tags: popularTags,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      
      console.log(`TAGS_DEBUG: Successfully updated tags for gym ${gymIdString}`);
      
      // Verify the update was successful by reading back the document
      const verifyDoc = await gymDocRef.get();
      if (verifyDoc.exists) {
        console.log(`TAGS_DEBUG: Verified gym document data:`, verifyDoc.data());
      } else {
        console.error(`TAGS_DEBUG: Gym document still doesn't exist after update!`);
      }
    } catch (writeError) {
      console.error(`TAGS_DEBUG: Error writing to gym document:`, writeError);
      throw writeError; // Re-throw to be caught by the main try/catch
    }

    return popularTags;
  } catch (error) {
    console.error(`TAGS_DEBUG: Error in updateGymTags for gym ${gymId}:`, error);
    throw error; // Rethrow to allow handling by the calling function
  }
};

// Make sure to also include this function
const getGymData = async (req, res) => {
  try {
    console.log("TAGS_DEBUG: Getting gym data from database");
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
          // Include other gym properties as needed
          // These would be merged with the static data from the frontend
        };
      });

      console.log("TAGS_DEBUG: Retrieved gym data with tags:", gyms);
    } else {
      console.log("TAGS_DEBUG: No gym documents found in the database");
    }

    return res.status(200).json({ success: true, data: gyms });
  } catch (error) {
    console.error("TAGS_DEBUG: Error retrieving gym data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const recalculateAllGymTags = async (req, res) => {
  try {
    // Authentication check (assuming admin-only access)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authorization header is required" });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired authentication token",
      });
    }

    // Alternative: Get gym IDs from existing comment collections
    const collections = await fireStoreDb.listCollections();
    const commentCollections = collections
      .filter((collection) => collection.id.includes("__Comment"))
      .map((collection) => collection.id.split("__Comment")[0]);

    const uniqueGymIds = [...new Set(commentCollections)];

    console.log("Found gym IDs from comment collections:", uniqueGymIds);

    // Update tags for each gym
    const results = [];
    for (const gymId of uniqueGymIds) {
      try {
        const tags = await updateGymTags(gymId);
        results.push({ gymId, tags, success: true });
      } catch (error) {
        console.error(`Error updating tags for gym ${gymId}:`, error);
        results.push({ gymId, error: error.message, success: false });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Tags recalculated for ${uniqueGymIds.length} gyms`,
      results,
    });
  } catch (error) {
    console.error("Error recalculating gym tags:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// Also include this debugging function
const debugAndFixGymTags = async (req, res) => {
  try {
    const { gymId } = req.params;

    if (!gymId) {
      return res.status(400).json({
        success: false,
        error: "Gym ID is required as a path parameter",
      });
    }

    console.log(`TAGS_DEBUG: Manual tag fix requested for gym ${gymId}`);

    // Check if the gym document exists first
    const gymDoc = await fireStoreDb.collection("gyms").doc(gymId).get();
    console.log(`TAGS_DEBUG: Gym document exists: ${gymDoc.exists}`);

    if (gymDoc.exists) {
      console.log(`TAGS_DEBUG: Current gym data:`, gymDoc.data());
    }

    // Execute the tag update
    const updatedTags = await updateGymTags(gymId);

    // Verify the update was applied
    const verifyDoc = await fireStoreDb.collection("gyms").doc(gymId).get();
    let verifiedData = verifyDoc.exists ? verifyDoc.data() : null;

    return res.status(200).json({
      success: true,
      gymId,
      message: "Tags updated successfully",
      tags: updatedTags || [],
      verificationData: verifiedData,
    });
  } catch (error) {
    console.error(`TAGS_DEBUG: Error debugging gym tags:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

// Make sure to add this to your exports at the bottom
export {
  createComment,
  getAdress,
  getComments,
  profile,
  userInfo,
  getGymData,
  recalculateAllGymTags,
  updateGymTags,
  debugAndFixGymTags, // Added the export for the missing function
};
