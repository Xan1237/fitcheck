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
  if (!userId || !postId) return false;
  
  try {
    // Use the correct table and column names from the schema
    const { error } = await supabase
      .from('viewed_posts')
      .upsert({
        user_id: userId,
        post_id: postId,
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,post_id' // Don't create duplicates
      });
    
    if (error) {
      console.error('Error recording viewed post:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordViewedPost:', error);
    return false;
  }
}

/**
 * COMPLETELY REWRITTEN FEED ALGORITHM
 * Simple, reliable feed that just works
 */
async function getPosts(req, res) {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    console.log(`Feed request - User: ${userId}, Page: ${page}, Limit: ${limit}`);

    // STEP 1: Get posts with all needed data in one query
    const { data: posts, error, count } = await supabase
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
        uuid,
        author:users!posts_uuid_fkey(
          username,
          profile_picture_url
        ),
        author_profile:public_profiles!posts_username_fkey(
          profile_picture_url
        ),
        postLikes:postLikes(count)
      `, { count: 'exact' })
      .order('total_comments', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      return res.status(400).json({ message: error.message });
    }

    // STEP 2: Get like details for current user (if authenticated)
    let userLikes = [];
    if (userId && posts && posts.length > 0) {
      const postIds = posts.map(p => p.postId);
      const { data: likes } = await supabase
        .from('postLikes')
        .select('post_uuid')
        .eq('user_uuid', userId)
        .in('post_uuid', postIds);
      
      userLikes = likes?.map(like => like.post_uuid) || [];
    }

    // STEP 3: Format the response
    const formattedPosts = posts.map(post => {
      // Get profile picture from either source
      const profile_picture_url = 
        post.author?.profile_picture_url || 
        post.author_profile?.profile_picture_url || 
        null;

      // Check if current user liked this post
      const is_liked = userLikes.includes(post.postId);

      // Get like count
      const total_likes = post.postLikes?.[0]?.count || 0;

      return {
        postId: post.postId,
        created_at: post.created_at,
        title: post.title,
        description: post.description,
        image_url: post.image_url,
        tags: post.tags,
        username: post.username,
        total_comments: post.total_comments || 0,
        total_likes,
        is_liked,
        profile_picture_url,
        profilePictureUrl: profile_picture_url // Legacy compatibility
      };
    });

    // STEP 4: Record views asynchronously (don't wait for it)
    if (userId && formattedPosts.length > 0) {
      // Record views in background - don't await to avoid slowing down response
      formattedPosts.forEach(post => {
        recordViewedPost(userId, post.postId).catch(err => 
          console.error('Background view recording failed:', err)
        );
      });
    }

    // STEP 5: Return the response
    const response = {
      success: true,
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
        showing: formattedPosts.length
      }
    };

    console.log(`Feed response - Returning ${formattedPosts.length} posts`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Feed algorithm error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
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

/**
 * Get posts that the user hasn't viewed yet
 * This is a separate endpoint for the "fresh content" feed
 */
async function getUnviewedPosts(req, res) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required to get unviewed posts' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    console.log(`Unviewed posts request - User: ${userId}, Page: ${page}, Limit: ${limit}`);

    // Get posts that user hasn't viewed
    const { data: posts, error, count } = await supabase
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
        uuid,
        author:users!posts_uuid_fkey(
          username,
          profile_picture_url
        ),
        author_profile:public_profiles!posts_username_fkey(
          profile_picture_url
        ),
        postLikes:postLikes(count)
      `, { count: 'exact' })
      .not('postId', 'in', `(
        SELECT post_id FROM viewed_posts WHERE user_id = '${userId}'
      )`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching unviewed posts:', error);
      return res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }

    // Get user's likes for these posts
    let userLikes = [];
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.postId);
      const { data: likes } = await supabase
        .from('postLikes')
        .select('post_uuid')
        .eq('user_uuid', userId)
        .in('post_uuid', postIds);
      
      userLikes = likes?.map(like => like.post_uuid) || [];
    }

    // Format the response
    const formattedPosts = posts.map(post => {
      const profile_picture_url = 
        post.author?.profile_picture_url || 
        post.author_profile?.profile_picture_url || 
        null;

      const is_liked = userLikes.includes(post.postId);
      const total_likes = post.postLikes?.[0]?.count || 0;

      return {
        postId: post.postId,
        created_at: post.created_at,
        title: post.title,
        description: post.description,
        image_url: post.image_url,
        tags: post.tags,
        username: post.username,
        total_comments: post.total_comments || 0,
        total_likes,
        is_liked,
        profile_picture_url,
        profilePictureUrl: profile_picture_url
      };
    });

    // Record views for these posts
    if (formattedPosts.length > 0) {
      formattedPosts.forEach(post => {
        recordViewedPost(userId, post.postId).catch(err => 
          console.error('Background view recording failed:', err)
        );
      });
    }

    const response = {
      success: true,
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0),
        showing: formattedPosts.length
      }
    };

    console.log(`Unviewed posts response - Returning ${formattedPosts.length} posts`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Unviewed posts error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Mobile-compatible version of getPosts that returns data in the format mobile app expects
async function getPostsForMobile(req, res) {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    console.log(`Mobile feed request - User: ${userId}, Page: ${page}, Limit: ${limit}`);

    // Get posts with all needed data
    const { data: posts, error } = await supabase
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
        uuid,
        author:users!posts_uuid_fkey(
          username,
          profile_picture_url
        ),
        author_profile:public_profiles!posts_username_fkey(
          profile_picture_url
        ),
        postLikes:postLikes(count)
      `)
      .order('total_comments', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts for mobile:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get like details for current user (if authenticated)
    let userLikes = [];
    if (userId && posts && posts.length > 0) {
      const postIds = posts.map(p => p.postId);
      const { data: likes } = await supabase
        .from('postLikes')
        .select('post_uuid')
        .eq('user_uuid', userId)
        .in('post_uuid', postIds);
      
      userLikes = likes?.map(like => like.post_uuid) || [];
    }

    // Transform data to mobile format
    const mobilePosts = posts.map(post => {
      const profile_picture_url = 
        post.author?.profile_picture_url || 
        post.author_profile?.profile_picture_url || 
        null;

      const is_liked = userLikes.includes(post.postId);
      const total_likes = post.postLikes?.[0]?.count || 0;

      return {
        id: post.postId,                    // Mobile expects 'id'
        PostID: post.postId,                // Legacy support
        Username: post.username,            // Mobile expects 'Username'
        PostText: post.description,         // Mobile expects 'PostText'
        content: post.description,          // Alternative field
        ImageURL: post.image_url,           // Mobile expects 'ImageURL'
        Time: post.created_at,              // Mobile expects 'Time'
        created_at: post.created_at,        // Alternative field
        Likes: total_likes,                 // Mobile expects 'Likes'
        Comments: post.total_comments || 0, // Mobile expects 'Comments'
        userAvatar: profile_picture_url,    // Mobile expects 'userAvatar'
        title: post.title,
        tags: post.tags,
        is_liked,
        total_likes,
        total_comments: post.total_comments || 0
      };
    });

    // Record views asynchronously
    if (userId && mobilePosts.length > 0) {
      mobilePosts.forEach(post => {
        recordViewedPost(userId, post.id).catch(err => 
          console.error('Background view recording failed:', err)
        );
      });
    }

    console.log(`Mobile feed response - Returning ${mobilePosts.length} posts`);
    return res.status(200).json(mobilePosts); // Return direct array for mobile

  } catch (error) {
    console.error('Mobile feed algorithm error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}

// Export controller functions for use in routes
export { 
  getPosts, 
  getUnviewedPosts,
  addPostComment, 
  getPostComments, 
  addPostLike, 
  getPostById, 
  deletePost, 
  getPostViewAnalytics,
  getPostsForMobile
}