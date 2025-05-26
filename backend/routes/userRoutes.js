import express, { json } from "express";
import {
  getAdress,
  profile,
  userInfo,
  getGymData,
  getUserName,
} from "../controllers/userController.js"; // Updated import
import { createComment, getComments } from "../controllers/commentControler.js";
import { signUpUser } from "../middlewares/auth_signup_password.js";
import { signInUser } from "../middlewares/auth_signin_password.js";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { checkProfileOwnership } from "../middlewares/check_profile_ownership.js";
import { addPersonalRecord } from "../controllers/userController.js";

const router = express.Router();

// Define the routes
router.post("/api/comment", verifyAuth, createComment);
router.post("/api/address", getAdress);
router.get("/api/GetComments", getComments);
router.post("/auth/signup", signUpUser);
router.post("/auth/signin", signInUser);
router.post("/api/profile", profile);
router.get("/api/GetUserData", userInfo);
router.get("/api/getGymData", getGymData);
router.post("/api/getUserName", getUserName);
router.get("/api/checkProfileOwnership/:username", verifyAuth, checkProfileOwnership);
router.post("/api/addPersonalRecord", verifyAuth, addPersonalRecord);


export default router;