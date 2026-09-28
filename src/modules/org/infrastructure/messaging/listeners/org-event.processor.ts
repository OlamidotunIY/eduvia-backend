import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import {
  OrganizationCreatedEvent,
  OrganizationInvitationAcceptedEvent,
} from '../events';
import { CreateOrganizationCommand } from '../../../application/commands/create-organization';
import { OrganizationInvitationAcceptedCommand } from '../../../application/commands/org-invitation-accepted';
import { InvitationRole, OrganizationId } from '../../../domain';

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

    if (job.name === OrganizationInvitationAcceptedEvent.eventName) {
      const payload = job.data
        .payload as OrganizationInvitationAcceptedEvent['payload'];
      await this.commandBus.execute(
        new OrganizationInvitationAcceptedCommand({
          invitationId: payload.invitationId,
          acceptedByUserId: payload.acceptedByUserId,
          role: payload.role as InvitationRole,
          orgId: OrganizationId.from(payload.orgId),
          subjects: payload.subjects,
          correlationId: job.data.correlationId,
        }),
      );
    }
  }
}
