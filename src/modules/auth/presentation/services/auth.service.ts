import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ChangePasswordDto,
  LoginDto,
  LogoutDto,
  RequestPasswordResetDto,
  ResendOtpDto,
  RefreshTokenDto,
  VerifyOtpDto,
} from '../dto/auth.dto';
import {
  ChangePasswordCommand,
  LoginCommand,
  LogoutCommand,
  RequestPasswordResetCommand,
  RefreshSessionCommand,
  ResendOtpCommand,
  CompleteVerificationCommand,
} from '../../application';

@Injectable()
export class AuthService {
  constructor(private readonly commandBus: CommandBus) {}

  async login(
    dto: LoginDto,
    ipAddress: string,
    userAgent: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new LoginCommand({
        email: dto.email,
        passwordRaw: dto.password,
        ipAddress,
        userAgent,
        correlationId,
      }),
    );
  }

  async refresh(dto: RefreshTokenDto, ipAddress: string, userAgent: string) {
    return this.commandBus.execute(
      new RefreshSessionCommand({
        sessionId: dto.sessionId,
        refreshToken: dto.refreshToken,
        ipAddress,
        userAgent,
      }),
    );
  }

  async logout(dto: LogoutDto, correlationId: string) {
    await this.commandBus.execute(
      new LogoutCommand({
        sessionId: dto.sessionId,
        jti: dto.jti,
        correlationId,
      }),
    );
  }

  async verifyOtp(
    dto: VerifyOtpDto,
    ipAddress: string,
    userAgent: string,
    correlationId: string,
  ) {
    return this.commandBus.execute(
      new CompleteVerificationCommand({
        email: dto.email,
        code: dto.code,
        ipAddress,
        userAgent,
        correlationId,
      }),
    );
  }

  async resendOtp(dto: ResendOtpDto, correlationId: string) {
    await this.commandBus.execute(
      new ResendOtpCommand({
        email: dto.email,
        correlationId,
      }),
    );
  }

  async requestPasswordReset(
    dto: RequestPasswordResetDto,
    correlationId: string,
  ) {
    await this.commandBus.execute(
      new RequestPasswordResetCommand({
        email: dto.email,
        correlationId,
      }),
    );
  }

  async changePassword(dto: ChangePasswordDto) {
    await this.commandBus.execute(
      new ChangePasswordCommand({
        email: dto.email,
        code: dto.code,
        newPassword: dto.newPassword,
      }),
    );
  }
}
