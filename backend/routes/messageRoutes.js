import express, { json } from "express";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { newChat } from "../controllers/messageController.js";
import { newMessage } from "../controllers/messageController.js"; // Ensure this is imported if needed
const router = express.Router();

router.post("/api/newChat", verifyAuth, newChat);
router.post("/api/newMessage", verifyAuth, newMessage); // Ensure this is imported if needed

export default router;
