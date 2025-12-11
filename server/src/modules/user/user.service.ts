import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateUserDTO, generatePresignedUrlDTO } from '../../dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import { generateCryptographicOtp } from '../../common/utils/generate.token';
import { redis } from '../../common/config/redis.config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import crypto from 'crypto';
import s3 from '../../common/config/s3.config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
    longcode?: string | null;
  } | null;

  stats: {
    total_amount_given: number;
    total_amount_received: number;
    total_donations_given: number;
    total_donations_received: number;
    total_supporters: number;
  };
  recent_donations: DonationDetails[];
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
}>;

@Injectable()
export class UserService {
  private readonly encryptionKey: Buffer;
  private readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  private readonly URL_EXPIRATION_SECONDS = 5 * 60;
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

  private encryptBankDetails(bankDetails: {
    bank_id: string;
    bank_code: string;
    longcode?: string | null;
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
    bank_id: string;
    bank_code: string;
    longcode?: string | null;
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
      bank_id: string;
      bank_code: string;
      longcode?: string | null;
      bank_name: string;
      account_number: string;
      account_name: string;
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
      bank_id: string;
      bank_code: string;
      longcode?: string | null;
      bank_name: string;
      account_number: string;
      account_name: string;
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
    if (dto.email !== undefined) prismaUpdateData.email = dto.email;
    if (dto.avatar !== undefined)
      prismaUpdateData.avatar = `${process.env.R2_PUBLIC_URL}/${dto.avatar}`;
    if (dto.cover_photo !== undefined)
      prismaUpdateData.cover_photo = `${process.env.R2_PUBLIC_URL}/${dto.cover_photo}`;

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
    } | null = null;

    if (updatedUser.bank_account?.encrypted_bank_account) {
      bank_account = this.decryptBankDetails(
        updatedUser.bank_account.encrypted_bank_account,
      );
    }
    console.log(updatedUser.avatar);
    return {
      success: true,
      data: {
        ...updatedUser,
        bank_account,
        stats: {
          total_amount_given: 0,
          total_amount_received: 0,
          total_donations_given: 0,
          total_donations_received: 0,
          total_supporters: 0,
        },
        recent_donations: [],
      },
      message: 'User profile updated successfully.',
    };
  }

  async generatePresignedUrl(
    dto: generatePresignedUrlDTO,
  ): Promise<ApiResponseDTO> {
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

    const objectKey = `uploads/${crypto.randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_ID!,
      Key: objectKey,
      ContentType: content_type,
    });

    try {
      const presigned_url = await getSignedUrl(s3, command, {
        expiresIn: this.URL_EXPIRATION_SECONDS,
      });

      return {
        success: true,
        message: 'Presigned URL created successfully',
        data: {
          presigned_url,
          objectKey,
          expiresIn: this.URL_EXPIRATION_SECONDS,
        },
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Failed to generate presigned URL: ${message}`,
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
