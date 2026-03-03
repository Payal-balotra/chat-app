import express from "express";
import { createProfile, createUser } from "./user.controller";
import { numberValidation } from "../../middleware/message.middleware";
const router = express.Router();

router.post("/create-user", createUser);
router.post("/profile/:id", createProfile);
export default router;
