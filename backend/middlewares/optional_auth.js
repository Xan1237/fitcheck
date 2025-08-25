// This middleware allows both authenticated and unauthenticated requests
// If authenticated, it will add the user to req.user, if not, it will continue without it
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseApp.js';

export async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided - continue as unauthenticated
            next();
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            // No token provided - continue as unauthenticated
            next();
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (error || !user) {
                // Invalid token - continue as unauthenticated
                next();
                return;
            }

            // Valid token - add user to request
            req.user = user;
        } catch (err) {
            // Token verification failed - continue as unauthenticated
            console.log('Token verification failed:', err);
        }

        next();
    } catch (error) {
        // Any other error - continue as unauthenticated
        console.error('Auth middleware error:', error);
        next();
    }
}
