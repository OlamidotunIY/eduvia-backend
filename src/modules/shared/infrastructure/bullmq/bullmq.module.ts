import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { Redis } from 'ioredis';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null, // Required by BullMQ
      }),
    }),
  ],
  exports: [BullModule],
})
export class BullMqModule {}
