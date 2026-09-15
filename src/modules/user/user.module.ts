import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UserFacade } from './application/facade';
import { PrismaService } from '@modules/shared';
import { UserEventProcessor } from './application/events/handlers/user.processor';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { PrismaUserRepository } from './infrastructure/repository/user-repository.adapter';
import { UserMapper } from './infrastructure/mappers';
import { IUserRepository } from './domain/repository/user.repository';
import {
  GetUserByEmailHandler,
  GetUserByIdHandler,
  GetMeHandler,
} from './application/query';

const CommandHandlers = [CreateUserHandler];
const EventProcessors = [UserEventProcessor];
const QueryHandlers = [GetUserByEmailHandler, GetUserByIdHandler, GetMeHandler];

import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [CqrsModule, BullModule.registerQueue({ name: 'user-events' })],
  providers: [
    PrismaService,
    UserFacade,
    UserMapper,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    ...CommandHandlers,
    ...EventProcessors,
    ...QueryHandlers,
  ],
  exports: [UserFacade],
})
export class UserModule {}
