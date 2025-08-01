import { supabase } from '../config/supabaseApp.js'

async function newChat(req, res) {
    const {targetUserId} = req.body;
    const userId = req.user.id;
    console.log("New chat initiated");
    
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
    const { chatId, message} = req.body;
    const ownerUUID = req.user.id;

    try{
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                chat_id: chatId,
                text: message,
                ownerUUID: ownerUUID
            }]);

        if (error) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Message sent successfully"
        });
    }catch(err) {
    res.status(500).json({
        success: false,
        error: "Failed to send message"
    });
}
}

export { newChat, newMessage };