import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { MarkEmailVerifiedCommand, SuspendUserCommand } from '../../../application/commands';
import { AccountSuspendedEvent, AuthEmailVerifiedEvent } from '../events';

@Processor('user-events')
export class UserEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === AuthEmailVerifiedEvent.eventName) {
      const payload = job.data.payload as AuthEmailVerifiedEvent['payload'];
      await this.commandBus.execute(
        new MarkEmailVerifiedCommand({ userId: payload.userId }),
      );
      return;
    }

    if (job.name === AccountSuspendedEvent.eventName) {
      const payload = job.data.payload as AccountSuspendedEvent['payload'];
      await this.commandBus.execute(
        new SuspendUserCommand({ userId: payload.userId }),
      );
    }
  }
}
