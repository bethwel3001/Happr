import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveAccountDTO {
  @ApiProperty({
    description: 'Account number',
    example: '9161591177',
  })
  @IsString()
  @Length(10, 10)
  accountNumber: string;

  @ApiProperty({
    description: 'Bank Code',
    example: '058',
  })
  @IsString()
  bankCode: string;
}

export class UpdatePayoutDetailsDTO {
  @ApiProperty({
    description: 'The name of the bank',
    example: 'Guaranty Trust Bank',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    description: 'Bank ID',
    example: '058001',
  })
  @IsString()
  @IsNotEmpty()
  bankId: string;

  @ApiProperty({
    description: 'Bank short code',
    example: '058',
  })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({
    description: 'Bank long code',
    example: '058001234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  longcode?: string | null;

  @ApiProperty({
    description: 'The account number of the account holder',
    example: '0123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Account number must be 10 digits' })
  @Matches(/^\d+$/, { message: 'Account number must contain only digits' })
  accountNumber: string;

  @ApiProperty({
    description: 'The name of the account holder',
    example: 'John Chukwuma',
  })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({
    description: 'One-time password',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
