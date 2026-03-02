import express from "express";
import { register, verifyOtp } from "./auth.controller";
import { numberValidation } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/register", numberValidation, register);
router.post("/verify-otp", numberValidation, verifyOtp);

export default router;
