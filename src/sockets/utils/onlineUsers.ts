import redis from "../../config/redis";

export const addUserSocket = async (userId: string, socketId: string) => {
  await redis.sadd(`online:${userId}`, socketId);
};

export const removeUserSocket = async (userId: string, socketId: string) => {
  await redis.srem(`online:${userId}`, socketId);
};

export const getUserSockets = async (userId: any) => {
  return await redis.smembers(`online:${userId}`);
};

export const getOnlineUsers = async () => {
  const keys = await redis.keys("online:*");
  return keys.map(key => key.split(":")[1]);
};

export const getSocketCount = async (userId: string) => {
  return await redis.scard(`online:${userId}`);
};

export const removeUserKey = async (userId: string) => {
  await redis.del(`online:${userId}`);
};