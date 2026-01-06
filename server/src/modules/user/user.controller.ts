import {
  Controller,
  Delete,
  Get,
  Body,
  Post,
  Patch,
  Param,
  Req,
  Query,
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
  generateSignatureDTO,
  ChangeEmailDTO,
  UserStatsDTO,
  DonationDetailsDTO,
  PaginationQueryDTO,
} from './dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import { CompleteUserDatabaseDTO, PublicUserProfileDTO } from './dtos/user.dto';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

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

  @Get('stats')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get authenticated user stats',
    description: 'Fetch donation statistics for the currently logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    type: UserStatsDTO,
  })
  @UseGuards(AuthGuard)
  async getStats(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponseDTO<UserStatsDTO>> {
    return this.userService.getUserStats(req.user._id);
  }

  @Get('donations')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get recent donations',
    description: 'Fetch paginated recent donations for the currently logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent donations',
    type: [DonationDetailsDTO],
  })
  @UseGuards(AuthGuard)
  async getDonations(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDTO,
  ): Promise<ApiResponseDTO<DonationDetailsDTO[]>> {
    return this.userService.getRecentDonations(req.user._id, query.page, query.limit);
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

  @Post('signature')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary:
      'Generate signature for uploading user avatar photo and cover photo securely!',
    description:
      'Generate signature for uploading user avatar photo and cover photo securely!',
  })
  async generateSignature(
    @Body() dto: generateSignatureDTO,
  ): Promise<ApiResponseDTO<any>> {
    return this.userService.generateSignature(dto);
  }

  @Patch('change-email')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Change user email',
    description:
      'Updates the user email and sends a verification link to the new email.',
  })
  async changeEmail(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangeEmailDTO,
  ): Promise<ApiResponseDTO> {
    return this.userService.changeEmail(req.user._id, dto.email);
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

  @Get(':username/donations')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get public user donations',
    description: 'Fetch recent donations for a user by username.',
  })
  @ApiResponse({
    status: 200,
    description: 'Public donations list',
    type: [DonationDetailsDTO],
  })
  async getPublicDonations(
    @Param('username') username: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ApiResponseDTO<DonationDetailsDTO[]>> {
    return this.userService.getPublicDonations(username, Number(page), Number(limit));
  }

  @Get(':username')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get public user profile',
    description: 'Fetch public profile details of a user by username.',
  })
  @ApiResponse({
    status: 200,
    description: 'Public user profile',
    type: PublicUserProfileDTO,
  })
  async getPublicProfile(
    @Param('username') username: string,
  ): Promise<ApiResponseDTO<PublicUserProfileDTO>> {
    return this.userService.getPublicProfile(username);
  }
}
