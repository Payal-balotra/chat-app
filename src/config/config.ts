import dotenv from "dotenv";
import { configSchema } from "../validations/config.validations";
dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  secretKey : string;
  redisUrl : string;
  corsOrigin : string;
  // twilioSid: string;
  // twilioToken: string;
  // twilioNumber: string;
  // awsAccessKey : string;
  // awsSecretKey : string;
  // awsRegion : string;

}

const parsedData = configSchema.safeParse(process.env);
if (!parsedData.success) {
  console.error(" Invalid environment variables:");

  console.error(parsedData.error.format());
  process.exit(1);
}

export const config: Config = {
  port: Number(process.env.PORT),
  mongoUri: String(process.env.MONGO_URI),
  secretKey : String(process.env.SECRET_KEY),
  redisUrl : String(process.env.REDIS_URL),
  corsOrigin : String(process.env.CORS_ORIGIN)
  // twilioSid: String(process.env.TWILIO_ACCOUNT_SID),
  // twilioToken: String(process.env.TWILIO_AUTH_TOKEN),
  // twilioNumber: String(process.env.TWILIO_PHONE_NUMBER),
  // awsAccessKey : String(process.env.AWS_ACCESS_KEY_ID),
  // awsSecretKey  : String(process.env.AWS_SECRET_ACCESS_KEY),
  // awsRegion : String(process.env.AWS_REGION)
};
