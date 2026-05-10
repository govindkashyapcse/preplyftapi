const {redis} = require('../config/redis');

const OTP_TTL = Number(process.env.OTP_EXPIRES_IN) * 60; // seconds

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const storeOtp = async (email, otp, purpose) => {
  const key = `otp:${purpose}:${email}`;
  await redis.set(key, otp, 'EX', OTP_TTL);
};

const verifyOtp = async (email, otp, purpose) => {
  const key = `otp:${purpose}:${email}`;
  const stored = await redis.get(key);
  if (!stored || stored !== otp) return false;
  await redis.del(key);
  return true;
};

module.exports = { generateOtp, storeOtp, verifyOtp };
