import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';
const jwtService = new JwtService();

export function generateAccessToken(_id: string, email: string) {
  const payload = { _id, email };
  const token = jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '30m',
  });
  return { access_token: token };
}

export function generateRefreshToken(_id: string, email: string) {
  const payload = { _id, email };
  const token = jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  });
  return { refresh_token: token };
}

export function generateMailToken(
  _id: string,
  username: string,
  email: string,
) {
  const payload = { _id, username, email };
  const token = jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '4h',
  });
  return { email_token: token };
}

export function generateCryptographicOtp() {
  const otp = crypto.randomBytes(4).toString('hex');
  return { otp: otp };
}
