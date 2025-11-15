import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from '../modules/mail/mail.service';
import { Logger } from '@nestjs/common';

interface EmailJobData {
  type: 'verification' | 'welcome' | 'otp';
  data: {
    email: string;
    username: string;
    token?: string;
    expiry?: Date | string;
    otp?: string;
  };
}

@Processor('email-queue')
export class MailWorker extends WorkerHost {
  private readonly logger = new Logger(MailWorker.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<EmailJobData, any, string>) {
    const { type, data } = job.data;

    try {
      switch (type) {
        case 'verification': {
          const expiryString =
            data.expiry instanceof Date
              ? data.expiry.toISOString()
              : data.expiry;

          await this.mailService.sendVerificationEmail(
            data.email,
            data.username,
            data.token!,
            expiryString!,
          );
          break;
        }

        case 'welcome': {
          await this.mailService.sendWelcomeMail(data.email, data.username);
          break;
        }

        case 'otp': {
          await this.mailService.sendPayoutOtp(
            data.email,
            data.otp!,
            data.username,
          );
          break;
        }

        default: {
          this.logger.warn(`Unknown email job type`);
        }
      }

      this.logger.log(`Email job processed: ${type} for ${data.email}`);
    } catch (error) {
      this.logger.error(
        `Email job failed: ${type} for ${data.email}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
