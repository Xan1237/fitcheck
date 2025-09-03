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

    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('senderUserId', senderUserName)
        .eq('targetUserId', targetUserId);
    if(data.length > 0){
        const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('senderUserId', senderUserName)
        .eq('targetUserId', targetUserId);
        if(error){
            return res.status(400).json({error: error.message})
        }
        else{
            return res.status(200).json({message: 'Follower removed successfully'})
        }
    }
    else{

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

async function unfollowUser(req, res){
    const { targetUserName } = req.body;
    const senderUserId = req.user.id;
    const targetUserId = await userNameToUuid(targetUserName);
    const { data, error } = await supabase
        .from('follows')
        .delete()
        .eq('senderUserId', senderUserId)
        .eq('targetUserId', targetUserId);
}

/**
 * Gets all followers for a given username
 * Expects username in req.params
 */
async function getFollowers(req, res) {
    const { username } = req.params;
    const userId = await userNameToUuid(username);

    if (!userId) {
        return res.status(400).json({ error: 'Invalid username' });
    }

    // Query for followers - people who are following the user (where user is the target)
    const { data, error } = await supabase
        .from('follows')
        .select(`
            senderUserId,
            targetUserId,
            follower:users!follows_senderUserId_fkey (
                username,
                profile_picture_url
            )
        `)
        .eq('targetUserId', userId);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // Process the results - get the followers' details
    const followers = data.map(connection => ({
        username: connection.follower.username,
        profilePicture: connection.follower.profile_picture_url
    }));

    return res.status(200).json({
        followers,
        followerCount: followers.length
    });
}

/**
 * Gets all users that a given username is following
 * Expects username in req.params
 */
async function getFollowing(req, res) {
    const { username } = req.params;
    const userId = await userNameToUuid(username);

    if (!userId) {
        return res.status(400).json({ error: 'Invalid username' });
    }

    // Query for following - people who the user is following (where user is the sender)
    const { data, error } = await supabase
        .from('follows')
        .select(`
            senderUserId,
            targetUserId,
            following:users!follows_targetUserId_fkey (
                username,
                profile_picture_url
            )
        `)
        .eq('senderUserId', userId);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // Process the results - get the following users' details
    const following = data.map(connection => ({
        username: connection.following.username,
        profilePicture: connection.following.profile_picture_url
    }));

    return res.status(200).json({
        following,
        followingCount: following.length
    });
}

// Mobile-compatible follow function that accepts userId instead of targetUserName
async function followUser(req, res) {
    const { userId } = req.body; // Mobile sends userId instead of targetUserName
    const senderUserName = req.user.id;

    // Validate input
    if (!senderUserName || !userId) {
        return res.status(400).json({ error: 'Sender and target user IDs are required' });
    }

    try {
        // Check if already following
        const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('senderUserId', senderUserName)
            .eq('targetUserId', userId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data.length > 0) {
            // Already following, so unfollow
            const { error: deleteError } = await supabase
                .from('follows')
                .delete()
                .eq('senderUserId', senderUserName)
                .eq('targetUserId', userId);

            if (deleteError) {
                return res.status(400).json({ error: deleteError.message });
            }

            return res.status(200).json({ message: 'Unfollowed successfully', following: false });
        } else {
            // Not following, so follow
            const { error: insertError } = await supabase
                .from('follows')
                .insert({
                    senderUserId: senderUserName,
                    targetUserId: userId
                });

            if (insertError) {
                return res.status(400).json({ error: insertError.message });
            }

            return res.status(200).json({ message: 'Followed successfully', following: true });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Export controller functions for use in routes
export {
    newFollower,
    getFollowerCount,
    getFollowingCount,
    unfollowUser,
    getFollowers,
    getFollowing,
    followUser
}