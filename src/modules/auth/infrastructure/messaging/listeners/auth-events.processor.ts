import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAuthAccountCommand } from '../../../application';
import { UserCreatedEvent } from '../events';

@Processor('auth-events')
export class AuthEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name !== UserCreatedEvent.eventName) {
      return;
    }

    const payload = job.data.payload as UserCreatedEvent['payload'];

    await this.commandBus.execute(
      new CreateAuthAccountCommand({
        userId: payload.userId,
        email: payload.email,
        passwordHash: payload.passwordHash,
        scope: 'user',
        correlationId: job.data.correlationId,
      }),
    );
  }
}
