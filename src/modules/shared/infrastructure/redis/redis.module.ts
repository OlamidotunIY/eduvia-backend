import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AuthGuard } from '../../presentation/guard/jwt-auth.guard';

@Global()
@Module({
  providers: [RedisService, AuthGuard],
  exports: [RedisService, AuthGuard],
})
export class RedisModule {}
