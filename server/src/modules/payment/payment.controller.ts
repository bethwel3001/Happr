
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitializeDonationDTO } from './dtos/payment.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDTO } from '../../dtos/api.response.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('initialize')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Initialize a donation',
        description: 'Initialize a Paystack transaction for donation',
    })
    @ApiResponse({
        status: 200,
        description: 'Transaction initialized successfully',
    })
    async initializeDonation(
        @Body() dto: InitializeDonationDTO,
    ): Promise<ApiResponseDTO<any>> {
        return this.paymentService.initializeDonation(dto);
    }
}
