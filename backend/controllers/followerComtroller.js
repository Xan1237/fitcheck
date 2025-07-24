// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'
// Import axios for HTTP requests (not used in this file)
import axios from "axios";
// Import dotenv to load environment variables
import dotenv from "dotenv";
// Import utility to convert username to UUID
import { userNameToUuid } from '../utils/usernameToUuid.js'

// Load environment variables from .env file
dotenv.config();

/**
 * Adds a new follower relationship between the sender and target user.
 * Expects targetUserName in req.body and sender's username in req.user.id.
 * Converts target username to UUID, inserts a new row in 'follows' table.
 */
async function newFollower(req, res){
    // Extract target username from request body
    const {targetUserName} = req.body
    // Get sender's username from authenticated user
    const senderUserName = req.user.id

    // Convert target username to UUID
    const targetUserId = await userNameToUuid(targetUserName)

    // Validate input
    if (!senderUserName || !targetUserId){
        return res.status(400).json({error: 'Sender and target user names are required'})
    }

    // Insert new follower relationship into 'follows' table
    const {data: userData2, error: userError2} = await supabase
    .from('follows')
    .insert({
        senderUserId: senderUserName,
        targetUserId: targetUserId
    })

    // Handle insertion error
    if(userError2){
        return res.status(400).json({error: userError2.message})
    }
    else{
        // Success response
        return res.status(200).json({message: 'Follower added successfully'})
    }
}

/**
 * Gets the follower count for a given username.
 * Expects username in req.params.
 * Queries 'public_profiles' table for follower_count.
 */
async function getFollowerCount(req, res){
    // Extract username from request parameters
    const {username} = req.params
    // Query follower_count from public_profiles table
    const {data: userData, error: userError} = await supabase
    .from('public_profiles')
    .select('follower_count')
    .eq('username', username)
    .single()

    // Handle query error
    if(userError){
        return res.status(400).json({error: userError.message})
    }
    else{
        // Success response with follower count
        return res.status(200).json({follower_count: userData.follower_count})
    }
}

/**
 * Gets the count of users that the given username is following.
 * Expects username in req.params.
 * Converts username to UUID, counts rows in 'follows' table where senderUserId matches.
 */
async function getFollowingCount(req, res){
    // Extract username from request parameters
    const { username } = req.params;
    // Convert username to UUID
    const senderUserId = await userNameToUuid(username);
    if (!senderUserId) {
        return res.status(400).json({ error: 'Invalid username' });
    }
    // Count the number of follows where senderUserId matches
    const { count, error } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('senderUserId', senderUserId);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    // Success response with following count
    return res.status(200).json({ following_count: count });
}

// Export controller functions for use in routes
export {newFollower, getFollowerCount, getFollowingCount}