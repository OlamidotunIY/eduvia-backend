import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@modules/user';
import {
  ChangePasswordHandler,
  CompleteVerificationHandler,
  CreateAuthAccountHandler,
  GetSessionHandler,
  LoginHandler,
  LogoutHandler,
  RequestPasswordResetHandler,
  ResendOtpHandler,
  RevokeAllSessionsHandler,
} from './application';
import {
  AuthEventProcessor,
  AuthAccountMapper,
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
  ISessionRepository,
  ITokenPort,
  ITokenRevocationPort,
  ITotpPort,
  IVerificationRepository,
} from './domain';
import {
  AuthGuard,
  BcryptPasswordHashAdapter,
  IPasswordHashPort,
  PrismaService,
  RedisService,
} from '@modules/shared';
import { AuthService } from './presentation';

const CommandHandlers = [
  CreateAuthAccountHandler,
  CompleteVerificationHandler,
  ChangePasswordHandler,
  RevokeAllSessionsHandler,
  LogoutHandler,
  ResendOtpHandler,
  RequestPasswordResetHandler,
  LoginHandler,
];

const EventProcessors = [AuthEventProcessor];

const QueryHandlers = [GetSessionHandler];

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
    AuthGuard,
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
