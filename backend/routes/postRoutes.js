import express, { json } from "express";
import {  getPosts } from "../controllers/postController.js";
const router = express.Router();

router.get("/api/getPosts", getPosts);



export default router;
