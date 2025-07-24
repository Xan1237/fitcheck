// Import Supabase client and dependencies
import { supabase } from '../config/supabaseApp.js'
import axios from "axios";
import { updateGymTags } from './gymController.js';

/* 
  this method creates a comment and updates the gym tags and rating
  The payload is the comment data and the gym id
  The comment data is the comment id, the comment text, the gym name, the time the comment was made, the rating, the tags, and the gym id
  The gym id is the id of the gym that the comment is for
  The gym name is the name of the gym that the comment is for
  The time the comment was made is the time the comment was made
  The rating is the rating of the gym
  The tags are the tags of the gym
*/
const createComment = async (req, res) => {
    try {
      // Extract comment data from request body
      const { CommentID, CommentText, GymName, Time, Rating, Tags, GymId } = req.body;

      // Validate required fields
      if (!CommentID || !CommentText || !GymName || !GymId) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      // Get user's username from the database using user id from auth middleware
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', req.user.id)
        .single();

      // Handle error if user not found
      if (userError || !userData) {
        console.error("Error fetching user:", userError);
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Extract username
      const UserNamedata = userData.username;

      // Process tags: ensure array of trimmed strings
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

      // Convert rating to number, default to 0
      const numericRating = Rating !== undefined && Rating !== null ? Number(Rating) : 0;
      
      // Insert comment into Supabase 'comments' table
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          id: CommentID,
          user_id: req.user.id,
          username: UserNamedata,
          gym_id: GymId,
          comment_text: CommentText,
          rating: numericRating,
          tags: processedTags,
          created_at: new Date()
        });

      // Handle error if comment creation fails
      if (commentError) {
        console.error("Error creating comment:", commentError);
        return res.status(500).json({
          success: false, 
          error: commentError.message || "Failed to create comment"
        });
      }

      // Log successful comment creation
      console.log(`[createComment] Comment saved with Rating=${numericRating}`);

      // Try to update gym tags and rating after comment creation
      try {
        console.log(`[createComment] Updating gym tags and rating for gym ${GymId}`);
        const result = await updateGymTags(GymId);
        console.log(`[createComment] Gym updated successfully. Rating: ${result.rating}`);
      } catch (tagError) {
        // Log error but still return success for comment creation
        console.error("Error updating gym tags:", tagError);
        return res.status(201).json({ 
          success: true, 
          message: "Review added but gym stats may not be updated. Please refresh the page."
        });
      }

      // Return success response
      return res
        .status(201)
        .json({ success: true, message: "Review added successfully" });
    } catch (error) {
      // Handle unexpected errors
      console.error("Error creating comment:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Unknown error occurred",
      });
    }
  };

  /*
  this method gets all the comments for a gym
  The payload is the gym name
  The gym name is the name of the gym that the comments are for
  The comments are the comments of the gym
  The comments are returned in a json array
  The comments are returned in the order of the comments in the database
  The comments are returned in the order of the comments in the database
  */
  const getComments = async (req, res) => {
    // Extract gym id from query params
    const { GymName } = req.query;
    console.log("Requested GymName:", GymName);
  
    try {
      // Validate gym id
      if (!GymName) {
        return res
          .status(400)
          .json({ success: false, error: "GymName is required" });
      }
  
      // Query Supabase for all comments for the gym
      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('gym_id', GymName);
  
      // Handle error from Supabase
      if (error) {
        console.error("Error retrieving comments:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
      }
  
      // If no comments found, return 404
      if (!comments || comments.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "No comments found" });
      }
  
      // Format comments for response
      const processedComments = comments.map(comment => ({
        id: comment.id,
        UserNamedata: comment.username,
        CommentText: comment.comment_text,
        Time: comment.created_at,
        Rating: comment.rating || 0,
        Tags: comment.tags || [],
        GymId: comment.gym_id
      }));
  
      // Log processed comments for debugging
      console.log("Fetched Comments with Tags:", processedComments);
  
      // Return comments in response
      res.status(200).json({ success: true, data: processedComments });
    } catch (error) {
      // Handle unexpected errors
      console.error("Error retrieving comments:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

  // Export controller functions
  export {createComment, getComments}