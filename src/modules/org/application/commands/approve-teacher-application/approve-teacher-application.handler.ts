import { Optional } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { ApproveTeacherApplicationCommand } from './approve-teacher-application.command';
import { ApproveTeacherApplicationResult } from './approve-teacher-application.result';
import {
  IOrganizationRoleRepository,
  ITeacherApplicationRepository,
} from '../../../domain/repository';
import {
  OrganizationInvariantError,
  OrganizationPermission,
  OrganizationRole,
  OrganizationRoleId,
  OrganizationRoleKey,
  roleKeyToLegacyRole,
  TeacherApplicationId,
} from '../../../domain';

@CommandHandler(ApproveTeacherApplicationCommand)
export class ApproveTeacherApplicationHandler
  implements ICommandHandler<ApproveTeacherApplicationCommand, ApproveTeacherApplicationResult>
{
  constructor(
    private readonly teacherApplicationRepository: ITeacherApplicationRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    @Optional()
    private readonly roleRepository?: IOrganizationRoleRepository,
  ) {}

  async execute(
    command: ApproveTeacherApplicationCommand,
  ): Promise<ApproveTeacherApplicationResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.reviewerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.APPLICATIONS_REVIEW)) {
      throw new OrganizationInvariantError('Caller cannot review teacher applications');
    }

    const application = await this.teacherApplicationRepository.findById(
      TeacherApplicationId.from(payload.applicationId),
    );

    if (!application) {
      throw new OrganizationInvariantError('Teacher application not found');
    }

    if (application.orgId.toString() !== payload.orgId) {
      throw new OrganizationInvariantError('Application does not belong to this organization');
    }

    let assignedRole = payload.role ?? OrganizationRole.TEACHER;
    let assignedRoleId: string | null = payload.roleId ?? null;

    if (assignedRole === OrganizationRole.OWNER) {
      throw new OrganizationInvariantError('Cannot assign the organization owner role via application approval');
    }

    if (payload.roleId && this.roleRepository) {
      const roleEntity = await this.roleRepository.findById(
        OrganizationRoleId.from(payload.roleId),
      );
      if (!roleEntity || roleEntity.orgId.value !== payload.orgId) {
        throw new OrganizationInvariantError('Selected organization role was not found');
      }
      if (roleEntity.key === OrganizationRoleKey.ORG_OWNER) {
        throw new OrganizationInvariantError('Cannot assign the organization owner role via application approval');
      }
      assignedRole = roleKeyToLegacyRole(roleEntity.key);
      assignedRoleId = roleEntity.getId();
    }

    const approvedSubjects =
      payload.approvedSubjects !== undefined
        ? Array.from(
            new Set(
              payload.approvedSubjects
                .map((subject) => subject.trim())
                .filter(Boolean),
            ),
          )
        : application.appliedSubjects;

    application.approve(payload.reviewerUserId, payload.correlationId, {
      approvedSubjects,
      role: assignedRole,
      roleId: assignedRoleId,
    });

    await this.teacherApplicationRepository.save(application);

    return {
      id: application.getId(),
      status: application.status,
      approvedSubjects,
      role: assignedRole,
      roleId: assignedRoleId,
    };
  }
}
