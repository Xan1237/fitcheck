import { supabase } from '../config/supabaseApp.js'

async function uuidToUsername(uuid) {
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', uuid)
        .single();

    if (userError) {
        return;
    }
    
    return userData.username;
}

export default uuidToUsername;
export  {uuidToUsername};