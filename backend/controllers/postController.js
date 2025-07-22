import { supabase } from '../config/supabaseApp.js'

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

// Add a new comment to a post
async function addPostComment(req, res) {
    const postId = req.params.postId;
    // Accept all info from body
    const { text, created_at, username } = req.body;
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, error: "User not authenticated" });
    }
    if (!postId || !text) {
        return res.status(400).json({ success: false, error: "Missing postId or text" });
    }
    console.log("Adding comment to post:", postId, "Text:", text, "User ID:", req.user.id);
    try {
        const { data, error } = await supabase
            .from('postMessages')
            .insert({
                postId,
                text,
                user_uuid: req.user.id,
                likes: 0
            })
            .select(); // Return inserted row
        if (error) {
            console.log("Error adding comment:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
        return res.status(201).json({ success: true, message: "Comment added", data });
    } catch (err) {
        console.log("Error adding comment:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

// Get all comments for a post
async function getPostComments(req, res) {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ success: false, error: "Missing postId" });
    }
    try {
        const { data, error } = await supabase
            .from('postMessages')
            .select('*')
            .eq('postId', postId)
            .order('created_at', { ascending: false });
        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

export { getPosts, addPostComment, getPostComments }