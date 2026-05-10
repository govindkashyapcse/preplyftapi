
// import Redis from "ioredis";

// let redis ;
// const connectRedis = ()=> {
  
//   if (redis) return redis;

//   const host = process.env.REDIS_HOST;
//   const password = process.env.REDIS_PASSWORD;
//   const port = parseInt(process.env.REDIS_PORT);
//   const username = process.env.REDIS_USERNAME;
//   if (!host) throw new Error("REDIS_URL is not defined in environment variables");

//   redis = new Redis({
//     port: port,
//     host: host,
//     username: username,
//     password: password,
//   });

//   redis.on("connect", () => console.log("✅ Redis connected"));
//   redis.on("error", (err) => console.error("❌ Redis error:", err));
//   redis.on("reconnecting", () => console.warn("⚠️  Redis reconnecting..."));

//   return redis;
// };

// export { redis, connectRedis };

import Redis from "ioredis";

const getRedisConfig = () => {
  const host = process.env.REDIS_HOST;
  if (!host) throw new Error("REDIS_HOST is not defined");

  return {
    host,
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    lazyConnect: false, // Ensures it starts connecting immediately
  };
};

// 1. Initialize immediately so the export is never undefined
const redis = new Redis(getRedisConfig());

// 2. Attach listeners for debugging
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

// 3. Keep connectRedis for compatibility, but it just returns the instance
const connectRedis = () => redis;

export { redis, connectRedis };
