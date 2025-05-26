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
      // Verify the JWT with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error("Token verification failed:", error);
        return res.status(401).json({
          success: false,
          error: "Invalid or expired authentication token",
        });
      }
      
      // Add user data to request object
      req.user = user;

      //Passes the user data to the next middleware
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