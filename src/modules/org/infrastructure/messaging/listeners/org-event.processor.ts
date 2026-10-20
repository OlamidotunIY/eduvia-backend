import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import {
  OrganizationCreatedEvent,
  OrganizationInvitationAcceptedEvent,
  TeacherApplicationApprovedEvent,
} from '../../../domain/events';
import { CreateOrganizationMembershipCommand } from '../../../application/commands/create-organization-membership';
import {
  InvitationRole,
  OrganizationId,
  OrganizationRole,
} from '../../../domain';

@Processor('org-events')
export class OrganizationEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === OrganizationCreatedEvent.name) {
      const payload = job.data.payload as OrganizationCreatedEvent.Payload;
      await this.commandBus.execute(
        new CreateOrganizationMembershipCommand({
          orgId: OrganizationId.from(payload.orgId),
          userId: payload.ownerId,
          role: OrganizationRole.OWNER,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }

    if (job.name === OrganizationInvitationAcceptedEvent.name) {
      const payload = job.data
        .payload as OrganizationInvitationAcceptedEvent.Payload;
      const role =
        payload.role === InvitationRole.TEACHING_ASSISTANT
          ? OrganizationRole.TEACHING_ASSISTANT
          : OrganizationRole.TEACHER;

      await this.commandBus.execute(
        new CreateOrganizationMembershipCommand({
          orgId: OrganizationId.from(payload.orgId),
          userId: payload.acceptedByUserId,
          role,
          subjects: payload.subjects,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }

    if (job.name === TeacherApplicationApprovedEvent.name) {
      const payload = job.data
        .payload as TeacherApplicationApprovedEvent.Payload;
      await this.commandBus.execute(
        new CreateOrganizationMembershipCommand({
          orgId: OrganizationId.from(payload.orgId),
          userId: payload.applicantUserId,
          role: OrganizationRole.TEACHER,
          subjects: payload.approvedSubjects,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }
  }
}
