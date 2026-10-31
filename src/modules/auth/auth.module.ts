import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@modules/user';
import { OrgModule } from '@modules/org';
import {
  ChangePasswordHandler,
  CompleteVerificationHandler,
  GetSessionHandler,
  GetCurrentUserBootstrapHandler,
  LoginHandler,
  RefreshSessionHandler,
  LogoutHandler,
  RequestPasswordResetHandler,
  ResendOtpHandler,
  RevokeAllSessionsHandler,
  StartGoogleOAuthHandler,
  CompleteGoogleOAuthHandler,
  ExchangeGoogleOAuthHandler,
  FinalizeRegistrationHandler,
  StartEmailRegistrationHandler,
  GetRegistrationStatusHandler,
} from './application';
import {
  AuthRegistrationEventProcessor,
  AuthAccountMapper,
  CryptoOtpAdapter,
  JwtTokenAdapter,
  PrismaAuthAccountRepository,
  PrismaSessionRepository,
  PrismaVerificationRepository,
  PrismaRegistrationRequestRepository,
  RedisTokenRevocationAdapter,
  SessionMapper,
  SpeakeasyTotpAdapter,
  GoogleOAuthAdapter,
  VerificationMapper,
  RegistrationRequestMapper,
} from './infrastructure';
import {
  IAuthAccountRepository,
  IOtpPort,
  ISessionRepository,
  ITokenPort,
  ITokenRevocationPort,
  ITotpPort,
  IVerificationRepository,
  IGoogleOAuthPort,
  IRegistrationRequestRepository,
} from './domain';
import {
  AuthGuard,
  BcryptPasswordHashAdapter,
  IPasswordHashPort,
} from '@modules/shared';
import { AuthService } from './presentation';
import { AuthController } from './presentation/controllers/auth.controller';
import { MeController } from './presentation/controllers/me.controller';

const CommandHandlers = [
  CompleteVerificationHandler,
  ChangePasswordHandler,
  RevokeAllSessionsHandler,
  LogoutHandler,
  ResendOtpHandler,
  RequestPasswordResetHandler,
  LoginHandler,
  RefreshSessionHandler,
  StartGoogleOAuthHandler,
  CompleteGoogleOAuthHandler,
  ExchangeGoogleOAuthHandler,
  FinalizeRegistrationHandler,
  StartEmailRegistrationHandler,
];

const EventProcessors = [AuthRegistrationEventProcessor];

const QueryHandlers = [
  GetSessionHandler,
  GetCurrentUserBootstrapHandler,
  GetRegistrationStatusHandler,
];

const Mappers = [AuthAccountMapper, SessionMapper, VerificationMapper, RegistrationRequestMapper];

const PortBindings = [
  { provide: IPasswordHashPort, useClass: BcryptPasswordHashAdapter },
  { provide: ITokenPort, useClass: JwtTokenAdapter },
  { provide: IOtpPort, useClass: CryptoOtpAdapter },
  { provide: ITotpPort, useClass: SpeakeasyTotpAdapter },
  { provide: ITokenRevocationPort, useClass: RedisTokenRevocationAdapter },
  { provide: IAuthAccountRepository, useClass: PrismaAuthAccountRepository },
  { provide: ISessionRepository, useClass: PrismaSessionRepository },
  { provide: IVerificationRepository, useClass: PrismaVerificationRepository },
  { provide: IRegistrationRequestRepository, useClass: PrismaRegistrationRequestRepository },
  { provide: IGoogleOAuthPort, useClass: GoogleOAuthAdapter },
];

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    CqrsModule,
    UserModule,
    OrgModule,
    BullModule.registerQueue({ name: 'auth-events' }),
  ],
  controllers: [AuthController, MeController],
  providers: [
    AuthGuard,
    AuthService,
    ...Mappers,
    ...PortBindings,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventProcessors,
  ],
})
export class AuthModule {}
