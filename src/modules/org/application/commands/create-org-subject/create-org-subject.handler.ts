import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IOrganizationAuthorizationQueryPort } from '@modules/shared';
import { CreateOrganizationSubjectCommand } from './create-org-subject.command';
import { CreateOrganizationSubjectResult } from './create-org-subject.result';
import {
  IOrganizationSubjectRepository,
} from '../../../domain/repository';
import {
  OrganizationId,
  OrganizationInvariantError,
  OrganizationSubject,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(CreateOrganizationSubjectCommand)
export class CreateOrganizationSubjectHandler
  implements ICommandHandler<CreateOrganizationSubjectCommand, CreateOrganizationSubjectResult>
{
  constructor(
    private readonly orgSubjectRepository: IOrganizationSubjectRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
  ) {}

  async execute(
    command: CreateOrganizationSubjectCommand,
  ): Promise<CreateOrganizationSubjectResult> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );

    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.SUBJECTS_CREATE)) {
      throw new OrganizationInvariantError('Caller cannot create organization subjects');
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
