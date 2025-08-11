import { supabase } from '../config/supabaseApp.js'

async function uuidToUserName(uuid) {
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', uuid)
        .single();

    if (userError) {
        throw new Error('User not found');
    }
    
    return userData.username;
}

export { uuidToUserName }