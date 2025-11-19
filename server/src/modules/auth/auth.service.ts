import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { redis } from '../../common/config/redis.config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import {
  SignupDTO,
  SignInDTO,
  UsernameAvailabilityDTO,
  ResetPasswordDTO,
  ForgotEmailPasswordDTO,
} from '../../dtos/auth.module.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import {
  generateAccessToken,
  generateRefreshToken,
  generateMailToken,
} from '../../common/utils/generate.token';
import crypto from 'crypto';

interface DecodedMailToken {
  id: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface JwtPayload {
  _id: string;
  email: string;
  phone?: string;
  iat?: number;
  exp?: number;
}

const unauthorizedUsernames = [
  'signup',
  'signin',
  'reset-password',
  'complete-setup',
  'dashboard',
  'supporters',
  'payout',
  'settings',
  'admin',
  'api',
  'auth',
  'user',
  'profile',
  'login',
  'register',
  'verify',
  'email',
  'password',
];

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

  private isUsernameAllowed(username: string): boolean {
    return !unauthorizedUsernames.includes(username.toLowerCase());
  }

  private async getOtpForUser(userId: string): Promise<string | null> {
    return redis.get(`otp:${userId}`);
  }

  private async clearOtpForUser(userId: string): Promise<void> {
    await redis.del(`otp:${userId}`);
  }

  private generateVerificationCode(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  async checkUsernameAvailability(
    dto: UsernameAvailabilityDTO,
  ): Promise<ApiResponseDTO> {
    if (!this.isUsernameAllowed(dto.username)) {
      throw new BadRequestException({
        success: false,
        data: [],
        message: `"${dto.username}" is not allowed as a username`,
      });
    }

    const username = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (username) {
      throw new BadRequestException({
        success: false,
        data: [],
        message: `"${dto.username}" is already taken`,
      });
    }

    return {
      success: true,
      data: [],
      message: `${dto.username} is available`,
    };
  }

  async signup(dto: SignupDTO): Promise<ApiResponseDTO> {
    if (!this.isUsernameAllowed(dto.username)) {
      throw new BadRequestException({
        success: false,
        data: [],
        message: `"${dto.username}" is not allowed as a username`,
      });
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new BadRequestException({
        success: false,
        data: [],
        message: 'Account already exists',
      });
    }

    const hashedPassword = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${dto.username}&background=random&bold=true&size=128`,
        auth_provider: 'local',
      },
    });

    const { email_token } = generateMailToken(user.id, dto.username, dto.email);

    await this.emailQueue.add('send-verification', {
      type: 'verification',
      data: {
        email: dto.email,
        username: dto.username,
        token: email_token,
        expiry: '4 hours',
      },
    });

    return {
      success: true,
      data: [],
      message: 'Account created. Please verify your email',
    };
  }

  async verifyEmail(token: string): Promise<{
    access_token: string;
    refresh_token: string;
    is_onboarded: boolean;
  }> {
    try {
      const decoded = this.jwt.verify<DecodedMailToken>(token, {
        secret: process.env.JWT_SECRET!,
      });

      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new BadRequestException({
          success: false,
          data: [],
          message: 'User not found',
        });
      }

      if (user.is_verified) {
        throw new BadRequestException({
          success: false,
          data: [],
          message: 'Email already verified, just login!',
        });
      }

      await this.prisma.user.update({
        where: { email: decoded.email },
        data: { is_verified: true },
      });

      await this.emailQueue.add('send-welcome', {
        type: 'welcome',
        data: { email: decoded.email, username: decoded.username },
      });

      const { access_token } = generateAccessToken(user.id, user.email);
      const { refresh_token } = generateRefreshToken(user.id, user.email);

      await this.prisma.refreshToken.create({
        data: {
          token: refresh_token,
          user_id: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return { access_token, refresh_token, is_onboarded: user.is_onboarded };
    } catch {
      throw new BadRequestException({
        success: false,
        data: [],
        message: 'Invalid or expired token!',
      });
    }
  }

  async signin(
    dto: SignInDTO,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        data: [],
        message: 'Invalid credentials',
      });
    }

    const validPassword = await argon2.verify(
      user.password ?? '',
      dto.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException({
        success: false,
        data: [],
        message: 'Invalid credentials',
      });
    }

    if (!user.is_verified) {
      throw new UnauthorizedException({
        success: false,
        data: [],
        message:
          'Your account has not been verified yet, kindly check your email',
      });
    }

    const { access_token } = generateAccessToken(user.id, user.email);
    const { refresh_token } = generateRefreshToken(user.id, user.email);

    await this.prisma.refreshToken.create({
      data: {
        token: refresh_token,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }

  async signout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { user_id: userId },
    });
  }

  async forgotPassword(dto: ForgotEmailPasswordDTO): Promise<ApiResponseDTO> {
    const { email } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        data: [],
      });
    }

    const otp = this.generateVerificationCode();
    await redis.set(`otp:${user.id}`, otp, 'EX', 15 * 60);

    await this.emailQueue.add('send-otp', {
      type: 'forgot-password-otp',
      data: { email, username: user.username, otp, expiry: '15 minutes' },
    });

    return { success: true, data: [], message: 'OTP sent to email' };
  }

  async verifyForgotPassword(
    dto: ForgotEmailPasswordDTO & { otp?: string },
  ): Promise<ApiResponseDTO> {
    const { email, otp } = dto;

    if (!email || !otp) {
      throw new BadRequestException({
        success: false,
        message: 'Email and OTP are required',
        data: [],
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        data: [],
      });
    }

    const storedOtp = await this.getOtpForUser(user.id);

    if (!storedOtp) {
      throw new BadRequestException({
        success: false,
        message: 'OTP expired or not found',
        data: [],
      });
    }

    if (storedOtp !== otp) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid OTP',
        data: [],
      });
    }

    await this.clearOtpForUser(user.id);

    const payload: JwtPayload = {
      _id: user.id,
      email: user.email ?? '',
    };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: '15m',
    });

    return {
      success: true,
      message:
        'User is legit, access token generated, use it to reset password',
      data: { accessToken },
    };
  }

  async resetPassword(
    userId: string,
    dto: ResetPasswordDTO,
  ): Promise<ApiResponseDTO> {
    const { newPassword } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        data: [],
      });
    }

    const password = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password,
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Password reset successfully',
      data: [],
    };
  }
}
