import { supabase } from '../config/supabaseApp.js'

async function getNumberPR(req, res){
    const { username } = req.params;
    const { count, error } = await supabase
        .from('pr')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);
    if(!error){
        res.status(200).json({pr_count: count})
    }
    if(error){
        res.status(400).json({"message": error})
    }
}

async function getNumberPosts(req, res){
    const { username } = req.params;
        const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('username', username);
    if(!error){
        res.status(200).json({post_count: count})
    }
    if(error){
        res.status(400).json({"message": error})
    }
}


export {getNumberPR, getNumberPosts}