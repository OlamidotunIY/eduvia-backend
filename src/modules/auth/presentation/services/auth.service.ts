import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LoginDto, LogoutDto, ResendOtpDto, VerifyOtpDto } from '../dto/auth.dto';
import { 
  LoginCommand,
  LogoutCommand,
  ResendOtpCommand,
  CompleteVerificationCommand,
} from '../../application';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
  ) {}

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    return this.commandBus.execute(
      new LoginCommand({
        email: dto.email,
        passwordRaw: dto.password,
        ipAddress,
        userAgent,
        correlationId: crypto.randomUUID(),
      })
    );
  }

  async logout(dto: LogoutDto) {
    await this.commandBus.execute(
      new LogoutCommand({
        sessionId: dto.sessionId,
        jti: dto.jti,
        correlationId: crypto.randomUUID(),
      })
    );
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress: string, userAgent: string) {
    return this.commandBus.execute(
      new CompleteVerificationCommand({
        verificationId: dto.authAccountId, // Will be updated to take authAccountId instead
        value: dto.code,
        ipAddress,
        userAgent,
        correlationId: crypto.randomUUID(),
      } as any)
    );
  }

  async resendOtp(dto: ResendOtpDto) {
    await this.commandBus.execute(
      new ResendOtpCommand({
        authAccountId: dto.authAccountId,
        correlationId: crypto.randomUUID(),
      })
    );
  }
}
