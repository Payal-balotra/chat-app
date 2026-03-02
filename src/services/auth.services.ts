import redis from "../utils/redis";
import { twilioClient } from "../utils/twilio";
import { config } from "../config/config";


export const createMessage =async (phone: string, otp: string) => {
 await twilioClient.messages.create({
    body: `Your OTP is ${otp}`,
    from: config.twilioNumber,
    to: phone,
  });
  return true
};
export const setOtpRedis = (phone : string , otp : string) =>{
      redis.set(
    `otp:${phone}`,
    JSON.stringify({ otp, attempts: 0 }),
    "EX",
    300,
  );
}
