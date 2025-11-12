import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_AUTH_USER,
    pass: process.env.GMAIL_AUTH_PASS,
  },
  logger: true,
  debug: true,
});

transporter.verify((err, success) => {
  if (err) console.log('SMTP connection error:', err);
  else console.log('SMTP server ready to send emails');
});

app.get('/', (_req, res) => {
  res.json({ message: 'SMTP Server is running' });
});

app.get('/api/send-email', async (req, res) => {
  const { otp, email, username, token, expiry, type } = req.query;

  if (!email || !username || !type) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    if (type === 'verification') {
      const verifyLink = `${process.env.FRONTEND_DOMAIN}/email-verification?token=${token}&username=${username}`;
      await transporter.sendMail({
        from: `"Happr" <${process.env.GMAIL_AUTH_USER}>`,
        to: email,
        subject: 'Verify your email to complete your registration',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <p>Hey ${username},</p>
            <p>I'm <strong>CharmingDc</strong>, creator of <strong>Happr</strong>. Thanks for signing up! To finish creating your account, please verify your email address.</p>
            <p>This link will expire in <strong>${expiry}</strong>.</p>
            <a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
            <p style="margin-top: 16px; font-size: 14px; color: #555;">If you didn’t create a Happr account, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else if (type === 'welcome') {
      await transporter.sendMail({
        from: `"CharmingDc at Happr" <${process.env.GMAIL_AUTH_USER}>`,
        to: email,
        subject: "Welcome to Happr 🎉, Let's get you smiling!",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #111827;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              <h2 style="color: #111827; text-align: center;">Welcome to Happr, ${username}! 😊</h2>
              <p style="font-size: 16px; line-height: 1.7;">Hi <strong>${username}</strong>, thank you for joining our creator community!</p>
              <p style="font-size: 16px; line-height: 1.7;">Happr lets your fans send <strong>Smiles</strong>, fun, instant tips that go straight to your bank account. Whether you're a musician, artist, gamer, or writer, Happr makes it easy to turn your creativity into support.</p>
              <div style="background-color: #f3f4f6; border-radius: 10px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #111827; margin-bottom: 10px;">Here's how to get started:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #374151;">
                  <li>Create your Happr page — add your bio & bank info.</li>
                  <li>Share your <strong>${process.env.FRONTEND_DOMAIN}/${username}</strong> link with your fans.</li>
                  <li>Receive Smiles instantly, powered by <strong>Paystack</strong>.</li>
                </ol>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_DOMAIN}/${username}" style="background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; display: inline-block;">Visit My Happr Page</a>
              </p>
              <p style="font-size: 15px; line-height: 1.7; color: #4b5563;">Your fans are waiting to support you. Share your page link, receive Smiles, and let your creativity shine.</p>
              <p style="font-size: 14px; color: #6b7280;">Made with ❤️ in Nigeria. Built for creators who deserve to smile.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="font-size: 13px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Happr. All rights reserved.<br/>Made with love. Paid in Smiles.</p>
            </div>
          </div>
        `,
      });
    } else if (type === 'payout-otp') {
      await transporter.sendMail({
        from: `"Happr Payout Settings" <${process.env.GMAIL_AUTH_USER}>`,
        to: email,
        subject: 'OTP to Update Your Payout Settings',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #111827;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
              <h2 style="text-align: center; color: #111827;">Update Payout Settings</h2>
              <p style="font-size: 16px; line-height: 1.7;">Hi <strong>${username}</strong>, you requested an OTP to change your payout information.</p>
              <p style="font-size: 16px; line-height: 1.7;">Enter the OTP below on your dashboard to securely update your bank information:</p>
              <h2 style="background-color: #f3f4f6; display: inline-block; padding: 12px 24px; border-radius: 6px; letter-spacing: 3px; font-size: 28px; color: #111; text-align: center;">${otp}</h2>
              <p style="margin-top: 16px; font-size: 14px; color: #555;">This OTP is valid for <strong>${expiry}</strong>. Do not share it with anyone.</p>
              <p style="margin-top: 16px; font-size: 14px; color: #555;">If you did not request this, you can safely ignore this email. Your bank details remain secure and encrypted.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              <p style="font-size: 13px; color: #9ca3af; text-align: center;">&copy; ${new Date().getFullYear()} Happr. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('SMTP Server is running on port 5000');
});
