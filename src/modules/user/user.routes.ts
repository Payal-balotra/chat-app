import express, { Request, Response } from "express";
import { createProfile, createUser, getAllUsers, updateProfile } from "./user.controller";
import { numberValidation } from "../../middleware/message.middleware";
import { verifyToken } from "../../middleware/auth.middleware";
const router = express.Router();

// router.post("/create-user", createUser);
router.post("/profile/:id", createProfile);
router.put("/profile/:id", updateProfile);

router.get("/all-users",getAllUsers);
// router.get("/me",verifyToken,getUser)
export default router;  
