import express, { json } from "express";
import { createComment, getAdress, getComments, profile} from "../controllers/userController.js"; // Correct import
import {signUpUser} from '../middlewares/auth_signup_password.js'
import {signInUser} from '../middlewares/auth_signin_password.js'
const router = express.Router();
// Define the route for creating a comment
router.post("/api/comment", createComment);
router.post("/api/address", getAdress)
router.get("/api/GetComments", getComments)
router.post("/auth/signup", signUpUser)
router.post("/auth/signin", signInUser)
router.post("/api/profile", profile)
export default router;
