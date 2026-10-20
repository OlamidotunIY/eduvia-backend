import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuspendMemberCommand } from './suspend-member.command';
import { SuspendMemberResult } from './suspend-member.result';
import { IOrganizationMembershipRepository } from '../../../domain/repository';
import {
  OrganizationInvariantError,
  OrganizationRole,
} from '../../../domain';

@CommandHandler(SuspendMemberCommand)
export class SuspendMemberHandler
  implements ICommandHandler<SuspendMemberCommand, SuspendMemberResult>
{
  constructor(
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(command: SuspendMemberCommand): Promise<SuspendMemberResult> {
    const { payload } = command;

    if (payload.callerUserId === payload.targetUserId) {
      throw new OrganizationInvariantError('Cannot suspend yourself');
    }

    const callerMembership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.callerUserId,
    );

    if (!callerMembership || !callerMembership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
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
