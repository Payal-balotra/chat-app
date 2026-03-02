import redis from "../../config/redis";
import { generateOTP } from "../../utils/otpGenerator";
import { Request, Response } from "express";
import { errorResponse, response } from "../../utils/response";
import catchAsync from "../../utils/catchAsync";
import { createMessage, setOtpRedis } from "./auth.services";
import { findUserByPhone, userRegister } from "../user/user.services";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return errorResponse(res, 400, "Phone number required");
  }
  const existingUser = await findUserByPhone(phone);
  if (existingUser && existingUser.isVerified === true) {
    return response(
      res,
      200,
      "This Number is already registered and verified. You can direclty start converstaion. ",
      existingUser,
    );
  }
  if (existingUser && existingUser.isVerified === false) {
    const otp = generateOTP();
    setOtpRedis(phone, otp);
    const result = await createMessage(phone, otp);
    if (!result) {
      return errorResponse(res, 500, "Error in sending message");
    }
    return response(
      res,
      200,
      "This Number is already registered but not verified . Please verify the number by otp.",
      [],
    );
  }

  const otp = generateOTP();
  setOtpRedis(phone, otp);
  const result = createMessage(phone, otp);
  if (!result) {
    return errorResponse(res, 500, "Error in sending message");
  }
  // craete user
  const user = userRegister(phone);
  return response(res, 200, "verify otp please", user);
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
  console.log("OTP verified successfully");

  const user = await findUserByPhone(phone);
  if (user) {
    user.isVerified = true;
    await user.save();
  }

  return response(res, 200, "User registered successfully", user);

  // add user to db
  // jwt token with user_id
  // permanent connection established
});
