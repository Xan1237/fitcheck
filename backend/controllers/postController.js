// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'

/**
 * Fetches all posts for a given username.
 * Expects username in req.params.
 * Returns all posts from the 'posts' table.
 */
function getPosts(req, res) {
    const { username } = req.params;

    supabase
        .from('posts')
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(200).json(data);
        });
}

/**
 * Adds a new comment to a post.
 * Expects postId in req.params and text in req.body.
 * Requires authenticated user (req.user.id).
 * Inserts a new comment into 'postMessages' table.
 */
async function addPostComment(req, res) {
    const postId = req.params.postId;
    // Accept all info from body
    const { text, created_at, username } = req.body;
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "User not authenticated" });
    }
    // Validate required fields
    if (!postId || !text) {
        return res.status(400).json({ success: false, error: "Missing postId or text" });
    }
    console.log("Adding comment to post:", postId, "Text:", text, "User ID:", req.user.id);
    try {
        // Insert new comment into postMessages table
        const { data, error } = await supabase
            .from('postMessages')
            .insert({
                postId,
                text,
                user_uuid: req.user.id,
                likes: 0
            })
            .select(); // Return inserted row
        // Handle error during insertion
        if (error) {
            console.log("Error adding comment:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
        // Success response
        return res.status(201).json({ success: true, message: "Comment added", data });
    } catch (err) {
        // Handle unexpected errors
        console.log("Error adding comment:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

/**
 * Gets all comments for a specific post.
 * Expects postId in req.params.
 * Returns all comments from 'postMessages' table for the post, ordered by creation date descending.
 */
async function getPostComments(req, res) {
    const { postId } = req.params;
    // Validate required field
    if (!postId) {
        return res.status(400).json({ success: false, error: "Missing postId" });
    }
    try {
        // Query comments for the post
        const { data, error } = await supabase
            .from('postMessages')
            .select('*')
            .eq('postId', postId)
            .order('created_at', { ascending: false });
        // Handle error during query
        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
        // Success response with comments data
        return res.status(200).json({ success: true, data });
    } catch (err) {
        // Handle unexpected errors
        return res.status(500).json({ success: false, error: err.message });
    }
}

// Export controller functions for use in routes
export { getPosts, addPostComment, getPostComments }