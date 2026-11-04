import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { FinalizeRegistrationCommand } from '../../../application';
import { UserRegistrationCreatedEvent } from '../events';
import { RegistrationGateway } from '../../../presentation/gateways';

@Processor('auth-events')
export class AuthRegistrationEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly registrationGateway: RegistrationGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === UserRegistrationCreatedEvent.eventName) {
      const payload = job.data.payload as UserRegistrationCreatedEvent['payload'];
      await this.commandBus.execute(
        new FinalizeRegistrationCommand({
          ...payload,
          correlationId: job.data.correlationId,
        }),
      );
      this.registrationGateway.registrationReady(payload.registrationRequestId);
      return;
    }
  }
}
