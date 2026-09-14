import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Domain ports
import { IPasswordHashPort } from './domain/ports/password-hash.port';
import { ITokenPort } from './domain/ports/token.port';
import { IOtpPort } from './domain/ports/otp.port';
import { ITotpPort } from './domain/ports/totp.port';
import { ITokenRevocationPort } from './domain/ports/token-revocation.port';

// Domain repository ports
import { IAuthAccountRepository } from './domain/repository/auth-account.repository';
import { ISessionRepository } from './domain/repository/session.repository';
import { IVerificationRepository } from './domain/repository/verification.repository';

// Infrastructure adapters
import { BcryptPasswordHashAdapter } from './infrastructure/services/bcrypt-password-hash.adapter';
import { JwtTokenAdapter } from './infrastructure/services/jwt-token.adapter';
import { CryptoOtpAdapter } from './infrastructure/services/crypto-otp.adapter';
import { SpeakeasyTotpAdapter } from './infrastructure/services/speakeasy-totp.adapter';
import { RedisTokenRevocationAdapter } from './infrastructure/services/redis-token-revocation.adapter';

// Infrastructure repositories
import { PrismaAuthAccountRepository } from './infrastructure/repository/auth-account.repository';
import { PrismaSessionRepository } from './infrastructure/repository/session.repository';
import { PrismaVerificationRepository } from './infrastructure/repository/verification.repository';

// Mappers
import { AuthAccountMapper } from './infrastructure/mappers/auth-account.mapper';
import { SessionMapper } from './infrastructure/mappers/session.mapper';
import { VerificationMapper } from './infrastructure/mappers/verification.mapper';

// Command handlers
import { CreateAuthAccountHandler } from './application/commands/create-auth-account/create-auth-account.handler';
import { CompleteVerificationHandler } from './application/commands/complete-verification/complete-verification.handler';
import { SuspendAuthAccountHandler } from './application/commands/suspend-auth-account/suspend-auth-account.handler';
import { UpdateCredentialsHandler } from './application/commands/update-credential/update-credential.handler';
import { RevokeAllSessionsHandler } from './application/commands/revoke-all-sessions/revoke-all-sessions.handler';
import { IssueAuthTokensHandler } from './application/commands/issue-auth-tokens/issue-auth-tokens.handler';
import { LogoutHandler } from './application/commands/logout/logout.handler';
import { ResendOtpHandler } from './application/commands/resend-otp/resend-otp.handler';

// Query handlers
import { GetAuthAccountHandler } from './application/queries/get-auth-account/get-auth-account.handler';
import { GetSessionHandler } from './application/queries/get-session/get-session.handler';
import { GetVerificationHandler } from './application/queries/get-verification/get-verification.handler';

// Shared
import { PrismaService } from '../shared/infrastructure/prisma.service';

const CommandHandlers = [
  CreateAuthAccountHandler,
  CompleteVerificationHandler,
  SuspendAuthAccountHandler,
  UpdateCredentialsHandler,
  RevokeAllSessionsHandler,
  IssueAuthTokensHandler,
  LogoutHandler,
  ResendOtpHandler,
];

const QueryHandlers = [
  GetAuthAccountHandler,
  GetSessionHandler,
  GetVerificationHandler,
];

const Mappers = [
  AuthAccountMapper,
  SessionMapper,
  VerificationMapper,
];

const PortBindings = [
  { provide: IPasswordHashPort,      useClass: BcryptPasswordHashAdapter },
  { provide: ITokenPort,             useClass: JwtTokenAdapter },
  { provide: IOtpPort,               useClass: CryptoOtpAdapter },
  { provide: ITotpPort,              useClass: SpeakeasyTotpAdapter },
  { provide: ITokenRevocationPort,   useClass: RedisTokenRevocationAdapter },
  { provide: IAuthAccountRepository, useClass: PrismaAuthAccountRepository },
  { provide: ISessionRepository,     useClass: PrismaSessionRepository },
  { provide: IVerificationRepository, useClass: PrismaVerificationRepository },
];

@Module({
  imports: [CqrsModule],
  providers: [
    PrismaService,
    ...Mappers,
    ...PortBindings,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    IPasswordHashPort,
    ITokenPort,
    IOtpPort,
    ITotpPort,
    ITokenRevocationPort,
    PrismaService,
  ],
})
export class AuthModule {}
