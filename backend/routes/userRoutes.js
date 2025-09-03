import express, { json } from "express";
import {
  profile,
  userInfo,
  getGymData,
  getUserName,
  uploadProfilePicture,
  addPersonalRecord,
  updatePersonalRecord,
  deletePersonalRecord,
  createPost,
  getAllUsers,
  getUserPosts,
  getUserStats,
} from "../controllers/userController.js"; // Updated import
import { setUsername } from "../controllers/setUsernameController.js";

import { getAdress } from "../controllers/searchController.js";
import { createComment, getComments } from "../controllers/commentControler.js";
import { signUpUser } from "../middlewares/auth_signup_password.js";
import { signInUser } from "../middlewares/auth_signin_password.js";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { validateGoogleToken } from "../middlewares/validate_google_token.js";
import { checkProfileOwnership } from "../middlewares/check_profile_ownership.js";
import { addPostComment, getPostComments } from "../controllers/postController.js";

const router = express.Router();

// Define the routes
router.post("/api/comment", verifyAuth, createComment);
router.post("/api/address", getAdress);
router.get("/api/GetComments", getComments);
router.post("/auth/signup", signUpUser);
router.post("/auth/signin", signInUser);
router.post("/auth/validate-google-token", validateGoogleToken);
router.post("/api/profile",verifyAuth, profile);
router.get("/api/GetUserData", userInfo);
router.get("/api/getGymData", getGymData);
router.post("/api/getUserName", getUserName);
router.post("/api/set-username", verifyAuth, setUsername);
router.get("/api/checkProfileOwnership/:username", verifyAuth, checkProfileOwnership);
router.post("/api/addPersonalRecord", verifyAuth, addPersonalRecord);
router.put("/api/pr", verifyAuth, updatePersonalRecord);
router.delete("/api/pr", verifyAuth, deletePersonalRecord); 
router.delete("/api/pr/:exerciseName", verifyAuth, deletePersonalRecord);
router.post("/api/uploadProfilePicture", verifyAuth, uploadProfilePicture);
router.post("/api/createPost", verifyAuth, createPost);
router.post("/api/post/:postId/comment", verifyAuth, addPostComment);
router.get("/api/post/:postId/comments", getPostComments);
router.get("/api/getAllUsers", getAllUsers);
// Mobile compatibility routes
router.get("/api/users", getAllUsers); // Mobile expects /api/users instead of /api/getAllUsers
router.post("/api/posts", verifyAuth, createPost); // Mobile expects /api/posts instead of /api/createPost
router.get("/api/user/posts", verifyAuth, getUserPosts); // Mobile expects /api/user/posts
router.get("/api/user/stats", verifyAuth, getUserStats); // Mobile expects /api/user/stats

export default router;