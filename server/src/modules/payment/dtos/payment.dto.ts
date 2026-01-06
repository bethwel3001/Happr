
import {
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsEmail,
    Min,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitializeDonationDTO {
    @ApiProperty({
        description: 'Username of the creator receiving the donation',
        example: 'charmingdc',
    })
    @IsString()
    @IsNotEmpty()
    creator_username: string;

    @ApiProperty({
        description: 'Number of smiles to send (1 smile = user configured price)',
        example: 3,
    })
    @IsNumber()
    @Min(1)
    smile_count: number;

    @ApiProperty({
        description: 'Message from the supporter',
        required: false,
        example: 'Great work! Keep it up.',
    })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiProperty({
        description: 'Supporter name',
        required: false,
        example: 'John Doe',
    })
    @IsOptional()
    @IsString()
    sender_name?: string;

    @ApiProperty({
        description: 'Supporter email (required for receipt)',
        example: 'supporter@example.com',
    })
    @IsEmail()
    sender_email: string;

    @ApiProperty({
        description: 'Supporter X handle',
        required: false,
        example: '@johndoe',
    })
    @IsOptional()
    @IsString()
    sender_xhandle?: string;

    @ApiProperty({
        description: 'Whether the donation is anonymous',
        required: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    is_anonymous?: boolean;
}

export class VerifyTransactionDTO {
    @ApiProperty({
        description: 'Transaction reference from Paystack',
        example: 't434930430',
    })
    @IsString()
    @IsNotEmpty()
    reference: string;
}
