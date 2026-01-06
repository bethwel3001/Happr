import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  UpdateUserDTO,
  generateSignatureDTO,
  UserStatsDTO,
  DonationDetailsDTO,
  PublicUserProfileDTO,
} from './dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import {
  generateCryptographicOtp,
  generateMailToken,
} from '../../common/utils/generate.token';
import { redis } from '../../common/config/redis.config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import crypto from 'crypto';
import cloudinary from '../../common/config/cloudinary.config';

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
    bank_id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    bank_code: string;
    last_updated: string;
    longcode?: string | null;
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
  created_at: Date;
  is_guest: boolean;

  smile_count: number;
  smile_price: number;
  is_anonymous: boolean;
  supporter_name?: string | null;
  supporter_xhandle?: string | null;

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

type PrismaUserUpdate = Partial<{
  username: string;
  display_name: string;
  bio: string;
  phone_number: string;
  website_link: string;
  is_onboarded: boolean;
  email: string;
  avatar: string;
  cover_photo: string;
  smile_price: number;
}>;

@Injectable()
export class UserService {
  private readonly encryptionKey: Buffer;
  private readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
  ];

  constructor(
    private prisma: PrismaService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Bank encryption is missing!');
    }

    this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  private decryptBankDetails(encryptedBankDetails: string): {
    bank_id: string;
    bank_code: string;
    longcode?: string | null;
    bank_name: string;
    account_number: string;
    account_name: string;
    last_updated: string;
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
      bank_id: string;
      bank_code: string;
      longcode?: string | null;
      bank_name: string;
      account_number: string;
      account_name: string;
      last_updated: string;
    };
  }

  async getUserDetails(
    _id: string,
  ): Promise<ApiResponseDTO<FixedCompleteUserDTO>> {
    const cacheKey = `user:${_id}:details`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached) as ApiResponseDTO<FixedCompleteUserDTO>;
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
        smile_price: true,
        created_at: true,
        updated_at: true,
        bank_account: { select: { encrypted_bank_account: true } },
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
      bank_id: string;
      bank_code: string;
      longcode?: string | null;
      bank_name: string;
      account_number: string;
      account_name: string;
      last_updated: string;
    } | null = null;

    if (user.bank_account?.encrypted_bank_account) {
      bank_account = this.decryptBankDetails(
        user.bank_account.encrypted_bank_account,
      );
    }

    const responseData: FixedCompleteUserDTO = {
      ...user,
      bank_account,
    };

    const apiResponse: ApiResponseDTO<FixedCompleteUserDTO> = {
      success: true,
      data: responseData,
      message: 'User details fetched successfully.',
    };

    await redis.set(cacheKey, JSON.stringify(apiResponse), 'EX', 120);

    return apiResponse;
  }

  async getUserStats(_id: string): Promise<ApiResponseDTO<UserStatsDTO>> {
    const cacheKey = `user:${_id}:stats`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ApiResponseDTO<UserStatsDTO>;
    }

    const [totalReceived, totalGiven, uniqueSupporters] = await Promise.all([
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
    ]);

    const donationCounts = await Promise.all([
      this.prisma.donation.count({ where: { creator_id: _id } }),
      this.prisma.donation.count({ where: { supporter_id: _id } }),
    ]);

    const stats: UserStatsDTO = {
      total_donations_received: donationCounts[0] || 0,
      total_donations_given: donationCounts[1] || 0,
      total_amount_received: totalReceived._sum.amount || 0,
      total_amount_given: totalGiven._sum.amount || 0,
      total_supporters: uniqueSupporters.length,
    };

    const response = {
      success: true,
      data: stats,
      message: 'User stats fetched successfully.',
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 120);

    return response;
  }

  async getRecentDonations(
    _id: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponseDTO<DonationDetailsDTO[]>> {
    const skip = (page - 1) * limit;

    const donations = await this.prisma.donation.findMany({
      where: { creator_id: _id },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        amount: true,
        message: true,
        supporter_name: true,
        supporter_xhandle: true,
        is_guest: true,
        created_at: true,
        smile_count: true,
        smile_price: true,
        is_anonymous: true,
        supporter: {
          select: {
            id: true,
            username: true,
            avatar: true,
            cover_photo: true,
          },
        },
      },
    });

    return {
      success: true,
      data: donations as DonationDetailsDTO[],
      message: 'User donations fetched successfully.',
    };
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

    const prismaUpdateData: PrismaUserUpdate = {};

    if (dto.username !== undefined)
      prismaUpdateData.username = dto.username.replace(/\s+/g, '');
    if (dto.display_name !== undefined)
      prismaUpdateData.display_name = dto.display_name;
    if (dto.bio !== undefined) prismaUpdateData.bio = dto.bio;
    if (dto.phone_number !== undefined)
      prismaUpdateData.phone_number = dto.phone_number;
    if (dto.website_link !== undefined)
      prismaUpdateData.website_link = dto.website_link;
    if (dto.is_onboarded !== undefined)
      prismaUpdateData.is_onboarded = dto.is_onboarded;
    if (dto.avatar !== undefined) prismaUpdateData.avatar = dto.avatar;
    if (dto.cover_photo !== undefined)
      prismaUpdateData.cover_photo = dto.cover_photo;
    if (dto.smile_price !== undefined)
      prismaUpdateData.smile_price = dto.smile_price;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: prismaUpdateData,
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        display_name: true,
        website_link: true,
        phone_number: true,
        is_onboarded: true,
        auth_provider: true,
        is_verified: true,
        smile_price: true,
        avatar: true,
        cover_photo: true,
        created_at: true,
        updated_at: true,
        bank_account: { select: { encrypted_bank_account: true } },
      },
    });

    let bank_account: {
      bank_id: string;
      bank_code: string;
      longcode?: string | null;
      bank_name: string;
      account_number: string;
      account_name: string;
      last_updated: string;
    } | null = null;

    if (updatedUser.bank_account?.encrypted_bank_account) {
      bank_account = this.decryptBankDetails(
        updatedUser.bank_account.encrypted_bank_account,
      );
    }

    await redis.del(`user:${id}:details`);

    return {
      success: true,
      data: {
        ...updatedUser,
        bank_account,
      },
      message: 'User profile updated successfully.',
    };
  }

  generateSignature(dto: generateSignatureDTO): ApiResponseDTO {
    const { file_size, content_type } = dto;

    if (!this.ALLOWED_IMAGE_TYPES.includes(content_type)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid file type. Only image types are allowed.',
        data: null,
      });
    }

    if (file_size > this.MAX_FILE_SIZE_BYTES) {
      throw new PayloadTooLargeException({
        success: false,
        message: `File size exceeds ${this.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`,
        data: null,
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'happr/uploads';
    const public_id = `${folder}/${crypto.randomUUID()}`;

    try {
      const paramsToSign = {
        timestamp,
        folder,
        public_id,
      };

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!,
      );

      return {
        success: true,
        message: 'Signature created successfully',
        data: {
          signature,
          timestamp,
          folder,
          public_id,
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
        },
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Failed to generate signature: ${message}`,
        data: null,
      };
    }
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

    await this.prisma.refreshToken.deleteMany({
      where: { user_id: targetUserId },
    });

    await redis.del(`user:${targetUserId}:details`);

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

  async changeEmail(
    userId: string,
    newEmail: string,
  ): Promise<ApiResponseDTO> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException({
        success: false,
        data: [],
        message: 'User does not exist',
      });
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new BadRequestException({
        success: false,
        data: [],
        message: 'Email is already taken by another user.',
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        is_verified: false,
      },
    });

    const { email_token } = generateMailToken(user.id, user.username, newEmail);

    await this.emailQueue.add('send-verification', {
      type: 'email-change',
      data: {
        email: newEmail,
        username: user.username,
        token: email_token,
        expiry: '4 hours',
      },
    });

    await redis.del(`user:${userId}:details`);

    return {
      success: true,
      data: [],
      message: 'Email updated successfully. Please verify your new email.',
    };
  }

  async getPublicDonations(
    username: string,
    page = 1,
    limit = 10,
  ): Promise<ApiResponseDTO<DonationDetailsDTO[]>> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User does not exist',
        data: null,
      });
    }

    return this.getRecentDonations(user.id, page, limit);
  }

  async getPublicProfile(
    username: string,
  ): Promise<ApiResponseDTO<PublicUserProfileDTO>> {
    const cacheKey = `user:public:${username}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as ApiResponseDTO<PublicUserProfileDTO>;
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        display_name: true,
        bio: true,
        avatar: true,
        cover_photo: true,
        is_verified: true,
        smile_price: true,
        website_link: true,
        created_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        data: [],
        message: 'User does not exist',
      });
    }


    const statsResponse = await this.getUserStats(user.id);
    const stats = statsResponse.data as UserStatsDTO;


    const donationsResponse = await this.getRecentDonations(user.id, 1, 10);
    const recent_donations = donationsResponse.data as DonationDetailsDTO[];

    const publicProfile: PublicUserProfileDTO = {
      username: user.username,
      display_name: user.display_name,
      bio: user.bio,
      avatar: user.avatar,
      cover_photo: user.cover_photo,
      is_verified: user.is_verified,
      smile_price: user.smile_price,
      website_link: user.website_link,
      created_at: user.created_at,
      stats,
      recent_donations,
    };

    const response = {
      success: true,
      data: publicProfile,
      message: 'Public profile fetched successfully.',
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 120);

    return response;
  }
}
