import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsPhoneNumber, IsIn } from 'class-validator';

export class GetUserDetailsDTO {
  @ApiProperty({ description: 'The ID of the authenticated user' })
  _id: string;
}

export class updatePayoutDetailsDTO {
  @ApiProperty({ description: 'The name of the bank' })
  @IsString()
  bank_name: string;

  @ApiProperty({ description: 'The account number of the account holder' })
  @IsString()
  account_number: string;

  @ApiProperty({ description: 'The name of the account holder' })
  @IsString()
  account_name: string;

  @ApiPropertyOptional({ description: 'one time password' })
  @IsOptional()
  @IsString()
  otp?: string;
}

export class UpdateUserDTO {
  @ApiPropertyOptional({ description: 'The username of the user' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Short bio or description of the user' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Display name of the user' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user (Nigeria format)',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsPhoneNumber('NG')
  phone_number?: string;

  @ApiPropertyOptional({
    description: "User's avatar URL",
    example: 'https://res.cloudinary.com/happr/avatars/sample.jpg',
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({
    description: "User's cover photo URL",
    example: 'https://res.cloudinary.com/happr/covers/sample.jpg',
  })
  @IsOptional()
  @IsString()
  cover_photo_url?: string;

  @ApiPropertyOptional({
    description:
      'Specifies which image type is being uploaded (avatar or cover)',
    enum: ['avatar', 'cover'],
    example: 'avatar',
  })
  @IsOptional()
  @IsIn(['avatar', 'cover'])
  uploadType?: 'avatar' | 'cover';
}
