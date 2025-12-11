import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    JwtModule.register({ global: true }),
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
  providers: [UserService, PrismaService],
  controllers: [UserController],
})
export class UserModule {}
