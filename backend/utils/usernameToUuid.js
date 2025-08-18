import { supabase } from '../config/supabaseApp.js'

async function userNameToUuid(username) {
    const {data: userData, error: userError} = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
    if (userError) {
        return;
    }
    return userData.id
}

async function uuidToUsername(uuid) {
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

export { userNameToUuid, uuidToUsername }