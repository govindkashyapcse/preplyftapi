const User = require('../models/User');
const { redis } = require('../config/redis');
const { sendOtpEmail } = require('../config/mailer');
const { generateOtp, storeOtp, verifyOtp } = require('../utils/otp');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// POST /auth/register
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  await User.create({ name, email, password, role: role || 'student' });

  const otp = generateOtp();
  await storeOtp(email, otp, 'verify');
  await sendOtpEmail(email, otp, 'Verify your Preplyft account');

  res.status(201).json({ message: 'Registered successfully. Please verify your email with the OTP sent.' });
};

// POST /auth/verify-email
const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  const valid = await verifyOtp(email, otp, 'verify');
  if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP' });

  await User.findOneAndUpdate({ email }, { isEmailVerified: true });
  res.json({ message: 'Email verified successfully' });
};

// POST /auth/resend-otp
const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (user) {
    const otp = generateOtp();
    await storeOtp(email, otp, 'verify');
    await sendOtpEmail(email, otp, 'Your Preplyft verification OTP');
  }
  // Always return 200 to prevent email enumeration
  res.json({ message: 'OTP resent successfully' });
};

// POST /auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isEmailVerified) {
    return res.status(401).json({ message: 'Please verify your email first' });
  }

  const payload = { id: user._id.toString(), role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await redis.set(`refresh:${user._id}`, refreshToken, 'EX', REFRESH_TTL);

  res.json({
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// POST /auth/refresh-token
const refreshToken = async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(400).json({ message: 'Refresh token required' });

  try {
    const payload = verifyRefreshToken(token);
    const stored  = await redis.get(`refresh:${payload.id}`);
    if (!stored || stored !== token) return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = signAccessToken({ id: payload.id, role: payload.role });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const user = await User.findOne({ email });
    if (user) {
      const otp = generateOtp();
      await storeOtp(email, otp, 'reset');
      await sendOtpEmail(email, otp, 'Reset your Preplyft password');
    }
  }
  // Always 200 to prevent enumeration
  res.json({ message: 'If that email exists, an OTP has been sent' });
};

// POST /auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP and newPassword are required' });
  }
  const valid = await verifyOtp(email, otp, 'reset');
  if (!valid) return res.status(400).json({ message: 'Invalid or expired OTP' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password reset successfully' });
};

// POST /auth/logout  🔒
const logout = async (req, res) => {
  if (req.user?.id) await redis.del(`refresh:${req.user.id}`);
  res.json({ message: 'Logged out successfully' });
};

// GET /auth/me  🔒
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

module.exports = { register, verifyEmail, resendOtp, login, refreshToken, forgotPassword, resetPassword, logout, getMe };
