import { twilioClient } from "../utils/twilio";
import redis from "../utils/redis";
import { generateOTP } from "../utils/otpGenerator";
import { Request, Response } from "express";
import { errorResponse, response } from "../utils/response";
import catchAsync from "../utils/catchAsync";
import { createMessage, setOtpRedis } from "../services/auth.services";

export const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return errorResponse(res, 400, "Phone number required");
  }

  const otp = generateOTP();
  setOtpRedis(phone, otp);
  const result = createMessage(phone, otp);
  if (!result) {
    errorResponse(res, 500, "Error in sending message");
  }

  return response(res, 200, "Otp sent successfully", true);
});

export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;

  const data = await redis.get(`otp:${phone}`);

  if (!data) {
    return errorResponse(res, 400, "OTP expired or not found");
  }
  
  const record = JSON.parse(data);

  if (record.attempts >= 3) {
    await redis.del(`otp:${phone}`);
    return errorResponse(res, 429, "Too many attempts");
  }

  if (record.otp !== otp) {
    record.attempts += 1;

    const ttl = await redis.ttl(`otp:${phone}`);

    await redis.set(`otp:${phone}`, JSON.stringify(record), "EX", ttl);
    return errorResponse(res, 400, "Invalid OTP");
  }

  await redis.del(`otp:${phone}`);

  res.json({ message: "OTP verified successfully" }); 
   // add user to db 
   // jwt token with user_id 
   // permanent connection established 
});
