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
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { payoutDetailsInitDTO, UpdateUserDTO } from '../../dtos/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Express } from 'express';

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

  @Post('payout/init')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Initiate payout settings update (send OTP)',
    description: 'Sends an OTP to verify user before updating payout settings.',
  })
  @UseGuards(AuthGuard)
  async getUpdatePayoutSettingsOtp(
    @Body() dto: payoutDetailsInitDTO,
    @Req() req: any,
  ) {
    return this.userService.getUpdatePayoutSettingsOtp(req.user._id);
  }
}
