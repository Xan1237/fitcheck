import express, { json } from "express";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { newFollower, getFollowerCount, getFollowingCount, getFollowers, getFollowing, followUser } from "../controllers/followerComtroller.js";
import {getNumberPR, getNumberPosts, updateUserBio, getUserBio, getProfilePicture} from "../controllers/profileController.js"
import { uploadProfilePicture } from "../controllers/userController.js"
const router = express.Router();

router.post("/api/newFollower", verifyAuth, newFollower);
router.get("/api/getFollowerCount/:username", verifyAuth, getFollowerCount);
router.get("/api/getFollowingCount/:username", verifyAuth, getFollowingCount)
router.get("/api/getNumberPR/:username", verifyAuth, getNumberPR)
router.get("/api/getNumberPost/:username", verifyAuth, getNumberPosts)
router.get("/api/getProfilePicture/:username", getProfilePicture);
router.get("/api/followers/:username", verifyAuth, getFollowers);
router.get("/api/following/:username", verifyAuth, getFollowing);
// Bio management routes
router.get("/api/getUserBio", verifyAuth, getUserBio);
router.put("/api/updateUserBio", verifyAuth, updateUserBio);

// Mobile compatibility routes
router.post("/api/follow", verifyAuth, followUser); // Mobile expects /api/follow with userId instead of targetUserName
router.post("/api/profile/image", verifyAuth, uploadProfilePicture); // Mobile expects /api/profile/image
router.put("/api/profile/bio", verifyAuth, updateUserBio); // Mobile expects /api/profile/bio

export default router