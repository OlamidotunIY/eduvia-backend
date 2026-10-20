import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationSubjectCommand } from './create-org-subject.command';
import { CreateOrganizationSubjectResult } from './create-org-subject.result';
import {
  IOrganizationMembershipRepository,
  IOrganizationSubjectRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationSubject,
} from '../../../domain';

@CommandHandler(CreateOrganizationSubjectCommand)
export class CreateOrganizationSubjectHandler
  implements ICommandHandler<CreateOrganizationSubjectCommand, CreateOrganizationSubjectResult>
{
  constructor(
    private readonly orgSubjectRepository: IOrganizationSubjectRepository,
    private readonly membershipRepository: IOrganizationMembershipRepository,
  ) {}

  async execute(
    command: CreateOrganizationSubjectCommand,
  ): Promise<CreateOrganizationSubjectResult> {
    const { payload } = command;

    const membership = await this.membershipRepository.findByOrgIdAndUserId(
      payload.orgId,
      payload.callerUserId,
    );

    if (!membership || !membership.isAdmin()) {
      throw new OrganizationInvariantError('Caller must be an active org admin');
    }

    const subject = OrganizationSubject.create({
      orgId: OrganizationId.from(payload.orgId),
      name: payload.name,
      platformSubjectId: payload.platformSubjectId,
      description: payload.description,
    });

    await this.orgSubjectRepository.save(subject);

    return {
      id: subject.getId(),
    };
  }
}
