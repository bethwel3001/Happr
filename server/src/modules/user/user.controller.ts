import {
  Controller,
  UseInterceptors,
  Delete,
  Get,
  Body,
  Post,
  Patch,
  Param,
  Req,
  UseGuards,
  HttpCode,
  UnsupportedMediaTypeException,
  UploadedFiles,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  UpdateUserDTO,
  GenerateOtpDTO,
  UpdatePayoutDetailsDTO,
} from '../../dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CompleteUserDatabaseDTO } from '../../dtos/user.dto';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard';

@ApiTags('User Management')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectQueue('image-queue') private readonly imageQueue: Queue,
  ) {}

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

  @Patch(':id')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
      summary: 'Update user information',
      description:
      'Updates the profile information of the authenticated user, including optional avatar and cover photo uploads.',
  })
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover_photo', maxCount: 1 },
      ],
      {
        limits: { fileSize: 7 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
          const allowed = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp',
          ];
          if (!allowed.includes(file.mimetype)) {
            return cb(
              new UnsupportedMediaTypeException(
                'Invalid file type. Only JPEG, PNG, JPG, and WEBP are allowed.',
              ),
              false,
            );
          }
          cb(null, true);
        },
      },
    ),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      cover_photo?: Express.Multer.File[];
    },
  ): Promise<ApiResponseDTO<any>> {
    if (files?.avatar?.[0]) {
      await this.imageQueue.add('upload-image', {
        userId: id,
        fileBuffer: files.avatar[0].buffer,
        fileName: files.avatar[0].originalname,
        uploadType: 'avatar',
      });
    }

    if (files?.cover_photo?.[0]) {
      await this.imageQueue.add('upload-image', {
        userId: id,
        fileBuffer: files.cover_photo[0].buffer,
        fileName: files.cover_photo[0].originalname,
        uploadType: 'cover_photo',
      });
    }

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

  @Patch('payout-details')
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update payout details',
    description:
      'Updates the payout details of the authenticated user with OTP verification.',
  })
  @UseGuards(AuthGuard)
  async updatePayoutDetails(
    @Body() dto: UpdatePayoutDetailsDTO,
    @Req() req: AuthenticatedRequest,
  ): Promise<
    ApiResponseDTO<{
      bank_name: string;
      account_name: string;
      account_number: string;
    }>
  > {
    console.log(dto);
    const userId = req.user._id;
    return this.userService.updatePayoutDetails(userId, dto);
  }
}
