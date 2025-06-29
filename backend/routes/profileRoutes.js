import express, { json } from "express";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { newFollower } from "../controllers/followerComtroller.js";
import { getFollowerCount } from "../controllers/followerComtroller.js";
import { getFollowingCount } from "../controllers/followerComtroller.js";
const router = express.Router();

router.post("/api/newFollower", verifyAuth, newFollower);
router.get("/api/getFollowerCount/:username", verifyAuth, getFollowerCount);
router.get("/api/getFollowingCount/:username", verifyAuth, getFollowingCount)

export default router;