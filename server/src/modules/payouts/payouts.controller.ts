import { PayoutsService } from './payouts.service';
import {
  Controller,
  Body,
  Patch,
  Req,
  Post,
  Get,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import axios, { AxiosResponse } from 'axios';
import {
  ResolveAccountDTO,
  UpdatePayoutDetailsDTO,
} from '../../dtos/payouts.dto';
import { PaystackBank } from './payouts.service';
import { redis } from '../../common/config/redis.config';
export interface PaystackBanksResponse {
  status: boolean;
  message: string;
  data: PaystackBank[];
}

@ApiTags('Payouts')
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Patch('payout-details')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update payout details',
    description:
      'Updates the payout details of the authenticated user with OTP verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payout details updated successfully.',
  })
  @UseGuards(AuthGuard)
  async updatePayoutDetails(
    @Body() dto: UpdatePayoutDetailsDTO,
    @Req() req: AuthenticatedRequest,
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
    const userId = req.user._id;
    return this.payoutsService.updatePayoutDetails(userId, dto);
  }

  @Get('get-banks-list')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get banks list',
    description: 'Gets the list of banks available for payout.',
  })
  @ApiResponse({
    status: 200,
    description: 'Banks list retrieved successfully.',
  })
  async getAllNigerianBanksList(): Promise<ApiResponseDTO<PaystackBank[]>> {
    const cacheKey = 'banks:nigeria';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return {
        success: true,
        message: 'Banks list fetched (cache)',
        data: JSON.parse(cached) as PaystackBank[],
      };
    }

    const response: AxiosResponse<PaystackBanksResponse> = await axios.get(
      'https://api.paystack.co/bank',
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const banks = response.data.data;
    await redis.set(cacheKey, JSON.stringify(banks), 'EX', 86400);

    return {
      success: true,
      message: response.data.message,
      data: banks,
    };
  }

  @Post('account-name-resolver')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resolve account name',
    description: 'Fetches the account holder name from Paystack.',
  })
  @ApiResponse({
    status: 200,
  })
  async accountNameResolver(
    @Body() dto: ResolveAccountDTO,
  ): Promise<ApiResponseDTO> {
    return this.payoutsService.bankAccountResolution(
      dto.accountNumber,
      dto.bankCode,
    );
  }
}
