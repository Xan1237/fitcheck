import { supabase } from '../config/supabaseApp.js';

export const setUsername = async (req, res) => {
    const { username } = req.body;

    try {
        // 1. Get the authenticated user
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Missing token' });
        }
        const token = authHeader.split(' ')[1];

        // Get user info from Supabase Auth
        const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !user) {
            return res.status(401).json({ success: false, message: authErr?.message || 'Invalid token' });
        }

        // 2. Validate username
        if (!username || username.length < 3 || username.length > 20) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username must be between 3 and 20 characters long' 
            });
        }

        // 3. Check if username is already taken
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select("*")
            .eq("username", username);

        if (checkError) {
            console.error('Error checking username:', checkError);
            return res.status(500).json({ 
                success: false, 
                message: 'Error checking username availability' 
            });
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // 4. Update username in users table
        const { error: updateError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                username: username,
                email: user.email,
                updated_at: new Date()
            });

        if (updateError) {
            console.error('Error updating username:', updateError);
            return res.status(500).json({ 
                success: false, 
                message: 'Error updating username' 
            });
        }

        // 5. Update or create public profile
        const { error: publicProfileError } = await supabase
            .from('public_profiles')
            .upsert({
                username: username,
            });

        if (publicProfileError) {
            console.error('Error updating public profile:', publicProfileError);
            // Don't fail the request, but log the error
        }

        // 6. Update user metadata in auth
        const { error: metadataError } = await supabase.auth.updateUser({
            data: { username }
        });

        if (metadataError) {
            console.error('Error updating user metadata:', metadataError);
            // Don't fail the request, but log the error
        }

        return res.status(200).json({
            success: true,
            message: 'Username updated successfully',
            username
        });

    } catch (err) {
        console.error('Unexpected error setting username:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};
