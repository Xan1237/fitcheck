import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.supabaseurl
const supabaseKey = process.env.supabaseKey

export const supabase = createClient(supabaseUrl, supabaseKey)
