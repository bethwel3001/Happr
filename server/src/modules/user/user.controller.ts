import {
  Controller,
  Delete,
  Get,
  Body,
  Post,
  Patch,
  Param,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  UpdateUserDTO,
  GenerateOtpDTO,
  generatePresignedUrlDTO,
} from '../../dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import { CompleteUserDatabaseDTO } from '../../dtos/user.dto';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get authenticated user info',
    description: 'Fetch details of the currently logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: CompleteUserDatabaseDTO,
  })
  @UseGuards(AuthGuard)
  async getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponseDTO<any>> {
    return this.userService.getUserDetails(req.user._id);
  }

  @Post('generate-otp')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate OTP for forgot password, payout or other use cases',
    description:
      'Sends an OTP to the user email to verify before updating sensitive info',
  })
  async generateOtp(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateOtpDTO,
  ): Promise<ApiResponseDTO<{ otpSent: boolean }>> {
    return this.userService.generateOtp(dto.email);
  }

  @Post('presigned-url')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Presigned Url for uploading user avatar photo and cover photo securly!',
    description:
      'Presigned Url for uploading user avatar photo and cover photo securly!',
  })
  async generatePresignedUrl(
    @Body() dto: generatePresignedUrlDTO,
  ): Promise<ApiResponseDTO<any>> {
    return this.userService.generatePresignedUrl(dto);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user information',
    description: 'Updates the profile information of the authenticated user',
  })
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
  ): Promise<ApiResponseDTO<any>> {
    return this.userService.updateUserInfo(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete account',
    description: 'Deletes the account of the authenticated user.',
  })
  @UseGuards(AuthGuard)
  async deleteAccount(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponseDTO> {
    return this.userService.deleteUserAccount(req.user._id, id);
  }
}
