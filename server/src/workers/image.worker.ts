import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import cloudinary from '../common/config/cloudinary.config';
import { UserService } from '../modules/user/user.service';
import { Logger } from '@nestjs/common';
import { UpdateUserDTO } from '../dtos/user.dto';


interface ImageJobData {
  userId: string;
  fileBuffer: Buffer;
  fileName: string;
  uploadType: 'avatar' | 'cover_photo';
}

@Processor('image-queue')
export class ImageWorker extends WorkerHost {
  private readonly logger = new Logger(ImageWorker.name);

  constructor(private readonly userService: UserService) {
    super();
  }

  async process(job: Job<ImageJobData>) {
    const { userId, fileBuffer, fileName, uploadType } = job.data;

    try {
      const folder = uploadType === 'cover_photo' ? 'happr/covers' : 'happr/avatars';

      const result: { secure_url: string } = await new Promise(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder, public_id: fileName },
            (error, result) => {
              if (error)
                reject(new Error(error.message || 'Cloudinary upload failed'));
              else resolve(result as { secure_url: string });
            },
          );
          uploadStream.end(fileBuffer);
        },
      );

      const updateField: Partial<UpdateUserDTO>  =
        uploadType === 'cover_photo'
          ? { cover_photo: result.secure_url }
          : { avatar: result.secure_url };

      await this.userService.updateUserInfo(userId, updateField);

      this.logger.log(
        `Uploaded ${uploadType}  ${result.secure_url} for user ${userId}`,
      );

      return result.secure_url;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Image upload failed (${uploadType}) for user ${userId}`,
        );
        this.logger.error(error.stack);

        throw error;
      } else {
        const unknownError = new Error('Unknown upload error');
        this.logger.error(
          `Image upload failed (${uploadType}) for user ${userId}`,
          unknownError.stack,
        );
        throw unknownError;
      }
    }
  }
}
