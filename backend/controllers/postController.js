// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'

/**
 * Gets view analytics for posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPostViewAnalytics(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let query = supabase
      .from('viewed_posts')
      .select(`
        post_id,
        viewed_at,
        user_id
      `)
      .order('viewed_at', { ascending: false });
    
    // If postId is provided, filter by that post
    if (postId) {
      query = query.eq('post_id', postId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    
    // Group by post_id for analytics
    const analytics = {};
    data.forEach(view => {
      if (!analytics[view.post_id]) {
        analytics[view.post_id] = {
          post_id: view.post_id,
          total_views: 0,
          unique_viewers: new Set(),
          recent_views: []
        };
      }
      
      analytics[view.post_id].total_views++;
      analytics[view.post_id].unique_viewers.add(view.user_id);
      analytics[view.post_id].recent_views.push({
        user_id: view.user_id,
        viewed_at: view.viewed_at
      });
    });
    
    // Convert Set to count for unique viewers
    Object.keys(analytics).forEach(postId => {
      analytics[postId].unique_viewers = analytics[postId].unique_viewers.size;
      // Keep only the 10 most recent views
      analytics[postId].recent_views = analytics[postId].recent_views.slice(0, 10);
    });
    
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error getting post view analytics:', error);
    return res.status(500).json({ message: error.message });
  }
}

// Helper function to record a post view
async function recordViewedPost(userId, postId) {
  console.log(userId + " " + postId)
  try {
    // Check if this view already exists
    const { data: existingView } = await supabase
      .from('posts_viewed')
      .select('uuid')
      .eq('uuid', userId)
      .eq('postId', postId)
      .single();
    
    // Only insert if this is a new view
    if (!existingView) {
      const { error } = await supabase
        .from('posts_viewed')
        .insert({
          uuid: userId,
          postId: postId,
        });
      
      if (error) {
        console.error('Error recording viewed post:', error);
      }
    }
  } catch (error) {
    console.error('Error in recordViewedPost:', error);
  }
}

/**
 * Fetches all posts for a given username.
 * Expects username in req.params.
 * Returns all posts from the 'posts' table.
 */
async function getPosts(req, res) {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    console.log("Current user ID:", userId); // Debug log

    // Get total count of posts
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // Get paginated posts
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
        author:users!posts_uuid_fkey(
          username,
          profile_picture_url
        ),
        author_profile:public_profiles!posts_username_fkey(
          profile_picture_url
        ),
        postLikes:postLikes(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Normalize avatar and count likes
    const formatted = (data || []).map(p => {
      const avatar =
        p?.author?.profile_picture_url ||
        p?.author_profile?.profile_picture_url ||
        null;

      console.log("Post likes for post:", p.postId, p.postLikes); // Debug log
      
      // Count likes and check if current user liked the post
      const total_likes = Array.isArray(p.postLikes) ? p.postLikes.length : 0;
      const is_liked = p.postLikes?.some(like => {
        console.log("Comparing:", like.user_uuid, userId); // Debug log
        return like.user_uuid === userId;
      }) || false;

      // Record that this user viewed this post
      if (userId && p.postId) {
        recordViewedPost(userId, p.postId);
      }

      return {
        ...p,
        total_likes,
        is_liked,
        profile_picture_url: avatar,
        profilePictureUrl: avatar
      };
    });

    return res.status(200).json({
      posts: formatted,
      pagination: {
        page,
        limit,
        total: count,
        hasMore: offset + limit < count
      }
    });
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

async function addPostLike(req, res) {
  const { postId } = req.params;
  const userId = req.user.id;

  if (!postId) {
    return res.status(400).json({ success: false, error: "Missing postId" });
  }

  try {
    // Check if the like already exists
    const { data: existingLike, error: likeError } = await supabase
      .from('postLikes')
      .select('*')
      .eq('post_uuid', postId)
      .eq('user_uuid', userId)
    console.log(likeError);
    if (likeError) {
         console.log("exist" + insertError);
      return res.status(500).json({ success: false, error: likeError.message });
    }
    console.log(existingLike);
    if (existingLike.length > 0) {
      // If the like exists, remove it (unlike)
      const { error: deleteError } = await supabase
        .from('postLikes')
        .delete()
        .eq('post_uuid', postId)
        .eq('user_uuid', userId);

      if (deleteError) {
        return res.status(500).json({ success: false, error: deleteError.message });
      }

      return res.status(200).json({ success: true, message: "Post unliked" });
    } else {
      // If the like doesn't exist, add it
      const { error: insertError } = await supabase
        .from('postLikes')
        .insert({  "post_uuid": postId, "user_uuid": userId });

      if (insertError) {
        console.log("inseterror" + insertError);
        return res.status(500).json({ success: false, error: insertError.message });
      }

      return res.status(201).json({ success: true, message: "Post liked" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Gets a single post by ID.
 * Expects postId in req.params.
 * Returns the post from the 'posts' table, including author and like information.
 */
async function getPostById(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id; // Will be undefined for unauthenticated users
    
    console.log("Fetching post with ID:", postId, "User ID:", userId || 'unauthenticated');
    
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
        author:users!posts_uuid_fkey(
          username,
          profile_picture_url
        ),
        author_profile:public_profiles!posts_username_fkey(
          profile_picture_url
        ),
        postLikes:postLikes(*)
      `)
      .eq('postId', postId);
      // Removed .single() to see if we get any results

    if (error || !data || data.length === 0) {
      console.error('Error or no data:', error, 'Data:', data);
      return res.status(404).json({ message: 'Post not found' });
    }

    // Use first result instead of .single()
    const post = data[0];
    
    // Format the post with the same logic as getPosts
    const avatar =
      post?.author?.profile_picture_url ||
      post?.author_profile?.profile_picture_url ||
      null;

    const total_likes = Array.isArray(post.postLikes) ? post.postLikes.length : 0;
    
    // Only include is_liked if the user is authenticated
    const formatted = {
      ...post,
      total_likes,
      profile_picture_url: avatar,
      profilePictureUrl: avatar
    };

    // Add is_liked only for authenticated users
    if (userId) {
      formatted.is_liked = post.postLikes?.some(like => like.user_uuid === userId) || false;
      
      // Record that this user viewed this post
      recordViewedPost(userId, postId);
    }

    return res.status(200).json(formatted);
  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).json({ message: e.message });
  }
}



/**
 * Deletes a post by its ID.
 * Requires authentication and verifies post ownership.
 */
async function deletePost(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required' });
    }

    // First, verify that the post exists and belongs to the user
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('postId', postId)
      .single();

    if (fetchError) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.uuid !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('postId', postId);

    if (deleteError) {
      return res.status(400).json({ message: deleteError.message });
    }

    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (e) {
    console.error('Error deleting post:', e);
    return res.status(500).json({ message: e.message });
  }
}

// Export controller functions for use in routes
export { getPosts, addPostComment, getPostComments, addPostLike, getPostById, deletePost, getPostViewAnalytics }