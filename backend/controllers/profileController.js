// Import Supabase client for database operations
import { supabase } from '../config/supabaseApp.js'
import { userNameToUuid, uuidToUsername } from '../utils/usernameToUuid.js';
/**
 * Updates the bio for a user.
 * Expects bio in req.body and user ID from verified token.
 * Returns success message on successful update.
 */
async function updateUserBio(req, res) {
    try {
       
        const username = await uuidToUsername(req.user.id);
        const { bio } = req.body;
        console.log(bio)
        console.log(username)

        if (!bio || typeof bio !== 'string') {
            return res.status(400).json({
                success: false,
                error: "Bio is required and must be a string"
            });
        }

        if (bio.length > 500) {
            return res.status(400).json({
                success: false,
                error: "Bio must be less than 500 characters"
            });
        }

        // Update the user's bio in the profiles table
        const { data, error } = await supabase
            .from('public_profiles')
            .update({ bio: bio})
            .eq('username', username)
            .select('bio');

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to update bio"
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User profile not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Bio updated successfully",
            bio: data[0].bio
        });

    } catch (error) {
        console.error('Update bio error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

/**
 * Gets the current bio for a user.
 * Expects user ID from verified token.
 * Returns the user's current bio.
 */
async function getUserBio(req, res) {
    try {
        const userId = req.user.id;

        // Get the user's bio from the profiles table
        const { data, error } = await supabase
            .from('profiles')
            .select('bio')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch bio"
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                error: "User profile not found"
            });
        }

        res.status(200).json({
            success: true,
            bio: data.bio || ""
        });

    } catch (error) {
        console.error('Get bio error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

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

async function isFollowing(req, res){
    const { targetUserName} = req.body;
    console.log(targetUserName)
    const senderUserId = req.user.id;
    const targetUserId = await userNameToUuid(targetUserName);
    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('senderUserId', senderUserId)
        .eq('targetUserId', targetUserId);
    if(!error){
        res.status(200).json({isFollowing: data.length > 0})
    }
    if(error){
        console.log(error)
        res.status(400).json({"message": error})
    }
}

async function getProfilePicture(req, res) {
    try {
        const username = req.params.username;

        // Get the user's profile picture from the profiles table
        const { data, error } = await supabase
            .from('public_profiles')
            .select('profile_picture_url')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch profile picture"
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                error: "User profile not found"
            });
        }

        res.status(200).json({
            success: true,
            profile_picture: data || ""
        });

    } catch (error) {
        console.error('Get profile picture error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
}

// Export controller functions for use in routes
export {getNumberPR, getNumberPosts, updateUserBio, getUserBio, isFollowing, getProfilePicture}