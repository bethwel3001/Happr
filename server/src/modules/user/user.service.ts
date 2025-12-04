import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdatePayoutDetailsDTO, UpdateUserDTO } from '../../dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import { generateCryptographicOtp } from '../../common/utils/generate.token';
import { redis } from '../../common/config/redis.config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import crypto from 'crypto';

interface FixedCompleteUserDTO {
  id: string;
  email: string;
  username: string;
  bio?: string | null;
  avatar?: string | null;
  cover_photo?: string | null;
  display_name?: string | null;
  website_link?: string | null;
  phone_number?: string | null;
  is_onboarded: boolean;
  is_verified: boolean;
  auth_provider: string;
  created_at: Date;
  updated_at: Date;
  bank_account?: {
    bank_name: string;
    account_name: string;
    account_number: string;
  } | null;
}

interface UserStats {
  total_donations_received: number;
  total_donations_given: number;
  total_amount_received: number;
  total_amount_given: number;
  total_supporters: number;
}

interface DonationDetails {
  id: string;
  amount: number;
  message?: string | null;
  name?: string | null;
  email?: string | null;
  is_guest: boolean;
  created_at: Date;
  supporter?: {
    id: string;
    username: string;
    avatar?: string | null;
    cover_photo?: string | null;
  } | null;
}

interface UserDetailsResponse extends FixedCompleteUserDTO {
  stats: UserStats;
  recent_donations: DonationDetails[];
}

