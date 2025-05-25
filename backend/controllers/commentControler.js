import { supabase } from '../middlewares/supabaseApp.js'
import axios from "axios";


const createComment = async (req, res) => {
    try {
      
      const { CommentID, CommentText, GymName, Time, Rating, Tags, GymId } = req.body;
  
      if (!CommentID || !CommentText || !GymName || !GymId) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
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
      // Get user's username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();
  
      if (userError || !userData) {
        console.error("Error fetching user:", userError);
        return res.status(404).json({ success: false, error: "User not found" });
      }
  
      const UserNamedata = userData.username;
  
      // Process tags
      let processedTags = [];
      if (Tags) {
        if (typeof Tags === "string") {
          const trimmedTag = Tags.trim();
          if (trimmedTag !== "") {
            processedTags = [trimmedTag];
          }
        } else if (Array.isArray(Tags)) {
          processedTags = Tags.filter(
            (tag) => tag && typeof tag === "string" && tag.trim() !== ""
          ).map((tag) => tag.trim());
        }
      }
  
      // Process rating
      const numericRating = Rating !== undefined && Rating !== null ? Number(Rating) : 0;
      
      // Insert comment
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          id: CommentID,
          user_id: user.id,
          username: UserNamedata,
          gym_id: GymId,
          comment_text: CommentText,
          rating: numericRating,
          tags: processedTags,
          created_at: new Date()
        });
  
      if (commentError) {
        console.error("Error creating comment:", commentError);
        return res.status(500).json({
          success: false, 
          error: commentError.message || "Failed to create comment"
        });
      }
  
      console.log(`[createComment] Comment saved with Rating=${numericRating}`);
  
      // Update gym tags and rating
      try {
        console.log(`[createComment] Updating gym tags and rating for gym ${GymId}`);
        const result = await updateGymTags(GymId);
        console.log(`[createComment] Gym updated successfully. Rating: ${result.rating}`);
      } catch (tagError) {
        console.error("Error updating gym tags:", tagError);
        // We'll still consider the comment creation successful even if tag update fails
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


  const getComments = async (req, res) => {
    const { GymName } = req.query;
    console.log("Requested GymName:", GymName);
  
    try {
      if (!GymName) {
        return res
          .status(400)
          .json({ success: false, error: "GymName is required" });
      }
  
      // Get all comments for the gym
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('gym_id', GymName);
  
      if (error) {
        console.error("Error retrieving comments:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
      }
  
      if (!comments || comments.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "No comments found" });
      }
  
      // Process comments for response
      const processedComments = comments.map(comment => ({
        id: comment.id,
        UserNamedata: comment.username,
        CommentText: comment.comment_text,
        Time: comment.created_at,
        Rating: comment.rating || 0,
        Tags: comment.tags || [],
        GymId: comment.gym_id
      }));
  
      console.log("Fetched Comments with Tags:", processedComments); // Debugging
  
      res.status(200).json({ success: true, data: processedComments });
    } catch (error) {
      console.error("Error retrieving comments:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
  export {createComment, getComments}