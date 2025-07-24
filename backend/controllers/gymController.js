// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'

/**
 * Calculates and updates popular tags for a gym based on review data.
 * A tag is considered "popular" if it appears in at least 25% of reviews.
 * Also calculates the average rating for the gym.
 * @param {string} gymId - The ID of the gym
 * @returns {Promise<{tags: string[], rating: number}>} - Array of popular tags and average rating
 */
const updateGymTags = async (gymId) => {
    try {
      // Ensure gymId is a string for consistency
      const gymIdString = String(gymId);
      console.log(`[updateGymTags] Processing gym ID: ${gymIdString}`);
  
      // 1. Get all comments for the gym from the 'comments' table
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('gym_id', gymIdString);
  
      // Handle error when fetching comments
      if (commentsError) {
        console.error(`[updateGymTags] Error fetching comments:`, commentsError);
        throw commentsError;
      }
  
      // If no comments found, update gym with empty tags and zero rating
      if (!comments || comments.length === 0) {
        console.log(`[updateGymTags] No comments found for gym ${gymIdString}`);
        // Create/update the gym document with empty tags and zero rating
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
  
      // Total number of comments for the gym
      const totalComments = comments.length;
      console.log(`[updateGymTags] Found ${totalComments} comments for gym ${gymIdString}`);
  
      // 2. Count tag occurrences and accumulate ratings
      const tagCounts = {}; // Object to store tag frequencies
      let totalRating = 0;  // Sum of all ratings
      let ratingCount = 0;  // Number of ratings counted
  
      comments.forEach((comment) => {
        // Process tags for each comment
        if (comment.tags && Array.isArray(comment.tags)) {
          // Filter out empty tags and normalize whitespace
          const validTags = comment.tags.filter(
            (tag) => tag && typeof tag === "string" && tag.trim() !== ""
          ).map((tag) => tag.trim());
  
          // Count each valid tag
          validTags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
  
        // Process rating for each comment
        if (comment.rating !== undefined && comment.rating !== null) {
          const numericRating = Number(comment.rating);
          if (!isNaN(numericRating)) {
            totalRating += numericRating;
            ratingCount++;
          }
        }
      });
  
      console.log(`[updateGymTags] Calculated ratings: total=${totalRating}, count=${ratingCount}`);
  
      // Calculate average rating, rounded to 1 decimal place
      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      const roundedRating = Math.round(averageRating * 10) / 10;
      console.log(`[updateGymTags] Final average rating: ${roundedRating}`);
  
      // 3. Calculate which tags appear in at least 25% of comments
      // Threshold is at least 25% of comments, minimum 1
      const threshold = Math.max(1, Math.ceil(totalComments * 0.25));
  
      // Filter tags that meet the popularity threshold
      const popularTags = Object.keys(tagCounts)
        .filter((tag) => tag.trim() !== "") // Extra safety check for empty strings
        .filter((tag) => tagCounts[tag] >= threshold);
  
      console.log(`[updateGymTags] Popular tags: ${popularTags.join(', ')}`);
  
      // 4. Update the gym record with the popular tags and rating
      try {
        console.log(`[updateGymTags] Updating gym with rating=${roundedRating} and ${popularTags.length} tags`);
        
        // Upsert gym data with new tags and rating
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
        // Handle error when writing to gym table
        console.error(`[updateGymTags] Error writing to gym:`, writeError);
        throw writeError;
      }
  
      // Return the popular tags and average rating
      return { 
        tags: popularTags,
        rating: roundedRating 
      };
    } catch (error) {
      // Catch-all error handler for the function
      console.error(`[updateGymTags] Error processing gym ${gymId}:`, error);
      throw error;
    }
  };

  /**
   * Adds a gym to the list of gyms frequented by a user.
   * Expects gymId, username, gymName, gymAdress in req.body and user id in req.user.id.
   * Inserts a new record into 'gyms_frequented' table.
   */
  async function addUserGym(req, res){
    // Extract gym and user info from request body
    const {gymId, username, gymName, gymAdress} = req.body;
    const userId = req.user.id;

    // Insert new gym frequented record for the user
    const { data, error } = await supabase
      .from('gyms_frequented')
      .insert({
        uuid: userId,
        gymId: gymId,
        gymName: gymName,
        username: username,
        gymAddress: gymAdress
      });
    // Handle error during insertion
    if (error) {
      console.error("Error adding user gym:", error);
      return res.status(400).json({ error: error.message });
    }
    // Success response
    console.log("User gym added successfully:", data);
    return res.status(200).json({ message: "Gym added successfully"});
  }

  /**
   * Retrieves the list of gyms frequented by a user.
   * Expects username in req.params.
   * Returns an array of gyms with id, name, and address.
   */
  async function getUserGyms(req, res) {
    // Extract username from request parameters
    const {name} = req.params;
    console.log("Fetching gyms for user:", name);
    try {
      // Query gyms frequented by the user
      const { data, error } = await supabase
        .from('gyms_frequented')
        .select('gymId, gymName, gymAddress')
        .eq('username', name);

      // Handle error during query
      if (error) {
        console.error("Error fetching user gyms:", error);
        return res.status(400).json({ error: error.message });
      }

      // Map data to desired response format
      console.log("User gyms fetched successfully:", data);
      const gyms = data.map(gym => ({
        id: gym.gymId,
        name: gym.gymName,
        address: gym.gymAddress
      }));

      // Success response with gyms array
      return res.status(200).json({ gyms });
    } catch (error) {
      // Handle unexpected errors
      console.error("Unexpected error fetching user gyms:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

// Export controller functions for use in routes
export { updateGymTags, addUserGym, getUserGyms };