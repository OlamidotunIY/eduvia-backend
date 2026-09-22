import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  AuthGuard,
  BcryptPasswordHashAdapter,
  IPasswordHashPort,
  IUserQueryPort,
  PrismaService,
  RedisService,
} from '@modules/shared';
import { UserEventProcessor } from './infrastructure/messaging';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { PrismaUserRepository } from './infrastructure/repository/user-repository.adapter';
import { UserMapper } from './infrastructure/mappers';
import { IUserRepository } from './domain/repository/user.repository';
import {
  GetUserByEmailHandler,
  GetUserByIdHandler,
} from './application/query';
import { MarkEmailVerifiedHandler } from './application/commands';
import { UserQueryAdapter } from './infrastructure';
import { UserController, UserService } from './presentation';

const CommandHandlers = [CreateUserHandler, MarkEmailVerifiedHandler];
const EventProcessors = [UserEventProcessor];
const QueryHandlers = [GetUserByEmailHandler, GetUserByIdHandler];

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [CqrsModule, BullModule.registerQueue({ name: 'user-events' })],
  controllers: [UserController],
  providers: [
    PrismaService,
    RedisService,
    AuthGuard,
    UserService,
    UserMapper,
    { provide: IPasswordHashPort, useClass: BcryptPasswordHashAdapter },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IUserQueryPort, useClass: UserQueryAdapter },
    ...CommandHandlers,
    ...EventProcessors,
    ...QueryHandlers,
  ],
  exports: [IUserQueryPort],
})
export class UserModule {}
