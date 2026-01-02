import type { Response } from 'express';
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  Patch,
  Res,
  Req,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  SignupDTO,
  SignInDTO,
  ResetPasswordDTO,
  UsernameAvailabilityDTO,
  ForgotEmailPasswordDTO,
} from '../../dtos/auth.module.dto';
import { AuthService } from './auth.service';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('username')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Check username availability',
    description:
      'Verifies if a given username is already taken or available for registration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Username availability checked successfully',
    type: ApiResponseDTO,
  })
  checkusername(@Query() dto: UsernameAvailabilityDTO) {
    return this.authService.checkUsernameAvailability(dto);
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Registers a new user using email, username, and password.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: ApiResponseDTO,
  })
  signup(@Body() dto: SignupDTO) {
    return this.authService.signup(dto);
  }

  @Get('verify-email')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verify user email',
    description: 'Verifies a user’s email using a token sent to their mailbox.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: ApiResponseDTO,
  })
  async verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponseDTO> {
    const { access_token, refresh_token, is_onboarded } =
      await this.authService.verifyEmail(token);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'Email verified successfully!',
      data: { is_onboarded },
    };
  }

  @Post('signin')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates a user using their credentials and returns a JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'User signed in successfully',
    type: ApiResponseDTO,
  })
  async signin(
    @Body() dto: SignInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponseDTO> {
    const { access_token, refresh_token } = await this.authService.signin(dto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      message: 'User signed in successfully',
      data: [],
    };
  }

  @Delete('signout')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logs out a user by deleting their JWT tokens from their browser, and also deleting refresh token from DB.',
  })
  @ApiResponse({
    status: 200,
    description: 'User signed out successfully',
    type: ApiResponseDTO,
  })
  @UseGuards(AuthGuard)
  async signout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponseDTO> {
    await this.authService.signout(req.user._id);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return {
      success: true,
      message: 'User signed out successfully',
      data: [],
    };
  }

  @Get('google-auth')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get Google OAuth URL',
    description:
      'Returns a Google authentication URL. Use this URL on the frontend to temporarily redirect the user to Google login via `window.location.href`.',
  })
  @ApiResponse({
    status: 200,
    description: 'The Google OAuth URL as JSON',
  })
  googleAuth(): ApiResponseDTO {
    const authUri = this.authService.generateGoogleAuthUri();
    return {
      success: true,
      message: 'Google OAuth URL generated successfully',
      data: {
        uri: authUri,
      },
    };
  }

  @Get('google/callback')
  async handleGoogleAuthCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        return res.redirect(
          `${process.env.FRONTEND_DOMAIN}/complete-google-auth-setup?status=error`,
        );
      }

      const { access_token, refresh_token } =
        await this.authService.googleAuthCallback(code);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `${process.env.FRONTEND_DOMAIN}/complete-google-auth-setup?status=success`,
      );
    } catch {
      return res.redirect(
        `${process.env.FRONTEND_DOMAIN}/complete-google-auth-setup?status=error`,
      );
    }
  }

  @Get('x-auth')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get X (Twitter) OAuth URL',
    description:
      'Returns an X authentication URL. Use this URL on the frontend to temporarily redirect the user to X login.',
  })
  @ApiResponse({
    status: 200,
    description: 'The X OAuth URL as JSON',
  })
  xAuth(): Promise<ApiResponseDTO> {
    return this.authService.generateXAuthUri().then((uri) => ({
      success: true,
      message: 'X OAuth URL generated successfully',
      data: {
        uri,
      },
    }));
  }

  @Get('x/callback')
  async handleXAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code || !state) {
        return res.redirect(
          `${process.env.FRONTEND_DOMAIN}/complete-x-auth-setup?status=error`,
        );
      }

      const { access_token, refresh_token } =
        await this.authService.xAuthCallback(code, state);

      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `${process.env.FRONTEND_DOMAIN}/complete-x-auth-setup?status=success`,
      );
    } catch {
      return res.redirect(
        `${process.env.FRONTEND_DOMAIN}/complete-x-auth-setup?status=error`,
      );
    }
  }

  @Post('verify-forgot-email-password-otp')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify OTP for forgot password' })
  @ApiResponse({
    status: 200,
    description:
      'OTP verified. Access token generated. Use token to reset password.',
    type: ApiResponseDTO,
  })
  async forgotPassword(@Body() dto: ForgotEmailPasswordDTO) {
    return this.authService.verifyForgotPassword(dto);
  }

  @Patch('reset-password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset password using the token generated after OTP verification',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ApiResponseDTO,
  })
  resetPasswordWithEmail(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ResetPasswordDTO,
  ) {
    return this.authService.resetPassword(req.user._id, dto);
  }
}
