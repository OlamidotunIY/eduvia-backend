import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { OrganizationCreatedEvent } from '../events';
import { CreateOrganizationCommand } from '../../../application/commands/create-organization';

@Processor('org-events')
export class OrganizationEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === OrganizationCreatedEvent.eventName) {
      const payload = job.data.payload as OrganizationCreatedEvent['payload'];
      await this.commandBus.execute(
        new CreateOrganizationCommand({
          ownerId: payload.ownerId,
          name: payload.name,
          slug: payload.slug,
          contactEmail: payload.contactEmail,
          country: payload.country,
          timezone: payload.timezone,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }

  }
}
