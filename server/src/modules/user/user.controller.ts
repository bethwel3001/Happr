import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Delete,
  Get,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  HttpCode,
  UnsupportedMediaTypeException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { UpdateUserDTO } from '../../dtos/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Express } from 'express';
import { updatePayoutDetailsDTO } from '../../dtos/user.dto';
@ApiTags('User')
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
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    return this.userService.getUserDetails({ _id: req.user._id });
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update user info or upload avatar/cover photo',
    description:
      'Allows partial updates to user information and optional upload of avatar or cover photo.',
  })
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
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
    }),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      if (!dto.uploadType)
        throw new BadRequestException('Missing uploadType: avatar or cover');

      await this.imageQueue.add('upload-image', {
        userId: id,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        uploadType: dto.uploadType,
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
  async deleteAccount(@Param('id') id: string, @Req() req: any) {
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
  async requestPayoutOtp(@Req() req: any) {
    const userId = req?.user._id as string;
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
    @Req() req: any,
    @Body() dto: updatePayoutDetailsDTO,
  ) {
    const userId = req.user._id;
    return this.userService.updatePayoutDetails(userId, dto);
  }
}
