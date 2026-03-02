import mongoose from "mongoose";
import { config } from "../config/config";

export const connectDb = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("MongoDB Connection error", err);
  }
};
export const dbStatus = () => {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
};
