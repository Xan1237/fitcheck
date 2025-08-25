import express, { json } from "express";
import {  getPosts, addPostLike, getPostById, deletePost } from "../controllers/postController.js";
import {getNumberPR, getNumberPosts, updateUserBio, getUserBio, isFollowing} from "../controllers/profileController.js"
import { verifyAuth } from "../middlewares/auth_verify.js";
const router = express.Router();

router.get("/api/posts", verifyAuth, getPosts);
router.post("/api/isFollowing", verifyAuth, isFollowing);
router.get("/api/addPostLike/:postId", verifyAuth, addPostLike);
import { optionalAuth } from "../middlewares/optional_auth.js";

router.get("/api/post/:postId", optionalAuth, getPostById);
router.delete("/api/post/:postId", verifyAuth, deletePost);

export default router;
