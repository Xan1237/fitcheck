import { supabase } from '../config/supabaseApp.js'
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


function newFollower(req, res){
    const {targetUserName} = req.body
    
}