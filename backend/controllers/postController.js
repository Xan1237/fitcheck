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
    const { text, created_at } = req.body;
    if (!postId || !text) {
        return res.status(400).json({ success: false, error: "Missing postId or text" });
    }
    try {
        // Insert new comment
        const { data, error } = await supabase
            .from('postMessages')
            .insert({
                postId,
                text,
                user_uuid: req.user?.id,
                likes: 0,
                created_at: created_at || new Date()
            })
            .select();

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        // Get current total_comments
        const { data: postData, error: postError } = await supabase
            .from('posts')
            .select('total_comments')
            .eq('postId', postId)
            .single();

        if (postError || !postData) {
            return res.status(500).json({ success: false, error: postError?.message || "Post not found" });
        }

        const newTotal = (postData.total_comments || 0) + 1;

        // Update total_comments
        const { error: updateError } = await supabase
            .from('posts')
            .update({ total_comments: newTotal })
            .eq('postId', postId);

        if (updateError) {
            return res.status(500).json({ success: false, error: updateError.message });
        }

        return res.status(201).json({ success: true, message: "Comment added", data });
    } catch (err) {
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