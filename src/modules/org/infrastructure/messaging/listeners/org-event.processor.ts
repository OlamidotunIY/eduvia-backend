import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { IOrganizationRoleRepository } from '../../../domain/repository';
import {
  OrganizationCreatedEvent,
  OrganizationInvitationAcceptedEvent,
  TeacherApplicationApprovedEvent,
} from '../../../domain/events';
import { CreateOrganizationMembershipCommand } from '../../../application/commands/create-organization-membership';
import { ProvisionDefaultOrganizationRolesCommand } from '../../../application/commands/provision-default-organization-roles';
import {
  InvitationRole,
  legacyRoleToRoleKey,
  OrganizationId,
  OrganizationRole,
  OrganizationRoleId,
  OrganizationRoleKey,
} from '../../../domain';

@Processor('org-events')
export class OrganizationEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly roleRepository: IOrganizationRoleRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    if (job.name === OrganizationCreatedEvent.name) {
      const payload = job.data.payload as OrganizationCreatedEvent.Payload;
      await this.commandBus.execute(
        new ProvisionDefaultOrganizationRolesCommand({
          orgId: payload.orgId,
          correlationId: job.data.correlationId,
        }),
      );
      const ownerRole = await this.roleRepository.findByOrgIdAndKey(
        payload.orgId,
        OrganizationRoleKey.ORG_OWNER,
      );
      if (!ownerRole) throw new Error('Organization default roles were not provisioned');
      await this.commandBus.execute(
        new CreateOrganizationMembershipCommand({
          orgId: OrganizationId.from(payload.orgId),
          userId: payload.ownerId,
          role: OrganizationRole.OWNER,
          roleId: ownerRole.id,
          activateForUserIfUnset: true,
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
      const roleKey =
        role === OrganizationRole.TEACHING_ASSISTANT
          ? OrganizationRoleKey.TEACHING_ASSISTANT
          : OrganizationRoleKey.TEACHER;
      const accessRole = await this.roleRepository.findByOrgIdAndKey(
        payload.orgId,
        roleKey,
      );

      await this.commandBus.execute(
        new CreateOrganizationMembershipCommand({
          orgId: OrganizationId.from(payload.orgId),
          userId: payload.acceptedByUserId,
          role,
          roleId: accessRole?.id,
          subjects: payload.subjects,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }

    if (job.name === TeacherApplicationApprovedEvent.name) {
      const payload = job.data
        .payload as TeacherApplicationApprovedEvent.Payload;
      const orgIdStr =
        typeof payload.orgId === 'string'
          ? payload.orgId
          : ((payload.orgId as { value?: string })?.value ?? String(payload.orgId));
      const assignedRole = payload.role ?? OrganizationRole.TEACHER;
      let resolvedRoleId: OrganizationRoleId | undefined;
      if (payload.roleId) {
        resolvedRoleId = OrganizationRoleId.from(payload.roleId);
      } else {
        const matchedRole = await this.roleRepository.findByOrgIdAndKey(
          orgIdStr,
          legacyRoleToRoleKey(assignedRole),
        );
        resolvedRoleId = matchedRole?.id;
      }

      await this.commandBus.execute(
        new CreateOrganizationMembershipCommand({
          orgId: OrganizationId.from(orgIdStr),
          userId: payload.applicantUserId,
          role: assignedRole,
          roleId: resolvedRoleId,
          subjects: payload.approvedSubjects ?? [],
          activateForUserIfUnset: true,
          correlationId: job.data.correlationId,
        }),
      );
      return;
    }
  }
}
