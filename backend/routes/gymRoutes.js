import express, { json } from "express";
import { addUserGym, getUserGyms, getGymsByProvince, removeUserGym } from "../controllers/gymController.js";
import { verifyAuth } from "../middlewares/auth_verify.js";
const router = express.Router();


router.post("/api/addUserGym", verifyAuth, addUserGym);
router.get("/api/getUserGyms/:name", verifyAuth, getUserGyms);
router.get("/api/getGymsByProvince/:province", getGymsByProvince);
router.post("/api/removeUserGym", verifyAuth, removeUserGym);
export default router;
