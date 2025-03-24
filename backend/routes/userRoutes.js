import express, { json } from "express";
import {
  createComment,
  getAdress,
  getComments,
  profile,
  userInfo,
  getGymData,
  recalculateAllGymTags,
  debugAndFixGymTags,
} from "../controllers/userController.js"; // Updated import
import { signUpUser } from "../middlewares/auth_signup_password.js";
import { signInUser } from "../middlewares/auth_signin_password.js";
const router = express.Router();
// Define the route for creating a comment
router.post("/api/comment", createComment);
router.post("/api/address", getAdress);
router.get("/api/GetComments", getComments);
router.post("/auth/signup", signUpUser);
router.post("/auth/signin", signInUser);
router.post("/api/profile", profile);
router.get("/api/GetUserData", userInfo);
router.get("/api/getGymData", getGymData); // New endpoint for getting gym data with tags
router.post("/api/recalculateAllGymTags", recalculateAllGymTags); // Optional: Admin route to force recalculation
router.get("/api/debugGymTags/:gymId", debugAndFixGymTags); // Debug route for fixing tag issues
export default router;
