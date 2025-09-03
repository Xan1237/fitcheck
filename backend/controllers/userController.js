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
      .eq('username', userName)
      .order("exercise_name");

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

// addPersonalRecord: upsert by (username, exercise_name, weight, reps)
const addPersonalRecord = async (req, res) => {
  const { newPR } = req.body;
  if (!req.user?.id) {
    return res.status(401).json({ success: false, error: "User not authenticated" });
  }

  try {
    // resolve username from auth id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();
    if (userError || !userData?.username) {
      return res.status(500).json({ success: false, error: "Failed to fetch user data" });
    }

    // coerce numbers
    const weight = Number(newPR.weight);
    const reps   = Number(newPR.reps);

    if (!newPR.exercise || !Number.isFinite(weight) || !Number.isFinite(reps) || weight <= 0 || reps <= 0) {
      return res.status(400).json({ success: false, error: "Invalid PR payload" });
    }

    const { error } = await supabase
      .from('pr')
      .upsert({
        username: userData.username,
        exercise_name: newPR.exercise.trim(),
        weight,
        reps,
      }, { onConflict: 'username,exercise_name,weight,reps' });  // <-- important

    if (error) {
      console.error("Error upserting PR:", error);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }

    return res.status(200).json({ success: true, message: "PR saved" });
  } catch (err) {
    console.error("addPersonalRecord error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// --- PR: update & delete --- //
const updatePersonalRecord = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const { exerciseName, weight, reps, newExerciseName, newWeight, newReps } = req.body;

    if (!exerciseName || weight == null || reps == null) {
      return res.status(400).json({ success: false, error: "exerciseName, weight, and reps are required" });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', req.user.id)
      .single();
    if (userError || !userData?.username) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const patch = {};
    if (newExerciseName) patch.exercise_name = newExerciseName.trim();
    if (newWeight != null) {
      const w = Number(newWeight);
      if (!Number.isFinite(w) || w <= 0) return res.status(400).json({ success: false, error: "Invalid newWeight" });
      patch.weight = w;
    }
    if (newReps != null) {
      const r = Number(newReps);
      if (!Number.isFinite(r) || r <= 0) return res.status(400).json({ success: false, error: "Invalid newReps" });
      patch.reps = r;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, error: "Nothing to update" });
    }

    const { error: updateError } = await supabase
      .from('pr')
      .update(patch)
      .eq('username', userData.username)
      .eq('exercise_name', exerciseName)
      .eq('weight', Number(weight))
      .eq('reps', Number(reps));

    if (updateError) {
      return res.status(500).json({ success: false, error: updateError.message || "Failed to update PR" });
    }

    return res.status(200).json({ success: true, message: "PR updated" });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// supports: DELETE /api/pr?exerciseName=...&weight=...&reps=...
// or axios.delete(url, { data: { exerciseName, weight, reps } })
const deletePersonalRecord = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, error: "User not authenticated" });

    // accept body, query, or path param
    const exerciseName = req.params.exerciseName || req.body?.exerciseName || req.query?.exerciseName;
    const weight = req.body?.weight ?? req.query?.weight;
    const reps   = req.body?.reps   ?? req.query?.reps;

    if (!exerciseName || weight == null || reps == null) {
      return res.status(400).json({ success: false, error: "exerciseName, weight, and reps are required" });
    }

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
      .eq('exercise_name', exerciseName)
      .eq('weight', Number(weight))
      .eq('reps', Number(reps));

    if (delError) return res.status(500).json({ success: false, error: delError.message || "Failed to delete PR" });
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
// Mobile-specific function to get user posts
const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (username, profile_picture_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json(data || []);
  } catch (err) {
    console.error('Error fetching user posts:', err);
    res.status(500).json({ success: false, error: "Failed to fetch user posts" });
  }
};

// Mobile-specific function to get user stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get post count
    const { count: postCount, error: postError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (postError) {
      console.error('Error fetching post count:', postError);
    }

    // Get PR count
    const { count: prCount, error: prError } = await supabase
      .from('pr')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (prError) {
      console.error('Error fetching PR count:', prError);
    }

    // Get follower count
    const { count: followerCount, error: followerError } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('target_user_id', userId);

    if (followerError) {
      console.error('Error fetching follower count:', followerError);
    }

    // Get following count
    const { count: followingCount, error: followingError } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_user_id', userId);

    if (followingError) {
      console.error('Error fetching following count:', followingError);
    }

    res.status(200).json({
      posts: postCount || 0,
      personalRecords: prCount || 0,
      followers: followerCount || 0,
      following: followingCount || 0
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ success: false, error: "Failed to fetch user stats" });
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
  getAllUsers,
  getUserPosts,
  getUserStats
};