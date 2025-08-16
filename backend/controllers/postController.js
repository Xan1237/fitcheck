// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'

/**
 * Fetches all posts for a given username.
 * Expects username in req.params.
 * Returns all posts from the 'posts' table.
 */
async function getPosts(req, res) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        postId,
        created_at,
        title,
        description,
        image_url,
        tags,
        username,
        total_comments,
        total_likes,
        uuid,
        author:users!posts_uuid_fkey(
          username,
          profile_picture_url
        ),
        author_profile:public_profiles!posts_username_fkey(
          profile_picture_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Normalize avatar to top level for the frontend
    const formatted = (data || []).map(p => {
      const avatar =
        p?.author?.profile_picture_url ||
        p?.author_profile?.profile_picture_url ||
        null;

      return {
        ...p,
        profile_picture_url: avatar,   // snake_case
        profilePictureUrl: avatar      // camelCase (your UI checks both)
      };
    });

    return res.status(200).json(formatted);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}


/**
 * Adds a new comment to a post.
 * Expects postId in req.params and text in req.body.
 * Requires authenticated user (req.user.id).
 * Inserts a new comment into 'postMessages' table.
 */
async function addPostComment(req, res) {
    const postId = req.params.postId;
    const { text, created_at, username } = req.body;
    if (!postId || !text) {
        return res.status(400).json({ success: false, error: "Missing postId or text" });
    }
    try {
        // Determine the author id:
        // 1) Prefer authenticated user from middleware (req.user.id)
        // 2) Fallback: look up by provided username from request body
        let authorId = req.user?.id || null;
        if (!authorId && username) {
        const { data: userRow, error: userErr } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();
        if (userErr) {
            return res.status(400).json({ success: false, error: "Could not resolve username to user id" });
        }
        authorId = userRow.id;
        }

        // Insert new comment (with user_uuid resolved)
        const { data, error } = await supabase
            .from('postMessages')
            .insert({
                postId,
                text,
                user_uuid: authorId,
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
    if (!postId) {
        return res.status(400).json({ success: false, error: "Missing postId" });
    }
    try {
        // Explicitly join via the FK name to guarantee the relationship
        // Format: alias:table!foreign_key_name(...)
        const { data, error } = await supabase
        .from('postMessages')
        .select(`
            id,
            created_at,
            text,
            postId,
            likes,
            user_uuid,
            author:users!postMessages_user_uuid_fkey (
            username,
            profile_picture_url
            )
        `)
            .eq('postId', postId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        // Format comments to include username at top level
        const formattedComments = (data || []).map(comment => ({
            id: comment.id,
            created_at: comment.created_at,
            text: comment.text,
            postId: comment.postId,
            likes: comment.likes,
            user_uuid: comment.user_uuid,
            username: comment.author?.username || "Unknown",
            profile_picture_url: comment.author?.profile_picture_url || null
        }));

        return res.status(200).json({ success: true, data: formattedComments });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

// Export controller functions for use in routes
export { getPosts, addPostComment, getPostComments }