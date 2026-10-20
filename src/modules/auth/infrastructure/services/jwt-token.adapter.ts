import { Injectable } from '@nestjs/common';
import {
  AccessTokenPayload,
  GenerateAccessTokenResult,
  GeneratePreAuthTokenResult,
  GenerateRefreshTokenResult,
  ITokenPort,
  PreAuthTokenPayload,
} from '../../domain/ports';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTokenAdapter implements ITokenPort {
  private readonly secret: string;
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly preAuthTtl: number;
  private readonly saltRounds: number;

  constructor(
    private jwtService: JwtService
  ) {
    this.secret = process.env['JWT_SECRET']!;
    this.accessTtl = parseInt(process.env['JWT_ACCESS_TTL'] ?? '900', 10);
    this.refreshTtl = parseInt(process.env['JWT_REFRESH_TTL'] ?? '2592000', 10);
    this.preAuthTtl = parseInt(process.env['PRE_AUTH_TOKEN_TTL'] ?? '600', 10);
    this.saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] ?? '12', 10);

    if (!this.secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
  }

  async generateAccessToken(
    payload: Omit<AccessTokenPayload, 'iat' | 'exp' | 'jti'>,
  ): Promise<GenerateAccessTokenResult> {
    const jti = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const fullPayload: AccessTokenPayload = {
      ...payload,
      jti,
      iat: now,
      exp: now + this.accessTtl,
    };

    const token = await this.jwtService.signAsync(fullPayload);

    return { token, jti, expiresAt: new Date((now + this.accessTtl) * 1000) };
  }

  async generateRefreshToken(): Promise<GenerateRefreshTokenResult> {
    const raw = crypto.randomBytes(48).toString('hex');
    const hash = await bcrypt.hash(raw, this.saltRounds);
    const expiresAt = new Date(Date.now() + this.refreshTtl * 1000);
    return { raw, hash, expiresAt };
  }

  async generatePreAuthToken(params: {
    authAccountId: string;
  }): Promise<GeneratePreAuthTokenResult> {
    const now = Math.floor(Date.now() / 1000);

    const payload: PreAuthTokenPayload = {
      authAccountId: params.authAccountId,
      purpose: 'email_verification',
      iat: now,
      exp: now + this.preAuthTtl,
    };

    const token = await this.jwtService.signAsync(payload);

    return { token, expiresAt: new Date((now + this.preAuthTtl) * 1000) };
  }
}
