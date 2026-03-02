import redis from "../../config/redis";
import { twilioClient } from "../../config/twilio";
import { config } from "../../config/config";

export const createMessage = async (phone: string, otp: string) => {
  try {
    await twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: config.twilioNumber,
      to: phone,
    });
    return true;
  } catch (err) {
    return false;
  }
};
export const setOtpRedis = (phone: string, otp: string) => {
  redis.set(`otp:${phone}`, JSON.stringify({ otp, attempts: 0 }), "EX", 300);
};
