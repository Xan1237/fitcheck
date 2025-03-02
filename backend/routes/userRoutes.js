import express, { json } from "express";
import { createComment, getAdress, getComments} from "../controllers/userController.js"; // Correct import

const router = express.Router();
// Define the route for creating a comment
router.post("/api/comment", createComment);
router.post("/api/address", getAdress)
router.get("/api/GetComments", getComments)

export default router;
