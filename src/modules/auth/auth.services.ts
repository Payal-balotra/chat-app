import redis from "../../config/redis";
import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "../../config/sns";


export const setOtpRedis = (phone: string, otp: string) => {
  redis.set(`otp:${phone}`, JSON.stringify({ otp, attempts: 0 }), "EX", 300);
};


export const createMessage = async (phone: string, otp: string) => {
  try {
    const message = `Your OTP is ${otp}`;

    const command = new PublishCommand({
      Message: message,
      PhoneNumber: phone,
    });

    const response = await snsClient.send(command);

    return response;
  } catch (error) {
    console.error("SNS Error:", error);
    return null;
  }
};