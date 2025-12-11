import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from './payouts.service';
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        username: 'default',
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [PayoutsService, PrismaService],
  controllers: [PayoutsController],
})
export class PayoutsModule {}
