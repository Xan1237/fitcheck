import { supabase } from '../config/supabaseApp.js'
import axios from "axios";
import dotenv from "dotenv";
import { userNameToUuid } from '../utils/usernameToUuid.js'

dotenv.config();


async function newFollower(req, res){
    const {targetUserName} = req.body
    const senderUserName = req.user.id

    const targetUserId = await userNameToUuid(targetUserName)

    if (!senderUserName || !targetUserId){
        return res.status(400).json({error: 'Sender and target user names are required'})
    }

    const {data: userData2, error: userError2} = await supabase
    .from('follows')
    .insert({
        senderUserId: senderUserName,
        targetUserId: targetUserId
    })

    if(userError2){
        return res.status(400).json({error: userError2.message})
    }
    else{
        return res.status(200).json({message: 'Follower added successfully'})
    }
}


async function getFollowerCount(req, res){
    const {username} = req.params
    const {data: userData, error: userError} = await supabase
    .from('public_profiles')
    .select('follower_count')
    .eq('username', username)
    .single()

    if(userError){
        return res.status(400).json({error: userError.message})
    }
    else{
        return res.status(200).json({follower_count: userData.follower_count})
    }
}

async function getFollowingCount(req, res){
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
    return res.status(200).json({ following_count: count });
}






export {newFollower, getFollowerCount, getFollowingCount}