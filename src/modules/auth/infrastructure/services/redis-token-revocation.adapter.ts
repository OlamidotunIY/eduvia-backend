import { Injectable } from '@nestjs/common';
import { RedisService } from '@modules/shared';
import { ITokenRevocationPort } from '../../domain/ports';

@Injectable()
export class RedisTokenRevocationAdapter implements ITokenRevocationPort {
  constructor(private readonly redisService: RedisService) {}

  async revoke(jti: string, ttlSeconds: number): Promise<void> {
    const client = this.redisService.getClient();
    await client.set(`revoked:${jti}`, '1', 'EX', ttlSeconds);
  }

  async isRevoked(jti: string): Promise<boolean> {
    const client = this.redisService.getClient();
    return (await client.exists(`revoked:${jti}`)) === 1;
  }
}
