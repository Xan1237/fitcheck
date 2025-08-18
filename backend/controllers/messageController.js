import { supabase } from '../config/supabaseApp.js'
import { userNameToUuid, uuidToUsername } from '../utils/usernameToUuid.js';
async function newChat(req, res) {
    const {targetUserName} = req.body;
    const userId = req.user.id;
    console.log("New chat initiated");
    const targetUserId = await userNameToUuid(targetUserName);
    console.log("Target user ID:", targetUserId);
    try {
        const { data, error } = await supabase
            .from('chats')
            .insert([{
                uuid1: targetUserId,
                uuid2: userId
            }]);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Chat created successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to create chat"
        });
    }
}

async function newMessage(req, res) {
    const { chatId, message } = req.body;
    const ownerUUID = req.user.id;
    console.log("New message received", chatId, message, ownerUUID);
    // Validate required fields
    if (!chatId || !message || !ownerUUID) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields"
        });
    }

    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                chat_id: chatId,
                text: message,
                ownerUUID: ownerUUID,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            data: data[0]
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to send message"
        });
    }
}

async function getUserChats(req, res) {
    const userId = req.user.id;


    try {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .or(`uuid1.eq.${userId},uuid2.eq.${userId}`);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        console.log("User chats data:", data);
        for(let i = 0; i < data.length; i++) {
            let obj = data[i];
            if (obj.uuid1 === userId) {
                obj.uuid2= await uuidToUsername(obj.uuid2);
                obj.uuid1 = "You";
            } else {
                obj.uuid1= await uuidToUsername(obj.uuid1);
                obj.uuid2 = "You";
            }
            
        }

        res.status(200).json({
            success: true,
            chats: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to retrieve user chats"
        });
    }
}

async function getChatMessages(req, res) {
    const { chatId } = req.body;
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }   
        res.status(200).json({
            success: true,
            messages: data
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Failed to retrieve chat messages"
        });
    }
}

export { newChat, newMessage, getUserChats, getChatMessages };