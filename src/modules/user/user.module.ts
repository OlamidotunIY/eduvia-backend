import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
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
import { MarkEmailVerifiedHandler } from './application/commands';
import { RegisterStudentHandler } from './application/commands/register-student';
import { UpdateUserHandler } from './application/commands/update-user';
import {
  GetUserByEmailHandler,
  GetUserByIdHandler,
} from './application/query';
import {
  IParentProfileRepository,
  IStudentProfileRepository,
  ITeacherProfileRepository,
  IUserRepository,
} from './domain/repository';
import {
  ParentProfileMapper,
  PrismaParentProfileRepository,
  PrismaStudentProfileRepository,
  PrismaTeacherProfileRepository,
  PrismaUserRepository,
  StudentProfileMapper,
  TeacherProfileMapper,
  UserMapper,
  UserQueryAdapter,
} from './infrastructure';
import { UserController, UserService } from './presentation';

const CommandHandlers = [
  CreateUserHandler,
  MarkEmailVerifiedHandler,
  RegisterStudentHandler,
  UpdateUserHandler,
];
const EventProcessors = [UserEventProcessor];
const QueryHandlers = [GetUserByEmailHandler, GetUserByIdHandler];

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
    TeacherProfileMapper,
    { provide: IPasswordHashPort, useClass: BcryptPasswordHashAdapter },
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IParentProfileRepository, useClass: PrismaParentProfileRepository },
    { provide: IStudentProfileRepository, useClass: PrismaStudentProfileRepository },
    { provide: ITeacherProfileRepository, useClass: PrismaTeacherProfileRepository },
    { provide: IUserQueryPort, useClass: UserQueryAdapter },
    ...CommandHandlers,
    ...EventProcessors,
    ...QueryHandlers,
  ],
  exports: [IUserQueryPort],
})
export class UserModule {}
