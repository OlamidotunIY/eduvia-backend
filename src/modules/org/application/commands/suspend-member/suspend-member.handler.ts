import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { SuspendMemberCommand } from './suspend-member.command';
import { SuspendMemberResult } from './suspend-member.result';
import { IOrganizationMembershipRepository } from '../../../domain/repository';
import {
  OrganizationInvariantError,
  OrganizationRole,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(SuspendMemberCommand)
export class SuspendMemberHandler
  implements ICommandHandler<SuspendMemberCommand, SuspendMemberResult>
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(command: SuspendMemberCommand): Promise<SuspendMemberResult> {
    const { payload } = command;

    if (payload.callerUserId === payload.targetUserId) {
      throw new OrganizationInvariantError('Cannot suspend yourself');
    }

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.MEMBERS_MANAGE)) {
      throw new OrganizationInvariantError('Caller cannot suspend organization members');
    }

    const targetMembership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.targetUserId,
    );

    if (!targetMembership) {
      throw new OrganizationInvariantError('Target user is not a member of this organization');
    }

    if (targetMembership.role === OrganizationRole.OWNER) {
      throw new OrganizationInvariantError('Cannot suspend the organization owner');
    }

    targetMembership.suspend();

    await this.membershipRepository.save(targetMembership);

    return {
      id: targetMembership.id.value,
      status: targetMembership.status,
    };
  }
}
