import {
  Controller,
  UseInterceptors,
  Delete,
  Get,
  Body,
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
import { UpdateUserDTO, UpdatePayoutDetailsDTO } from '../../dtos/user.dto';
import { ApiResponseDTO } from '../../dtos/api.response.dto'; // Add this import
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CompleteUserDatabaseDTO } from '../../dtos/user.dto';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard';

@ApiTags('User Management')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectQueue('image-queue') private readonly imageQueue: Queue,
  ) {}

  @Get('me')
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

  @Patch(':id')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
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
      cover?: Express.Multer.File[];
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

    if (files?.cover?.[0]) {
      await this.imageQueue.add('upload-image', {
        userId: id,
        fileBuffer: files.cover[0].buffer,
        fileName: files.cover[0].originalname,
        uploadType: 'cover',
      });
    }

    return this.userService.updateUserInfo(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete account',
    description: 'Deletes the account of the authenticated user.',
  })
  @UseGuards(AuthGuard)
  async deleteAccount(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponseDTO> {
    // Add return type
    return this.userService.deleteUserAccount(req.user._id, id);
  }

  @Get('generate-otp')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate OTP for payout or other use cases',
    description:
      'Sends an OTP to the user email to verify before updating sensitive info',
  })
  @UseGuards(AuthGuard)
  async requestPayoutOtp(
    @Req() req: AuthenticatedRequest,
  ): Promise<ApiResponseDTO<{ otpSent: boolean }>> {
    const userId = req?.user._id;
    return this.userService.generateOtp(userId);
  }

  @Patch('payout-details')
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
