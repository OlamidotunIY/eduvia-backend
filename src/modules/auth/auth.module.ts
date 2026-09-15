import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@modules/user';
import {
  AuthEventProcessor,
  CompleteVerificationHandler,
  CreateAuthAccountHandler,
  GetAuthAccountByUserIdHandler,
  GetAuthAccountHandler,
  GetPendingVerificationHandler,
  GetSessionHandler,
  GetVerificationHandler,
  IssueAuthTokensHandler,
  LoginHandler,
  LogoutHandler,
  ResendOtpHandler,
  RevokeAllSessionsHandler,
  SuspendAuthAccountHandler,
  UpdateCredentialsHandler,
} from './application';
import {
  AuthAccountMapper,
  BcryptPasswordHashAdapter,
  CryptoOtpAdapter,
  JwtTokenAdapter,
  PrismaAuthAccountRepository,
  PrismaSessionRepository,
  PrismaVerificationRepository,
  RedisTokenRevocationAdapter,
  SessionMapper,
  SpeakeasyTotpAdapter,
  VerificationMapper,
} from './infrastructure';
import {
  IAuthAccountRepository,
  IOtpPort,
  IPasswordHashPort,
  ISessionRepository,
  ITokenPort,
  ITokenRevocationPort,
  ITotpPort,
  IVerificationRepository,
} from './domain';
import { PrismaService, RedisService } from '@modules/shared';
import { AuthService } from './presentation';

const CommandHandlers = [
  CreateAuthAccountHandler,
  CompleteVerificationHandler,
  SuspendAuthAccountHandler,
  UpdateCredentialsHandler,
  RevokeAllSessionsHandler,
  IssueAuthTokensHandler,
  LogoutHandler,
  ResendOtpHandler,
  LoginHandler,
];

const EventProcessors = [AuthEventProcessor];

const QueryHandlers = [
  GetAuthAccountHandler,
  GetAuthAccountByUserIdHandler,
  GetSessionHandler,
  GetVerificationHandler,
  GetPendingVerificationHandler,
];

const Mappers = [AuthAccountMapper, SessionMapper, VerificationMapper];

const PortBindings = [
  { provide: IPasswordHashPort, useClass: BcryptPasswordHashAdapter },
  { provide: ITokenPort, useClass: JwtTokenAdapter },
  { provide: IOtpPort, useClass: CryptoOtpAdapter },
  { provide: ITotpPort, useClass: SpeakeasyTotpAdapter },
  { provide: ITokenRevocationPort, useClass: RedisTokenRevocationAdapter },
  { provide: IAuthAccountRepository, useClass: PrismaAuthAccountRepository },
  { provide: ISessionRepository, useClass: PrismaSessionRepository },
  { provide: IVerificationRepository, useClass: PrismaVerificationRepository },
];

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    CqrsModule,
    UserModule,
    BullModule.registerQueue({ name: 'auth-events' }),
  ],
  providers: [
    PrismaService,
    RedisService,
    AuthService,
    ...Mappers,
    ...PortBindings,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventProcessors,
  ],
  exports: [
    IPasswordHashPort,
    ITokenPort,
    IOtpPort,
    ITotpPort,
    ITokenRevocationPort,
    PrismaService,
    AuthService,
  ],
})
export class AuthModule {}
