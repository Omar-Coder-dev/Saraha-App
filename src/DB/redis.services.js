import { redisClient } from "../DB/redis.connection.js";

export const set = async ({ key, value, ttl = null }) => {
    try {
        const data = typeof value !== "string" ? JSON.stringify(value) : value;
        if (ttl) {

            return await redisClient.set(key, data, { EX: ttl }); 
        } else {
            return await redisClient.set(key, data);
        }
    } catch (error) {
        console.error("Redis Set Error : ", error);
    }
}

export const get = async ({ key }) => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.error("Redis Get Error : ", error);
  }
};

export const update = async ({ key, value, ttl = null }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) {
      return false;
    }
    return await set({ key, value, ttl });
  } catch (error) {
    console.error("Redis Update Error : ", error);
  }
};

export const deleteByKey = async ({ key }) => {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.error("Redis Delete Error : ", error);
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.error("Redis Expire Error : ", error);
  }
};

export const ttl = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Redis TTL Error : ", error);
  }
};

export const getKeysByPrefix = async (prefix) => {
  try {
    return await redisClient.keys(`${prefix}*`);
  } catch (error) {
    console.error("Redis Get Keys By Prefix Error : ", error);
  }
};
