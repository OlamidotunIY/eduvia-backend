
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from '../../infrastructure';
import { CurrentUserPayload } from '../decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<CurrentUserPayload>(
        token,
      );

      if (!payload.jti || !payload.sessionId || !payload.userId) {
        throw new UnauthorizedException();
      }

      const client = this.redisService.getClient();
      const [isRevoked, sessionExists] = await Promise.all([
        client.exists(`revoked:${payload.jti}`),
        client.exists(`auth:session:${payload.sessionId}`),
      ]);

      if (isRevoked || !sessionExists) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
