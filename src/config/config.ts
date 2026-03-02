import dotenv from "dotenv";
import { configSchema } from "../validations/config.validations";
dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  twilioSid: string;
  twilioToken: string;
  twilioNumber: string;
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
  twilioSid: String(process.env.TWILIO_ACCOUNT_SID),
  twilioToken: String(process.env.TWILIO_AUTH_TOKEN),
  twilioNumber: String(process.env.TWILIO_PHONE_NUMBER),
};
