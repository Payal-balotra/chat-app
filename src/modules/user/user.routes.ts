import express from "express";
import { createProfile, createUser } from "./user.controller";
import { numberValidation } from "../../middleware/auth.middleware";
const router = express.Router();

router.post("/create-user",numberValidation,createUser);
router.post("/profile/:id",createProfile)
export default router;
