import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { AuthAccountCreatedEvent } from '@modules/auth';
import { CreateUserCommand } from '../../commands/create-user/create-user.command';
import { UserType } from '../../../domain';

@Processor('user-events')
export class UserEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === AuthAccountCreatedEvent.name) {
      const payload = job.data.payload as AuthAccountCreatedEvent.Payload;
      const correlationId = job.data.correlationId;

      await this.commandBus.execute(
        new CreateUserCommand({
          id: 0,
          email: payload.profileData.email,
          firstName: payload.profileData.firstName,
          lastName: payload.profileData.lastName,
          userType: payload.profileData.userType as UserType,
          authAccountId: payload.authAccountId,
          correlationId,
        }),
      );
    }
  }
}
