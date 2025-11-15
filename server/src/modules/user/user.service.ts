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
  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

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
        bank_account: {
          select: {
            bank_name: true,
            account_name: true,
            account_number: true,
          },
        },
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

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { ...dto },
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
        bank_account: {
          select: { bank_name: true, account_name: true, account_number: true },
        },
      },
    });

    return {
      success: true,
      data: updatedUser,
      message: 'User profile updated successfully.',
    };
  }

  // ... rest of your methods remain the same
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
    userId: string,
  ): Promise<ApiResponseDTO<{ otpSent: boolean }>> {
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

    const { otp } = generateCryptographicOtp();
    await redis.set(`otp:${userId}`, otp, 'EX', 300);

    await this.emailQueue.add('send-otp', {
      type: 'otp',
      data: { email: user.email, username: user.username, otp },
    });

    return {
      success: true,
      data: { otpSent: true },
      message: 'OTP sent successfully.',
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

    const existingBankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: userId },
    });
    if (existingBankAccount) {
      await this.prisma.bankAccount.update({
        where: { id: userId },
        data: {
          bank_name: dto.bankName,
          account_name: dto.accountName,
          account_number: dto.accountNumber,
          updated_at: new Date(),
        },
      });
    } else {
      await this.prisma.bankAccount.create({
        data: {
          id: userId,
          bank_name: dto.bankName,
          account_name: dto.accountName,
          account_number: dto.accountNumber,
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
}
