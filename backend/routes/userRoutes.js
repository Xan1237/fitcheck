import express, { json } from "express";
import {
  getAdress,
  profile,
  userInfo,
  getGymData,
  getUserName
} from "../controllers/userController.js"; // Updated import
import { createComment, getComments } from "../controllers/commentControler.js";
import { signUpUser } from "../middlewares/auth_signup_password.js";
import { signInUser } from "../middlewares/auth_signin_password.js";

const router = express.Router();

// Define the routes
router.post("/api/comment", createComment);
router.post("/api/address", getAdress);
router.get("/api/GetComments", getComments);
router.post("/auth/signup", signUpUser);
router.post("/auth/signin", signInUser);
router.post("/api/profile", profile);
router.get("/api/GetUserData", userInfo);
router.get("/api/getGymData", getGymData);
router.post("/api/getUserName", getUserName);
export default router;