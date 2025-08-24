import { supabase } from '../config/supabaseApp.js';

export const validateGoogleToken = async (req, res) => {
    const { token, provider_token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token is required'
        });
    }

    try {
        // Verify the Google token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Token validation error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // At this point, the token is valid. Generate a new session token
        const { data: session, error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: provider_token
        });

        if (sessionError) {
            console.error('Session creation error:', sessionError);
            return res.status(500).json({
                success: false,
                message: 'Failed to create session'
            });
        }

        // Return the validated session token
        return res.status(200).json({
            success: true,
            token: session.session.access_token,
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Unexpected error during Google token validation:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
