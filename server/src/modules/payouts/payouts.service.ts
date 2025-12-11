import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdatePayoutDetailsDTO } from '../../dtos/payouts.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import crypto from 'crypto';
import { redis } from '../../common/config/redis.config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import axios, { AxiosError, AxiosResponse } from 'axios';

export interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackResolveAccountData {
  account_name: string;
  account_number: string;
  bank_id: number;
}

export interface PaystackResolveResponse {
  status: boolean;
  message: string;
  data: PaystackResolveAccountData;
}

@Injectable()
export class PayoutsService {
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Bank encryption key is missing!');
    }
    this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  private encryptBankDetails(bankDetails: {
    bankId: string;
    bankCode: string;
    longcode?: string | null;
    bankName: string;
    accountNumber: string;
    accountName: string;
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
    bankId: string;
    bankCode: string;
    longcode?: string | null;
    bankName: string;
    accountNumber: string;
    accountName: string;
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
      bankId: string;
      bankCode: string;
      longcode?: string | null;
      bankName: string;
      accountNumber: string;
      accountName: string;
    };
  }

  async updatePayoutDetails(
    userId: string,
    dto: UpdatePayoutDetailsDTO,
  ): Promise<
    ApiResponseDTO<{
      bankId: string;
      bankCode: string;
      longcode?: string | null;
      bankName: string;
      accountNumber: string;
      accountName: string;
    }>
  > {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

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

    const storedOtp = await redis.get(`otp:${userId}`);
    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException({
        success: false,
        data: [],
        message: 'Invalid or expired OTP.',
      });
    }

    const encryptedBankAccount = this.encryptBankDetails({
      bankId: dto.bankId,
      bankCode: dto.bankCode,
      longcode: dto.longcode || null,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
    });

    const existingBankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: userId },
    });
    if (existingBankAccount) {
      await this.prisma.bankAccount.update({
        where: { id: userId },
        data: {
          encrypted_bank_account: encryptedBankAccount,
          updated_at: new Date(),
        },
      });
    } else {
      await this.prisma.bankAccount.create({
        data: { id: userId, encrypted_bank_account: encryptedBankAccount },
      });
    }

    await redis.del(`otp:${userId}`);

    return {
      success: true,
      data: {
        bankId: dto.bankId,
        bankCode: dto.bankCode,
        longcode: dto.longcode || null,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
      },
      message: 'Payout details updated successfully.',
    };
  }

  async bankAccountResolution(
    accountNumber: string,
    bankCode: string,
  ): Promise<ApiResponseDTO<{ accountName: string }>> {
    try {
      const response: AxiosResponse<PaystackResolveResponse> = await axios.get(
        'https://api.paystack.co/bank/resolve',
        {
          params: { account_number: accountNumber, bank_code: bankCode },
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        },
      );

      return {
        success: true,
        message: 'Account name resolved',
        data: { accountName: response.data.data.account_name },
      };
    } catch (error) {
      const err = error as AxiosError<PaystackResolveResponse>;
      const message =
        err.response?.data?.message ?? 'Account resolution failed';
      return { success: false, message, data: { accountName: '' } };
    }
  }
}
