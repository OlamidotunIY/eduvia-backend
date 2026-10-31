import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ChangePasswordDto,
  LoginDto,
  LogoutDto,
  RequestPasswordResetDto,
  ResendOtpDto,
  RefreshTokenDto,
  VerifyOtpDto,
  GoogleAuthorizationDto,
  GoogleTokenExchangeDto,
  RegisterEmailDto,
} from '../dto/auth.dto';
import {
  ChangePasswordCommand,
  LoginCommand,
  LogoutCommand,
  RequestPasswordResetCommand,
  RefreshSessionCommand,
  ResendOtpCommand,
  CompleteVerificationCommand,
  StartGoogleOAuthCommand,
  CompleteGoogleOAuthCommand,
  ExchangeGoogleOAuthCommand,
  StartEmailRegistrationCommand,
  GetCurrentUserBootstrapQuery,
} from '../../application';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getCurrentUserBootstrap(userId: string) {
    return this.queryBus.execute(new GetCurrentUserBootstrapQuery({ userId }));
  }

  async beginGoogle(dto: GoogleAuthorizationDto) {
    return this.commandBus.execute(
      new StartGoogleOAuthCommand({
        intent: dto.intent,
        returnPath: dto.returnPath,
      }),
    );
  }

  async completeGoogle(
    code: string | undefined,
    state: string | undefined,
    ipAddress: string,
    userAgent: string,
  ) {
    return this.commandBus.execute(
      new CompleteGoogleOAuthCommand({ code, state, ipAddress, userAgent }),
    );
  }

  async exchangeGoogle(dto: GoogleTokenExchangeDto) {
    return this.commandBus.execute(new ExchangeGoogleOAuthCommand(dto));
  }

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

  async registerEmail(dto: RegisterEmailDto, correlationId: string) {
    return this.commandBus.execute(
      new StartEmailRegistrationCommand({
        email: dto.email,
        passwordRaw: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        timezone: dto.timezone,
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
