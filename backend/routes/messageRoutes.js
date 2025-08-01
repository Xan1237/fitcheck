import express, { json } from "express";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { newChat } from "../controllers/messageController.js";
import { newMessage } from "../controllers/messageController.js"; 
import { getUserChats } from "../controllers/messageController.js";
import { getChatMessages } from "../controllers/messageController.js";
const router = express.Router();

router.post("/api/newChat", verifyAuth, newChat);
router.post("/api/newMessage", verifyAuth, newMessage);
router.get("/api/getUserChats", verifyAuth, getUserChats);
router.post("/api/getChatMessages", verifyAuth, getChatMessages);

export default router; 
