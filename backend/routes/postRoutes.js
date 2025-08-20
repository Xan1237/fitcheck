import express, { json } from "express";
import {  getPosts } from "../controllers/postController.js";
import {getNumberPR, getNumberPosts, updateUserBio, getUserBio, isFollowing} from "../controllers/profileController.js"
import { addPostLike } from "../controllers/postController.js"; 
import { verifyAuth } from "../middlewares/auth_verify.js";
const router = express.Router();

router.get("/api/getPosts",verifyAuth, getPosts);
router.post("/api/isFollowing", verifyAuth, isFollowing);
router.get("/api/addPostLike/:postId", verifyAuth, addPostLike);


export default router;
