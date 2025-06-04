import { supabase } from '../config/supabaseApp.js'
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

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
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const token = authHeader.split(' ')[1];

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: authErr?.message || 'Invalid token' });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', user.id)
      .single();

    console.log('Database query result:', data);
    console.log('Database query error:', error);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    if (!data) {
      console.log('No user data found, creating default profile');
      // Create a default profile if missing
      const defaultUsername = user.email.split('@')[0];
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          username: defaultUsername,
          updated_at: new Date()
        });
        
      if (upsertError) {
        console.error('Error creating default profile:', upsertError);
        return res.status(500).json({ success: false, error: upsertError.message });
      }
      
      return res.status(200).json({ 
        success: true, 
        username: defaultUsername 
      });
    }
    
    // Add extra safety check
    if (data.username) {
      console.log('Returning username:', data.username);
      return res.status(200).json({ success: true, username: data.username });
    } else {
      console.log('Data exists but no username found:', data);
      return res.status(500).json({ success: false, error: "Username not found in user data" });
    }
    
  } catch (error) {
    console.error("Error fetching username:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
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

    const { data: prData, error: prError } = await supabase
      .from('pr')
      .select('exercise_name, weight, reps')
      .eq('username', userName);

    // Get user's posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('username', userName)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError);
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
      profilePictureUrl: userData.profile_picture_url,
      pr: prData,
      posts: postsData || [] // Add posts to the response
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
          rating: gym.avg_rating || 0,
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

const addPersonalRecord = async (req, res) => {
  const { newPR } = req.body;
  // req.user comes directly from verifyAuth middleware
  console.log("newPR:", newPR);
  console.log("req.user:", req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false, 
      error: "User not authenticated" 
    });
  }

  try {
    // First get the username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch user data" 
      });
    }

    // Then upsert the PR record
    const { data, error } = await supabase
      .from('pr')
      .upsert({
        username: userData.username,  // Include username in the record
        exercise_name: newPR.exercise,
        weight: newPR.weight,
        reps: newPR.reps,
      });

    if (error) {
      console.error("Error updating personal record:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Internal Server Error" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Personal record updated successfully" 
    });
  } catch (error) {
    console.error("Unexpected error in addPersonalRecord:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        error: "File is required" 
      });
    }

    // Get user's username from the database using the token's user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const username = userData.username;

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const fileExt = file.split(';')[0].split('/')[1];
    const fileName = `${username}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
        owner: req.user.id  // Set the owner to the authenticated user's ID
      });

    if (error) {
      console.error("Error uploading file:", error);
      // More detailed error message
      return res.status(500).json({ 
        success: false, 
        error: "Failed to upload profile picture",
        details: error.message || error.error || "Unknown error",
        statusCode: error.statusCode
      });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(fileName);

    // Update user profile with the new picture URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture_url: publicUrl })
      .eq('id', req.user.id);  // Use user ID instead of username

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to update profile with new picture" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error) {
    console.error("Error in uploadProfilePicture:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

const createPost = async (req, res) => {
  const { title, description, imageFile, tags } = req.body;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      success: false, 
      error: "User not authenticated" 
    });
  }

  try {
    // Get user's username from the database using the token's user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const username = userData.username;

    // Convert base64 to buffer
    const buffer = Buffer.from(imageFile.split(',')[1], 'base64');
    const fileExt = imageFile.split(';')[0].split('/')[1];
    const fileName = `${username}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage with owner field
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('post-images-f423yiufg348ygv3rhfvbf34yibv34gb')
      .upload(fileName, buffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
        duplex: 'half',
        owner: req.user.id
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to upload post image",
        details: uploadError.message || uploadError.error || "Unknown error"
      });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('post-images-f423yiufg348ygv3rhfvbf34yibv34gb')
      .getPublicUrl(fileName);

    // Create post record in the database
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([{
        title,
        description,
        image_url: publicUrl,
        tags,
        username,
        uuid: req.user.id,
        created_at: new Date()
      }])
      .select();

    if (postError) {
      console.error("Error creating post:", postError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to create post",
        details: postError.message
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Post created successfully",
      data: postData
    });

  } catch (error) {
    console.error("Unexpected error in createPost:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error",
      details: error.message
    });
  }
};

// Export middleware and controllers
export {// New middleware for authentication
  getAdress,
  profile,
  userInfo,
  getGymData,
  getUserName,
  addPersonalRecord,
  uploadProfilePicture,
  createPost
};