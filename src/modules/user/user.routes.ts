import express from "express";
import { createProfile, createUser, getAllUsers } from "./user.controller";
import { numberValidation } from "../../middleware/message.middleware";
const router = express.Router();

// router.post("/create-user", createUser);
router.post("/profile/:id", createProfile);
router.get("/all-users",getAllUsers)
export default router;  
