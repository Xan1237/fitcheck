import express, { json } from "express";
import { verifyAuth } from "../middlewares/auth_verify.js";
import { newChat, newMessage, getUserChats, getChatMessages, getChatMessagesById, getUserChatsForMobile } from "../controllers/messageController.js";
const router = express.Router();

router.post("/api/newChat", verifyAuth, newChat);
router.post("/api/newMessage", verifyAuth, newMessage);
router.get("/api/getUserChats", verifyAuth, getUserChats);
router.post("/api/getChatMessages", verifyAuth, getChatMessages);

// Mobile compatibility routes
router.get("/api/chats", verifyAuth, getUserChatsForMobile); // Mobile expects /api/chats with direct array response
router.get("/api/messages/:chatId", verifyAuth, getChatMessagesById); // Mobile expects /api/messages/:chatId
router.post("/api/messages", verifyAuth, newMessage); // Mobile expects /api/messages instead of /api/newMessage

export default router; 
