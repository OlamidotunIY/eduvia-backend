import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  LoginDto,
  LogoutDto,
  ResendOtpDto,
  VerifyOtpDto,
  RegisterDto,
} from '../dto/auth.dto';
import {
  LoginCommand,
  LogoutCommand,
  ResendOtpCommand,
  CompleteVerificationCommand,
  CreateAuthAccountCommand,
} from '../../application';
import crypto from 'crypto';

import { GetMeQuery } from '@modules/user';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    return this.commandBus.execute(
      new LoginCommand({
        email: dto.email,
        passwordRaw: dto.password,
        ipAddress,
        userAgent,
        correlationId: crypto.randomUUID(),
      }),
    );
  }

  async logout(dto: LogoutDto) {
    await this.commandBus.execute(
      new LogoutCommand({
        sessionId: dto.sessionId,
        jti: dto.jti,
        correlationId: crypto.randomUUID(),
      }),
    );
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress: string, userAgent: string) {
    return this.commandBus.execute(
      new CompleteVerificationCommand({
        authAccountId: dto.authAccountId,
        value: dto.code,
        ipAddress,
        userAgent,
        correlationId: crypto.randomUUID(),
      }),
    );
  }

  async resendOtp(dto: ResendOtpDto) {
    await this.commandBus.execute(
      new ResendOtpCommand({
        authAccountId: dto.authAccountId,
        correlationId: crypto.randomUUID(),
      }),
    );
  }

  async register(dto: RegisterDto) {
    return this.commandBus.execute(
      new CreateAuthAccountCommand({
        credentialHash: dto.password,
        scope: 'user',
        profileData: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          userType: dto.userType,
        },
        correlationId: crypto.randomUUID(),
      }),
    );
  }

  async getMe(userId: string) {
    return this.queryBus.execute(new GetMeQuery({ userId }));
  }
}
