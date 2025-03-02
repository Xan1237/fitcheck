import express from "express";
import { createComment, getAdress} from "../controllers/userController.js"; // Correct import

const router = express.Router();
router.use(express.json)
// Define the route for creating a comment
router.post("/api/comment", createComment);
router.get("/api/adress", getAdress)

export default router;
