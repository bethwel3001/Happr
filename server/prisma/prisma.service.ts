import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaService | undefined;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      log: ['query', 'info', 'warn', 'error'],
    });

    if (process.env.NODE_ENV !== 'production' && !global.prisma) {
      global.prisma = this;
    }
  }

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$connect();
  }

  async onModuleDestroy() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.$disconnect();
  }
}

export const prisma =
  process.env.NODE_ENV !== 'production' && global.prisma
    ? global.prisma
    : new PrismaService();
