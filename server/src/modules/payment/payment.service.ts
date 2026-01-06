
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { InitializeDonationDTO } from './dtos/payment.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import axios, { AxiosResponse } from 'axios';

interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

@Injectable()
export class PaymentService {
    constructor(private readonly prisma: PrismaService) { }

    async initializeDonation(
        dto: InitializeDonationDTO,
    ): Promise<
        ApiResponseDTO<{
            authorization_url: string;
            access_code: string;
            reference: string;
        }>
    > {

        const creator = await this.prisma.user.findUnique({
            where: { username: dto.creator_username },
        });

        if (!creator) {
            throw new NotFoundException({
                success: false,
                message: 'Creator not found',
                data: null,
            });
        }


        const amountInNaira = (creator.smile_price || 200) * dto.smile_count;
        const amountInKobo = amountInNaira * 100;


        const metadata = {
            creator_id: creator.id,
            smile_count: dto.smile_count,
            smile_price: creator.smile_price || 200,
            supporter_name: dto.sender_name,
            supporter_xhandle: dto.sender_xhandle,
            message: dto.message,
            is_anonymous: dto.is_anonymous,
            custom_fields: [
                {
                    display_name: 'Creator',
                    variable_name: 'creator_username',
                    value: creator.username,
                },
                {
                    display_name: 'Smile Count',
                    variable_name: 'smile_count',
                    value: dto.smile_count,
                },
            ],
        };

        try {

            const response: AxiosResponse<PaystackInitializeResponse> =
                await axios.post(
                    'https://api.paystack.co/transaction/initialize',
                    {
                        email: dto.sender_email,
                        amount: amountInKobo,
                        metadata,
                        callback_url: `${process.env.FRONTEND_DOMAIN}/payment/callback`,
                        reference: `happr_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );

            if (!response.data.status) {
                throw new BadRequestException({
                    success: false,
                    message: 'Payment initialization failed',
                    data: null,
                });
            }

            return {
                success: true,
                message: 'Payment initialized',
                data: response.data.data,
            };
        } catch (error) {
            console.error(
                'Paystack initialization error:',
                error.response?.data || error.message,
            );
            throw new BadRequestException({
                success: false,
                message: 'Failed to initialize payment',
                data: null,
            });
        }
    }
}
