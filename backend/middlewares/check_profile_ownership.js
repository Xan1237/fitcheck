import { supabase } from '../config/supabaseApp.js';


const checkProfileOwnership = async (req, res) => {
    try {
      const { username } = req.params;
      
      // Get the current user's username from the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', req.user.id)
        .single();
  
      if (userError) {
        console.error("Error fetching user data:", userError);
        return res.status(500).json({ error: 'Error fetching user data' });
      }
  
      // Check if the username matches
      const isOwner = userData.username === username;
      
      res.status(200).json({ isOwner });
    } catch (error) {
      console.error("Error checking profile ownership:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  export { checkProfileOwnership };