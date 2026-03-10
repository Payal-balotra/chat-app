import express  from "express";
import { register, verifyOtp } from "./auth.controller";
import { numberValidation } from "../../middleware/message.middleware";

const router = express.Router();

router.post("/register",numberValidation,register);
router.post("/verify-otp", numberValidation,verifyOtp);
// router.get("/check", verifyToken);

export default router;
