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
import {
  IParentProfileRepository,
  IStudentProfileRepository,
  IUserRepository,
} from './domain/repository';
import {
  GetUserByEmailHandler,
  GetUserByIdHandler,
} from './application/query';
import { MarkEmailVerifiedHandler, RegisterStudentHandler } from './application/commands';
import {
  ParentProfileMapper,
  PrismaParentProfileRepository,
  PrismaStudentProfileRepository,
  StudentProfileMapper,
  UserQueryAdapter,
} from './infrastructure';
import { UserController, UserService } from './presentation';

const CommandHandlers = [
  CreateUserHandler,
  MarkEmailVerifiedHandler,
  RegisterStudentHandler,
];
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
    ParentProfileMapper,
    StudentProfileMapper,
    { provide: IPasswordHashPort, useClass: BcryptPasswordHashAdapter },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IParentProfileRepository, useClass: PrismaParentProfileRepository },
    { provide: IStudentProfileRepository, useClass: PrismaStudentProfileRepository },
    { provide: IUserQueryPort, useClass: UserQueryAdapter },
    ...CommandHandlers,
    ...EventProcessors,
    ...QueryHandlers,
  ],
  exports: [IUserQueryPort],
})
export class UserModule {}
