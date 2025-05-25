import { supabase } from '../middlewares/supabaseApp.js'
import axios from "axios";


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



const getUserName = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Missing token' })
    const token = authHeader.split(' ')[1]

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user)
      return res.status(401).json({ error: authErr?.message || 'Invalid token' })


    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', user.id)
      .single();
    console.log(data)
      
    if (error) {
      throw error;
    }
    
    res.status(200).json({ success: true, username: data.username });
  } catch (error) {
    console.error("Error fetching username:", error);
    res.status(401).json({ success: false });
  }
};

const profile = async (req, res) => {
  try {
    console.log("Profile update request received");
    
    // Debug request body
    console.log("Request body:", JSON.stringify(req.body));
    
    const { sendingdata } = req.body;
    if (!sendingdata) {
      console.log("Missing sendingdata in request body");
      return res.status(400).json({ error: 'Missing data in request body' });
    }
    
    // Debug auth header
    console.log("Auth header present:", !!req.headers.authorization);
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("Invalid auth header format");
      return res.status(401).json({ error: 'Missing token' });
    }
    const token = authHeader.split(' ')[1];
    
    console.log("Verifying token with Supabase...");
    const authResponse = await supabase.auth.getUser(token);
    console.log("Auth response received:", !!authResponse);
    
    const { data: { user }, error: authErr } = authResponse;
    
    if (authErr) {
      console.log("Auth error:", authErr.message);
      return res.status(401).json({ error: authErr.message || 'Invalid token' });
    }
    
    if (!user) {
      console.log("No user found with provided token");
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    console.log("User authenticated successfully. User ID:", user.id);

    const profileData = {
      id: user.id,
      email: sendingdata.email,
      username: sendingdata.username,
      first_name: sendingdata.firstName || "",
      last_name: sendingdata.lastName || "",
      bio: sendingdata.bio || "",
      birthdate: sendingdata.birthdate || null,
      gender: sendingdata.gender || "",
      location: sendingdata.location || "",
      bench_pr: sendingdata.benchPR || null,
      deadlift_pr: sendingdata.deadliftPR || null,
      squat_pr: sendingdata.squatPR || null,
      overhead_press_pr: sendingdata.overheadPressPR || null,
      pull_up_max: sendingdata.pullUpMax || null,
      mile: sendingdata.mile || null,
      gym_experience: sendingdata.gymExperience || "",
      preferred_gym_type: sendingdata.preferredGymType || "",
      training_frequency: sendingdata.trainingFrequency || "",
      updated_at: new Date(),
    };

    const profileData2 = {
      username: sendingdata.username,
      first_name: sendingdata.firstName || "",
      last_name: sendingdata.lastName || "",
      bio: sendingdata.bio || "",
      gender: sendingdata.gender || "",
      location: sendingdata.location || "",
      bench_pr: sendingdata.benchPR || null,
      deadlift_pr: sendingdata.deadliftPR || null,
      squat_pr: sendingdata.squatPR || null,
      overhead_press_pr: sendingdata.overheadPressPR || null,
      pull_up_max: sendingdata.pullUpMax || null,
      mile: sendingdata.mile || null,
      gym_experience: sendingdata.gymExperience || "",
      preferred_gym_type: sendingdata.preferredGymType || "",
      training_frequency: sendingdata.trainingFrequency || "",
    };
    
    console.log("Prepared profile data. Attempting database upsert...");
    
    // 2) upsert on the PK "id"
    const dbResponse = await supabase
      .from("users")
      .upsert([profileData], { onConflict: "id" });


    const dbResponse2 = await supabase
    .from("public_profiles")
    .upsert([profileData2], { onConflict: "username" });
      
    console.log("Database response received");
    
    const { data, error: userUpdateError } = dbResponse;

    if (userUpdateError) {
      console.log("Database operation failed:", userUpdateError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to upsert profile", details: userUpdateError });
    }

    console.log("Profile update successful");
    return res
      .status(200)
      .json({ success: true, message: "Profile saved successfully", data });
  } catch (error) {
    console.error("Unexpected error in profile update:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error", details: error.message });
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

    // Get the user's public profile
    const { data: userData, error } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('username', userName)
      .single();

    if (error || !userData) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Create a sanitized object with renamed fields to match frontend expectations
    const publicUserData = {
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      gender: userData.gender,
      bio: userData.bio,
      location: userData.location,
      fitnessGoals: userData.fitness_goals,
      gymExperience: userData.gym_experience,
      preferredGymType: userData.preferred_gym_type,
      trainingFrequency: userData.training_frequency,
    };

    // Include fitness stats if they exist
    if (userData.bench_pr !== null) publicUserData.benchPR = userData.bench_pr;
    if (userData.deadlift_pr !== null) publicUserData.deadliftPR = userData.deadlift_pr;
    if (userData.squat_pr !== null) publicUserData.squatPR = userData.squat_pr;
    if (userData.overhead_press_pr !== null) publicUserData.overheadPressPR = userData.overhead_press_pr;
    if (userData.pull_up_max !== null) publicUserData.pullUpMax = userData.pull_up_max;
    if (userData.mile !== null) publicUserData.mile = userData.mile;

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
 * @param {string} gymId - The ID of the gym
 * @returns {Promise<{tags: string[], rating: number}>} - Array of popular tags and average rating
 */
const updateGymTags = async (gymId) => {
  try {
    const gymIdString = String(gymId);
    console.log(`[updateGymTags] Processing gym ID: ${gymIdString}`);

    // 1. Get all comments for the gym
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('gym_id', gymIdString);

    if (commentsError) {
      console.error(`[updateGymTags] Error fetching comments:`, commentsError);
      throw commentsError;
    }

    if (!comments || comments.length === 0) {
      console.log(`[updateGymTags] No comments found for gym ${gymIdString}`);
      // Create/update the gym document with empty tags
      const { error: updateError } = await supabase
        .from('gyms')
        .upsert({
          id: gymIdString,
          tags: [],
          rating: 0,
          rating_count: 0,
          updated_at: new Date()
        });
        
      if (updateError) {
        throw updateError;
      }
      
      return { tags: [], rating: 0 };
    }

    const totalComments = comments.length;
    console.log(`[updateGymTags] Found ${totalComments} comments for gym ${gymIdString}`);

    // 2. Count tag occurrences
    const tagCounts = {};
    let totalRating = 0;
    let ratingCount = 0;

    comments.forEach((comment) => {
      // Process tags
      if (comment.tags && Array.isArray(comment.tags)) {
        // Filter out empty tags and normalize
        const validTags = comment.tags.filter(
          (tag) => tag && typeof tag === "string" && tag.trim() !== ""
        ).map((tag) => tag.trim());

        validTags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }

      // Process rating
      if (comment.rating !== undefined && comment.rating !== null) {
        const numericRating = Number(comment.rating);
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

    // 4. Update the gym record with the popular tags and rating
    try {
      console.log(`[updateGymTags] Updating gym with rating=${roundedRating} and ${popularTags.length} tags`);
      
      const { error: updateError } = await supabase
        .from('gyms')
        .upsert({
          id: gymIdString,
          tags: popularTags,
          rating: roundedRating,
          rating_count: ratingCount,
          updated_at: new Date()
        });
        
      if (updateError) {
        console.error(`[updateGymTags] Error updating gym:`, updateError);
        throw updateError;
      }
      
      console.log(`[updateGymTags] Successfully updated gym data`);
    } catch (writeError) {
      console.error(`[updateGymTags] Error writing to gym:`, writeError);
      throw writeError;
    }

    return { 
      tags: popularTags,
      rating: roundedRating 
    };
  } catch (error) {
    console.error(`[updateGymTags] Error processing gym ${gymId}:`, error);
    throw error;
  }
};

const getGymData = async (req, res) => {
  try {
    // Get all gyms
    const { data: gyms, error } = await supabase
      .from('gyms')
      .select('*');

    if (error) {
      console.error("Error retrieving gym data:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }

    // Format the response
    const formattedGyms = {};
    if (gyms && gyms.length > 0) {
      gyms.forEach((gym) => {
        formattedGyms[gym.id] = {
          id: gym.id,
          tags: gym.tags || [],
          rating: gym.rating || 0,
          ratingCount: gym.rating_count || 0,
        };
      });
    }

    return res.status(200).json({ success: true, data: formattedGyms });
  } catch (error) {
    console.error("Error retrieving gym data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

const checkProfileOwnership = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Get the current user's username from the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    // Check if the username matches
    const isOwner = userData.username === username;
    
    res.status(200).json({ isOwner });
  } catch (error) {
    console.error("Error checking profile ownership:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export middleware and controllers
export {// New middleware for authentication
  getAdress,
  profile,
  userInfo,
  getGymData,
  updateGymTags,
  getUserName,
  checkProfileOwnership
};