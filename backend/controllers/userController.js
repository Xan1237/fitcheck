import{fireStoreDb}  from "../config/db.js";
import { Timestamp } from "firebase-admin/firestore";
import axios from "axios";
import { doc, setDoc} from "firebase/firestore";
import admin from "firebase-admin";
import { app } from '../middlewares/FireBaseApp.js'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth(app);


const createComment = async (req, res) => {

  const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return res.status(401).json({ success: false, error: 'Authorization header is required' });
    }

    const token = authHeader.split("Bearer ")[1];
    
    // Verify Firebase token - with detailed logging
    let decodedToken;
    try {
      console.log("Attempting to verify token...");
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Token verified successfully for user:", decodedToken.uid);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }

  const { CommentID, CommentText, GymName, Time, Rating, Tags, GymId } =
    req.body;

  let userDoc;
  try{
    userDoc = await fireStoreDb.collection("users").doc(decodedToken.uid).get();
  }catch{
    return res.status(404).json({success: false, error: 'user not found'})
  }

  let userData = userDoc.data();
  let UserNamedata = userData.username;
  try {
    if (!CommentID  || !CommentText || !GymName) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    // Ensure Tags is always an array
    const processedTags = Array.isArray(Tags) ? Tags : [];
    await fireStoreDb
      .collection(GymId + "__Comment")
      .doc(CommentID)
      .set({
        UserNamedata, 
        CommentText,
        Time,
        GymId,
        Rating: Rating || 0, // Default to 0 if not provided
        Tags: processedTags,
      });

    console.log("Saved Comment Successfully"); // ✅ Debugging log

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
      return res.status(400).json({ success: false, error: 'Profile data is required' });
    }

    // Validate essential fields
    if (!sendingdata.email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Authentication - Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return res.status(401).json({ success: false, error: 'Authorization header is required' });
    }

    const token = authHeader.split("Bearer ")[1];
    
    // Verify Firebase token - with detailed logging
    let decodedToken;
    try {
      console.log("Attempting to verify token...");
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Token verified successfully for user:", decodedToken.uid);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
    }

    // Create a sanitized profile object 
    try{
      console.log(sendingdata.overheadPressPR)
    }
    catch{
      console.log("failed")
    }
    const profileData = {
      benchPR: sendingdata.benchPR || null,
      bio: sendingdata.bio || '',
      birthdate: sendingdata.birthdate || null,
      deadliftPR: sendingdata.deadliftPR || null,
      email: sendingdata.email,
      firstName: sendingdata.firstName || '',
      fitnessGoals: sendingdata.fitnessGoals || [],
      gender: sendingdata.gender || '',
      gymExperience: sendingdata.gymExperience || '',
      lastName: sendingdata.lastName || '',
      location: sendingdata.location || '',
      mile: sendingdata.mile || null,
      overheadPressPR: sendingdata.overheadPressPR ,
      preferredGymType: sendingdata.preferredGymType ,
      pullUpMax: sendingdata.pullUpMax ,
      squatPR: sendingdata.squatPR ,
      trainingFrequency: sendingdata.trainingFrequency ,
      username: sendingdata.username ,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Update profile in Firestore - with better error handling
    try {
      await fireStoreDb.collection("users").doc(decodedToken.uid).set(profileData, { merge: true });
      console.log("Profile updated successfully for user:", decodedToken.uid);
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
    await fireStoreDb.collection("publicData").doc(profileData.username).set(profileData, { merge: true });

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



 const  userInfo = async (req, res) => {
  try {
    const { userName } = req.query;
    console.log("pinged");
    
    if (!userName) {
      return res.status(400).json({ success: false, error: "Username is required" });
    }
    
    // Get the user document directly by username as document ID
    const userDoc = await fireStoreDb.collection("publicData").doc(userName).get();
    
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
    if (userData.overheadPressPR) publicUserData.overheadPressPR = userData.overheadPressPR;
    if (userData.pullUpMax) publicUserData.pullUpMax = userData.pullUpMax;
    if (userData.mile) publicUserData.mile = userData.mile;
    
    return res.status(200).json({ success: true, user: publicUserData });
  } catch (error) {
    console.error('Error fetching user information:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};



export { createComment, getAdress, getComments, profile, userInfo};