// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'

/**
 * Gets the number of PR (personal record) entries for a user.
 * Expects username in req.params.
 * Returns the count of PRs from the 'pr' table for the user.
 */
async function getNumberPR(req, res){
    const { username } = req.params;
    // Query PR count for the user
    const { count, error } = await supabase
        .from('pr')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);
    // Success response with PR count
    if(!error){
        res.status(200).json({pr_count: count})
    }
    // Error response
    if(error){
        res.status(400).json({"message": error})
    }
}

/**
 * Gets the number of posts for a user.
 * Expects username in req.params.
 * Returns the count of posts from the 'posts' table for the user.
 */
async function getNumberPosts(req, res){
    const { username } = req.params;
    // Query post count for the user
    const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);
    // Success response with post count
    if(!error){
        res.status(200).json({post_count: count})
    }
    // Error response
    if(error){
        res.status(400).json({"message": error})
    }
}

// Export controller functions for use in routes
export {getNumberPR, getNumberPosts}