// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'
// Import axios for HTTP requests (not used in this file)
import axios from "axios";
// Import dotenv to load environment variables
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();



// Get the username for the authenticated user
const getUserName = async (req, res) => {
  try {
    // Extract and validate the Bearer token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const token = authHeader.split(' ')[1];

    // Get user info from Supabase Auth using the token
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: authErr?.message || 'Invalid token' });
    }

    // Query the users table for username and id
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', user.id)
      .single();

    console.log('Database query result:', data);
    console.log('Database query error:', error);

    // Handle database error
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    // If no user data found, create a default profile
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
    // Handle unexpected errors
    console.error("Error fetching username:", error);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};


// Update or create a user profile
const profile = async (req, res) => {
  try {
    // Log request body for debugging
    console.log(req.body);
    console.log("Profile update request received");
    
    // Debug request body
    console.log("Request body:", JSON.stringify(req.body));
    
    // Accept profile data directly from body
    const sendingdata = req.body;

    // Find the email from the users table using uuid
    // Use Supabase Auth to get the email from the token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      console.log("Error fetching user email from auth:", authError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Always set email from auth
    sendingdata.email = authUser.email;

    // Fallback for missing fields
    const profileData = {
      id: authUser.id,
      email: sendingdata.email,
      username: sendingdata.username || "",
      first_name: sendingdata.firstName || "",
      last_name: sendingdata.lastName || "",
      bio: sendingdata.bio || "",
      birthdate: sendingdata.birthdate || null,
      gender: sendingdata.gender || "",
      location: sendingdata.location || "",
      updated_at: new Date(),
    };

    const profileData2 = {
      username: sendingdata.username || "",
      first_name: sendingdata.firstName || "",
      last_name: sendingdata.lastName || "",
      bio: sendingdata.bio || "",
      gender: sendingdata.gender || "",
      location: sendingdata.location || "",
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
    // Handle unexpected errors
    console.error("Unexpected error in profile update:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error", details: error.message });
  }
};


// Get public user info, PRs, and posts for a given username
const userInfo = async (req, res) => {
  try {
    // Extract username from query
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

    // Return user info
    return res.status(200).json({ success: true, user: publicUserData });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching user information:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};


// Get all gym data
const getGymData = async (req, res) => {
  try {
    // Query all gyms from the 'gyms' table
    const { data: gyms, error } = await supabase
      .from('gyms')
      .select('*');

    if (error) {
      console.error("Error retrieving gym data:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }

    // Format the response for frontend
    const formattedGyms = {};
    if (gyms && gyms.length > 0) {
      gyms.forEach((gym) => {
        formattedGyms[gym.id] = {
          id: gym.id,
          link: gym.link || "",
          address: gym.address || "",
          name: gym.name,
          tags: gym.tags || [],
          rating: gym.avg_rating || 0,
          ratingCount: gym.rating_count || 0,
        };
      });
    }

    // Return formatted gym data
    return res.status(200).json({ success: true, data: formattedGyms });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error retrieving gym data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// Add or update a personal record for the authenticated user
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
    // Get the username for the authenticated user
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

    // Upsert the PR record in the 'pr' table
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

    // Handle errors and return success
    return res.status(200).json({ 
      success: true, 
      message: "Personal record updated successfully" 
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error in addPersonalRecord:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

// --- PR: update & delete --- //
const updatePersonalRecord = async (req, res) => {
  // Body: { exerciseName, newExerciseName?, weight?, reps? }
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const { exerciseName, newExerciseName, weight, reps } = req.body;

    if (!exerciseName) {
      return res.status(400).json({ success: false, error: "exerciseName is required" });
    }

    // Resolve the authenticated user's username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();

    if (userError || !userData?.username) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Build update patch (only apply provided fields)
    const patch = {};
    if (typeof weight !== 'undefined') patch.weight = weight;
    if (typeof reps !== 'undefined') patch.reps = reps;
    if (newExerciseName) patch.exercise_name = newExerciseName;

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, error: "Nothing to update" });
    }

    // Update by (username, exercise_name)
    const { error: updateError } = await supabase
      .from('pr')
      .update(patch)
      .eq('username', userData.username)
      .eq('exercise_name', exerciseName);

    if (updateError) {
      return res.status(500).json({ success: false, error: updateError.message || "Failed to update PR" });
    }

    return res.status(200).json({ success: true, message: "PR updated" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const deletePersonalRecord = async (req, res) => {
  // Param or body: exerciseName
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const exerciseName = req.params.exerciseName || req.body.exerciseName;
    if (!exerciseName) {
      return res.status(400).json({ success: false, error: "exerciseName is required" });
    }

    // Resolve the authenticated user's username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();

    if (userError || !userData?.username) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const { error: delError } = await supabase
      .from('pr')
      .delete()
      .eq('username', userData.username)
      .eq('exercise_name', exerciseName);

    if (delError) {
      return res.status(500).json({ success: false, error: delError.message || "Failed to delete PR" });
    }

    return res.status(200).json({ success: true, message: "PR deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Upload a profile picture for the authenticated user
const uploadProfilePicture = async (req, res) => {
  try {
    // Extract file from request body
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

    // Update user profile with the new picture URL in both tables
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_picture_url: publicUrl })
      .eq('id', req.user.id);  // Use user ID instead of username

    const { error: updateError2 } = await supabase
      .from('public_profiles')
      .update({ profile_picture_url: publicUrl })
      .eq('username', username);  // Use username instead of user ID

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to update profile with new picture" 
      });
    }

    // Handle errors and return success
    return res.status(200).json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error in uploadProfilePicture:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
};

// Create a new post for the authenticated user
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

    let publicUrl = null;

    // Only upload image if imageFile is provided and is a valid base64 string
    if (
      imageFile &&
      typeof imageFile === "string" &&
      imageFile.startsWith("data:image/")
    ) {
      try {
        const buffer = Buffer.from(imageFile.split(',')[1], 'base64');
        const fileExt = imageFile.split(';')[0].split('/')[1];
        const fileName = `${username}-${Date.now()}.${fileExt}`;

        // Upload post image to Supabase Storage
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

        // Get the public URL for the uploaded image
        const { data: { publicUrl: url } } = supabase.storage
          .from('post-images-f423yiufg348ygv3rhfvbf34yibv34gb')
          .getPublicUrl(fileName);

        publicUrl = url || null;
      } catch (imgErr) {
        console.error("Error processing image:", imgErr);
        return res.status(500).json({ 
          success: false, 
          error: "Error processing image",
          details: imgErr.message
        });
      }
    }

    // Ensure tags is always a string or array
    let tagsToSave = tags;
    if (tagsToSave == null) tagsToSave = "";
    
    // Create post record in the database
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([{
        title,
        description,
        image_url: publicUrl,
        tags: tagsToSave,
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

    // Handle errors and return success
    return res.status(200).json({ 
      success: true, 
      message: "Post created successfully",
      data: postData
    });

  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error in createPost:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Internal Server Error",
      details: error.message
    });
  }
};

// Get all users (for people search)
const getAllUsers = async (req, res) => {
  try {
    // Query all usernames from the 'users' table
    const { data, error } = await supabase
      .from('users')
      .select('username');

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    // Handle errors and return user list
    return res.status(200).json(data);
  } catch (err) {
    // Handle unexpected errors
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Export middleware and controllers for use in routes
export {// New middleware for authentication
  profile,
  userInfo,
  getGymData,
  getUserName,
  addPersonalRecord,
  updatePersonalRecord,
  deletePersonalRecord,
  uploadProfilePicture,
  createPost,
  getAllUsers
};