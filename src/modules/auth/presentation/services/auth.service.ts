import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { IPasswordHashPort } from '../../domain/ports/password-hash.port';
import { LoginDto, LogoutDto, ResendOtpDto, VerifyOtpDto } from '../dto/auth.dto';
import { GetUserByEmailQuery } from '@modules/user';
import { 
  IssueAuthTokensCommand,
  LogoutCommand,
  ResendOtpCommand,
  CompleteVerificationCommand,
  GetAuthAccountByUserIdQuery,
  GetPendingVerificationQuery,
  AuthStatus
} from '../../application';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly passwordHashPort: IPasswordHashPort,
  ) {}

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    // 1. Get user by email
    let user;
    try {
      user = await this.queryBus.execute(new GetUserByEmailQuery({ email: dto.email }));
    } catch (e) {
      throw new UnauthorizedException('Invalid credentials'); // Use generic message for security
    }

    // 2. Get auth account by user ID
    let authAccount;
    try {
      authAccount = await this.queryBus.execute(new GetAuthAccountByUserIdQuery({ userId: user.id }));
    } catch (e) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Verify password
    const isPasswordValid = await this.passwordHashPort.verify(dto.password, authAccount.credentialHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Check status
    if (authAccount.authStatus === AuthStatus.PENDING_EMAIL_VERIFICATION) {
      // Re-trigger OTP resend
      await this.commandBus.execute(
        new ResendOtpCommand({
          authAccountId: authAccount.id,
          correlationId: crypto.randomUUID(),
        })
      );
      throw new ForbiddenException('Email not verified. A new OTP has been sent.');
    }

    if (authAccount.authStatus === AuthStatus.SUSPENDED) {
      throw new ForbiddenException('Account is suspended.');
    }

    // 5. Issue Tokens
    const tokens = await this.commandBus.execute(
      new IssueAuthTokensCommand({
        id: authAccount.id, // For creating new session? Wait, the command expects 'id' which might be the session ID or aggregate ID? Let's check IssueAuthTokensCommand
        authAccountId: authAccount.id,
        userId: user.id,
        userType: user.userType,
        scope: authAccount.scope,
        ipAddress,
        userAgent,
        correlationId: crypto.randomUUID(),
      })
    );

    return tokens;
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
    let verification;
    try {
      verification = await this.queryBus.execute(
        new GetPendingVerificationQuery({ authAccountId: dto.authAccountId })
      );
    } catch (e) {
      throw new NotFoundException('No pending verification found');
    }

    await this.commandBus.execute(
      new CompleteVerificationCommand({
        verificationId: verification.id,
        value: dto.code,
        correlationId: crypto.randomUUID(),
      })
    );

    // Issue tokens after successful verification (Option A)
    const authAccount = await this.queryBus.execute(
      new GetAuthAccountQuery({ authAccountId: dto.authAccountId })
    );

    // We need to fetch the user by userId to pass userType to IssueAuthTokensCommand
    // Assuming GetUserByIdQuery exists (it does)
    const { GetUserByIdQuery } = await import('@modules/user');
    const user = await this.queryBus.execute(
      new GetUserByIdQuery({ userId: authAccount.userId })
    );

    const tokens = await this.commandBus.execute(
      new IssueAuthTokensCommand({
        id: 0,
        authAccountId: authAccount.id,
        userId: user.id,
        userType: user.userType,
        scope: authAccount.scope,
        ipAddress,
        userAgent,
        correlationId: crypto.randomUUID(),
      })
    );

    return tokens;
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
