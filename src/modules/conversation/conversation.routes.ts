import express from "express";
import { conversation } from "./conversation.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/chat",verifyToken,conversation)

export default router;
