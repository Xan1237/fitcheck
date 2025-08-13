import { supabase } from '../config/supabaseApp.js'

async function userNameToUuid(username) {
    const {data: userData, error: userError} = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
    if (userError) {
        throw new Error('User not found');
    }
    return userData.id
}

async function uuidToUserName(uuid) {
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('id', uuid)
        .single()
    if (userError) {
        return
    }
    return userData.username;
}

export { userNameToUuid, uuidToUserName }