import { supabase } from '../config/supabaseApp.js'


// Middleware to verify JWT token from Supabase Auth
const verifyAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return res
        .status(401)
        .json({ success: false, error: "Authorization header is required" });
    }
  
    const token = authHeader.split("Bearer ")[1];
  
    try {
      // First, get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      // Try to refresh the session if it exists
      if (session) {
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError) {
          throw refreshError;
        }
      }

      // Now verify the user with potentially refreshed token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error("Token verification failed:", error);
        return res.status(401).json({
          success: false,
          error: "Invalid or expired authentication token",
        });
      }
      
      // Add both user and fresh session data to request object
      req.user = user;
      req.session = session;

      next();
    } catch (error) {
      console.error("Auth verification error:", error);
      return res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }
  };

  export { verifyAuth };