import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import {
  AuthGuard,
  BcryptPasswordHashAdapter,
  IPasswordHashPort,
  IUserQueryPort,
} from '@modules/shared';
import { UserEventProcessor } from './infrastructure/messaging';
import { CreatePendingRegistrationHandler } from './application/commands/create-pending-registration/create-pending-registration.handler';
import { CompleteUserOnboardingHandler } from './application/commands/complete-user-onboarding/complete-user-onboarding.handler';
import { SetActiveOrganizationHandler } from './application/commands/set-active-organization/set-active-organization.handler';
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
  CreatePendingRegistrationHandler,
  CompleteUserOnboardingHandler,
  SetActiveOrganizationHandler,
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
