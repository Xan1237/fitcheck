import { supabase } from '../config/supabaseApp.js'



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

  async function addUserGym(req, res){
    const {gymId, username, gymName, gymAdress} = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('gyms_frequented')
      .insert({
        uuid: userId,
        gymId: gymId,
        gymName: gymName,
        username: username,
        gymAddress: gymAdress
      });
    if (error) {
      console.error("Error adding user gym:", error);
      return res.status(400).json({ error: error.message });
    }
    console.log("User gym added successfully:", data);
    return res.status(200).json({ message: "Gym added successfully"});
  }

  async function getUserGyms(req, res) {
    const userId = req.user.id;
    try {
      const { data, error } = await supabase
        .from('gyms_frequented')
        .select('gymId, gymName, gymAddress')
        .eq('uuid', userId);

      if (error) {
        console.error("Error fetching user gyms:", error);
        return res.status(400).json({ error: error.message });
      }

      console.log("User gyms fetched successfully:", data);
      const gyms = data.map(gym => ({
        id: gym.gymId,
        name: gym.gymName,
        address: gym.gymAddress
      }));

      return res.status(200).json({ gyms });
    } catch (error) {
      console.error("Unexpected error fetching user gyms:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }




export { updateGymTags, addUserGym, getUserGyms };