@Injectable()
export class UserService {
  private readonly encryptionKey: Buffer;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Bank encryption is missing!');
    }

    this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  private encryptBankDetails(bankDetails: {
    bank_name: string;
    account_number: string;
    account_name: string;
  }): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(bankDetails), 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  private decryptBankDetails(encryptedBankDetails: string): {
    bank_name: string;
    account_number: string;
    account_name: string;
  } {
    const data = Buffer.from(encryptedBankDetails, 'base64');
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encryptedData = data.subarray(28);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]).toString('utf8');

    return JSON.parse(decrypted) as {
      bank_name: string;
      account_name: string;
      account_number: string;
    };
  }

  async updatePayoutDetails(
    userId: string,
    dto: UpdatePayoutDetailsDTO,
  ): Promise<
    ApiResponseDTO<{
      bank_name: string;
      account_name: string;
      account_number: string;
    }>
  > {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new NotFoundException({
        success: false,
        data: [],
        message: 'User does not exist',
      });
    if (!user.is_verified)
      throw new ForbiddenException({
        success: false,
        data: [],
        message: 'Your account is not verified yet, check your email.',
      });

    const storedOtp = await redis.get(`otp:${userId}`);
    if (!storedOtp || storedOtp !== dto.otp)
      throw new BadRequestException({
        success: false,
        data: [],
        message: 'Invalid or expired OTP.',
      });

    const encrypted_bank_account = this.encryptBankDetails({
      bank_name: dto.bankName,
      account_number: dto.accountNumber,
      account_name: dto.accountName,
    });

    const existingBankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: userId },
    });

    if (existingBankAccount) {
      await this.prisma.bankAccount.update({
        where: { id: userId },
        data: {
          encrypted_bank_account,
          updated_at: new Date(),
        },
      });
    } else {
      await this.prisma.bankAccount.create({
        data: {
          id: userId,
          encrypted_bank_account,
        },
      });
    }

    await redis.del(`otp:${userId}`);

    return {
      success: true,
      data: {
        bank_name: dto.bankName,
        account_name: dto.accountName,
        account_number: dto.accountNumber,
      },
      message: 'Payout details updated successfully.',
    };
  }

  async getUserDetails(
    _id: string,
  ): Promise<ApiResponseDTO<UserDetailsResponse>> {
    const cacheKey = `user:${_id}:details`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached) as ApiResponseDTO<UserDetailsResponse>;
      if (!parsed.data) {
        throw new NotFoundException({
          success: false,
          data: [],
          message: 'Cached user data is invalid',
        });
      }

      return parsed;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: _id },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        display_name: true,
        website_link: true,
        avatar: true,
        is_onboarded: true,
        cover_photo: true,
        phone_number: true,
        auth_provider: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
        bank_account: { select: { encrypted_bank_account: true } },
        _count: {
          select: {
            donations: true,
            supports: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        data: [],
        message: 'User does not exist',
      });
    }

    if (!user.is_verified) {
      throw new ForbiddenException({
        success: false,
        data: [],
        message: 'Your account is not verified yet, check your email.',
      });
    }
    let bank_account: {
      bank_name: string;
      account_name: string;
      account_number: string;
    } | null = null;

    if (user.bank_account?.encrypted_bank_account) {
      bank_account = this.decryptBankDetails(
        user.bank_account.encrypted_bank_account,
      );
    }

    const [totalReceived, totalGiven, uniqueSupporters, recentDonations] =
      await Promise.all([
        this.prisma.donation.aggregate({
          _sum: { amount: true },
          where: { creator_id: _id },
        }),
        this.prisma.donation.aggregate({
          _sum: { amount: true },
          where: { supporter_id: _id },
        }),
        this.prisma.donation.findMany({
          where: { creator_id: _id, supporter_id: { not: null } },
          select: { supporter_id: true },
          distinct: ['supporter_id'],
        }),
        this.prisma.donation.findMany({
          where: { creator_id: _id },
          orderBy: { created_at: 'desc' },
          take: 5,
          select: {
            id: true,
            amount: true,
            message: true,
            name: true,
            email: true,
            is_guest: true,
            created_at: true,
            supporter: {
              select: {
                id: true,
                username: true,
                avatar: true,
                cover_photo: true,
              },
            },
          },
        }),
      ]);

    const { _count, ...safeUser } = user;

    const responseData: UserDetailsResponse = {
      ...safeUser,
      bank_account,
      stats: {
        total_donations_received: _count.donations || 0,
        total_donations_given: _count.supports || 0,
        total_amount_received: totalReceived._sum.amount || 0,
        total_amount_given: totalGiven._sum.amount || 0,
        total_supporters: uniqueSupporters.length,
      },
      recent_donations: recentDonations ?? [],
    };

    const apiResponse: ApiResponseDTO<UserDetailsResponse> = {
      success: true,
      data: responseData,
      message: 'User details and donation stats fetched successfully.',
    };

    await redis.set(cacheKey, JSON.stringify(apiResponse), 'EX', 300);

    return apiResponse;
  }

 async updateUserInfo(
  id: string,
  dto: UpdateUserDTO,
): Promise<ApiResponseDTO<FixedCompleteUserDTO>> {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user)
    throw new NotFoundException({
      success: false,
      data: [],
      message: 'User does not exist',
    });
  if (!user.is_verified)
    throw new ForbiddenException({
      success: false,
      data: [],
      message: 'Your account is not verified yet, check your email.',
    });

  const prismaUpdateData: any = {};

  if (dto.username !== undefined) prismaUpdateData.username = dto.username;
  if (dto.display_name !== undefined) prismaUpdateData.display_name = dto.display_name;
  if (dto.bio !== undefined) prismaUpdateData.bio = dto.bio;
  if (dto.phone_number !== undefined) prismaUpdateData.phone_number = dto.phone_number;
  if (dto.website_link !== undefined) prismaUpdateData.website_link = dto.website_link;
  if (dto.is_onboarded !== undefined) prismaUpdateData.is_onboarded = dto.is_onboarded;
  if (dto.email !== undefined) prismaUpdateData.email = dto.email;
  if (dto.avatar !== undefined && typeof dto.avatar === 'string') prismaUpdateData.avatar = dto.avatar;
  if (dto.cover_photo !== undefined && typeof dto.cover_photo === 'string') prismaUpdateData.cover_photo = dto.cover_photo;

  const updatedUser = await this.prisma.user.update({
    where: { id },
    data: prismaUpdateData,
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      display_name: true,
      avatar: true,
      cover_photo: true,
      website_link: true,
      phone_number: true,
      is_onboarded: true,
      auth_provider: true,
      is_verified: true,
      created_at: true,
      updated_at: true,
      bank_account: { select: { encrypted_bank_account: true } },
    },
  });

  let bank_account: {
    bank_name: string;
    account_name: string;
    account_number: string;
  } | null = null;

  if (updatedUser.bank_account?.encrypted_bank_account) {
    bank_account = this.decryptBankDetails(
      updatedUser.bank_account.encrypted_bank_account,
    );
  }

  return {
    success: true,
    data: { ...updatedUser, bank_account },
    message: 'User profile updated successfully.',
  };
}

  async deleteUserAccount(
    authUserId: string,
    targetUserId: string,
  ): Promise<ApiResponseDTO> {
    if (authUserId !== targetUserId)
      throw new ForbiddenException({
        success: false,
        data: [],
        message: 'You are not authorized to delete this account.',
      });

    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user)
      throw new NotFoundException({
        success: false,
        data: [],
        message: 'User does not exist',
      });
    if (!user.is_verified)
      throw new ForbiddenException({
        success: false,
        data: [],
        message: 'Your account is not verified yet, check your email.',
      });

    await this.prisma.user.delete({ where: { id: targetUserId } });
    return {
      success: true,
      data: [],
      message: 'User account deleted successfully.',
    };
  }

  async generateOtp(
    email: string,
  ): Promise<ApiResponseDTO<{ otpSent: boolean }>> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException({
        success: false,
        data: [],
        message: 'User does not exist',
      });
    if (!user.is_verified)
      throw new ForbiddenException({
        success: false,
        data: [],
        message: 'Your account is not verified yet, check your email.',
      });

    const { otp } = generateCryptographicOtp();
    await redis.set(`otp:${user.id}`, otp, 'EX', 300);

    await this.emailQueue.add('send-otp', {
      type: 'otp',
      data: { email, username: user.username, otp },
    });

    return {
      success: true,
      data: { otpSent: true },
      message: 'OTP sent successfully.',
    };
  }
}
