import express, { json } from "express";
import { addUserGym, getUserGyms } from "../controllers/gymController.js";
import { verifyAuth } from "../middlewares/auth_verify.js";
const router = express.Router();


router.post("/api/addUserGym", verifyAuth, addUserGym);
router.get("/api/getUserGyms", verifyAuth, getUserGyms);
export default router;
