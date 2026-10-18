import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export interface WsAuthPayload {
  sub: string;
  userId: string;
  email?: string;
  userType?: string;
  scope?: string;
  orgId?: string;
  deviceId?: string;
}

declare module 'socket.io' {
  interface Socket {
    auth: WsAuthPayload;
  }
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly secret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.secret =
      this.configService.get<string>('JWT_SECRET') ??
      this.configService.get<string>('JWT_ACCESS_SECRET') ??
      'default-jwt-secret';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const token =
      client.handshake.auth?.token ||
      (typeof client.handshake.headers?.authorization === 'string'
        ? client.handshake.headers.authorization.replace('Bearer ', '')
        : null);

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<WsAuthPayload>(token, {
        secret: this.secret,
      });

      client.auth = payload;

      // Auto-join user room for targeted notifications & direct messages
      const userId = payload.userId || payload.sub;
      client.join(`user:${userId}`);

      if (payload.orgId) {
        client.join(`org:${payload.orgId}`);
      }

      return true;
    } catch {
      throw new WsException('Invalid or expired authentication token');
    }
  }
}
