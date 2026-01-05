import {
  IsEmail,
  MaxLength,
  IsNotEmpty,
  Matches,
  MinLength,
  IsLowercase,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UsernameAvailabilityDTO {
  @ApiProperty()
  @IsLowercase({ message: 'Username must be in lowercase' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username cannot exceed 20 characters' })
  username: string;
}

export class SignupDTO {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(20, { message: 'Username cannot exceed 20 characters' })
  username: string;

  @ApiProperty()
  @MinLength(5, { message: 'password must be at least 5 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}

export class SignInDTO {
  @ApiProperty()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty()
  @MinLength(5, { message: 'password must be at least 5 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}

export class ResetPasswordDTO {
  @ApiProperty()
  @MinLength(5, { message: 'password must be at least 5 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one special character',
  })
  newPassword!: string;
}

export class ForgotEmailPasswordDTO {
  @ApiProperty({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'OTP must be at least 6 characters long',
  })
  otp: string;
}
