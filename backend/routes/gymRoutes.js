import express, { json } from "express";
import { addUserGym, getUserGyms, getGymsByProvince, removeUserGym, getPeopleByGymFrequented, getGymById, getNearbyGyms } from "../controllers/gymController.js";
import { verifyAuth } from "../middlewares/auth_verify.js";
const router = express.Router();


router.post("/api/addUserGym", verifyAuth, addUserGym);
router.get("/api/getUserGyms/:name", verifyAuth, getUserGyms);
router.get("/api/getGymsByProvince/:province", getGymsByProvince);
router.post("/api/removeUserGym", verifyAuth, removeUserGym);
router.get("/api/getPeopleByGymFrequented/:gymId", verifyAuth, getPeopleByGymFrequented);

// Mobile compatibility routes
router.get("/api/gym/:gymId", getGymById); // Mobile expects /api/gym/:gymId
router.get("/gyms/nearby", getNearbyGyms); // Mobile expects /gyms/nearby

export default router;
