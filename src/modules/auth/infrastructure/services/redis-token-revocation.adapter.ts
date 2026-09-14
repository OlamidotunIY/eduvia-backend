import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { ITokenRevocationPort } from '../../domain/ports';

@Injectable()
export class RedisTokenRevocationAdapter
  implements ITokenRevocationPort, OnModuleInit, OnModuleDestroy
{
  private client!: Redis;

  onModuleInit(): void {
    this.client = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`revoked:${jti}`, '1', 'EX', ttlSeconds);
  }

  async isRevoked(jti: string): Promise<boolean> {
    return (await this.client.exists(`revoked:${jti}`)) === 1;
  }
}
