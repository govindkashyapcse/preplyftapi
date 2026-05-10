const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (to, otp, subject) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#4f46e5">Preplyft</h2>
        <p>${subject}</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 0;color:#1e1b4b">${otp}</div>
        <p style="color:#6b7280;font-size:13px">This OTP expires in ${process.env.OTP_EXPIRES_IN} minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

module.exports = { transporter, sendOtpEmail };
