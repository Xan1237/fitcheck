import { supabase } from '../config/supabaseApp.js'

function getPosts(req, res) {
    const { username } = req.params;

    supabase
        .from('posts')
        .select('*')
        .then(({ data, error }) => {
            if (error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(200).json(data);
        });
}

export { getPosts };