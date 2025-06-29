import { supabase } from '../config/supabaseApp.js'

async function userNameToUuid(username){
    const {data: userData, error: userError} = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()
    return userData.id
}

export {userNameToUuid}