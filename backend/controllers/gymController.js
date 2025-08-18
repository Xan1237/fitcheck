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

    // First, fetch the gym's full row so we can reuse all required columns
    const { data: gymRows, error: gymFetchError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', gymIdString);

    if (gymFetchError || !gymRows || gymRows.length === 0) {
      throw gymFetchError || new Error('Gym not found');
    }

    const gymData = gymRows[0];

    // 1. Get all comments for the gym from the 'comments' table
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('gym_id', gymIdString);

    if (commentsError) {
      console.error(`[updateGymTags] Error fetching comments:`, commentsError);
      throw commentsError;
    }

    // Prepare default values
    let tags = [];
    let rating = 0;
    let rating_count = 0;

    // If comments exist, calculate tags and rating
    if (comments && comments.length > 0) {
      // 2. Count tag occurrences and accumulate ratings
      const tagCounts = {};
      let totalRating = 0;

      comments.forEach((comment) => {
        if (comment.tags && Array.isArray(comment.tags)) {
          const validTags = comment.tags.filter(
            (tag) => tag && typeof tag === "string" && tag.trim() !== ""
          ).map((tag) => tag.trim());
          validTags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }

        // Process rating for each comment
        if (comment.rating !== undefined && comment.rating !== null) {
          const numericRating = Number(comment.rating);
          if (!isNaN(numericRating)) {
            totalRating += numericRating;
            rating_count++;
          }
        }
      });

      const totalComments = comments.length;
      // Calculate average rating, rounded to 1 decimal place
      rating = rating_count > 0 ? Math.round((totalRating / rating_count) * 10) / 10 : 0;

      // Tags appearing in at least 25% of comments (minimum 1)
      const threshold = Math.max(1, Math.ceil(totalComments * 0.25));
      tags = Object.keys(tagCounts)
        .filter((tag) => tag.trim() !== "")
        .filter((tag) => tagCounts[tag] >= threshold);

      console.log(`[updateGymTags] Popular tags: ${tags.join(', ')}`);
    }

    // 3. Upsert the gym row with all required fields (overwrite tags/rating fields)
    const { error: updateError } = await supabase
      .from('gyms')
      .upsert({
        id: gymIdString,
        name: gymData.name,
        address: gymData.address,
        province: gymData.province,
        link: gymData.link,
        // ...add other NOT NULL or important fields here if needed
        tags: tags,
        rating: rating,
        rating_count: rating_count,
        updated_at: new Date()
      });

    if (updateError) {
      console.error(`[updateGymTags] Error updating gym:`, updateError);
      throw updateError;
    }

    console.log(`[updateGymTags] Successfully updated gym data for ${gymIdString}`);
    return { tags, rating };

  } catch (error) {
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

  async function removeUserGym(req, res){
    const {gymId} = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('gyms_frequented')
      .delete()
      .eq('uuid', userId)
      .eq('gymId', gymId);

    if (error) {
      console.error("Error removing user gym:", error);
      return res.status(400).json({ error: error.message });
    }

    console.log("User gym removed successfully:", data);
    return res.status(200).json({ message: "Gym removed successfully"});
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

  /**
   * Retrieves gyms by province.
   * Expects province in req.params.
   * Returns an array of gyms in the specified province.
   */
  async function getGymsByProvince(req, res) {
    const { province } = req.params;
    try {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('province', province);

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ gyms: data });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  

// Export controller functions for use in routes
export { updateGymTags, addUserGym, getUserGyms, getGymsByProvince, removeUserGym };