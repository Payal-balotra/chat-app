import Redis from "ioredis";
import { config } from "./config";

const redis = new Redis(
  config.redisUrl  || "redis://127.0.0.1:6379",{
  // host: "127.0.0.1",
  // port: 6379,
  maxRetriesPerRequest: null, 
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;
