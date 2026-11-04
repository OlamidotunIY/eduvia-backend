import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ICurriculumQueryPort,
  IOrganizationAuthorizationQueryPort,
} from '@modules/shared';
import { UpdateOrganizationSubjectCommand } from './update-organization-subject.command';
import { IOrganizationSubjectRepository } from '../../../domain/repository';
import {
  OrganizationInvariantError,
  OrganizationSubjectId,
  SubjectNotFound,
  OrganizationPermission,
} from '../../../domain';

@CommandHandler(UpdateOrganizationSubjectCommand)
export class UpdateOrganizationSubjectHandler implements ICommandHandler<
  UpdateOrganizationSubjectCommand,
  void
> {
  constructor(
    private readonly orgSubjectRepository: IOrganizationSubjectRepository,
    private readonly authorizationQuery: IOrganizationAuthorizationQueryPort,
    private readonly curriculumQuery: ICurriculumQueryPort,
  ) {}

  async execute(command: UpdateOrganizationSubjectCommand): Promise<void> {
    const { payload } = command;

    const authorization = await this.authorizationQuery.getEffectiveAuthorization(
      payload.orgId,
      payload.callerUserId,
    );
    if (!authorization?.isActive || !authorization.permissions.includes(OrganizationPermission.SUBJECTS_UPDATE)) {
      throw new OrganizationInvariantError('Caller cannot update organization subjects');
    }

    const subject = await this.orgSubjectRepository.findById(
      OrganizationSubjectId.from(payload.subjectId),
    );
    if (!subject) {
      throw new SubjectNotFound();
    }

    if (subject.orgId.toString() !== payload.orgId) {
      throw new OrganizationInvariantError('Invalid credentials');
    }

    if (payload.name !== undefined) subject.rename(payload.name);
    if (payload.description !== undefined)
      subject.updateDescription(payload.description);
    if (payload.platformSubjectId !== undefined) {
      if (payload.platformSubjectId) {
        const platformSubject = await this.curriculumQuery.getPlatformSubjectById(
          payload.platformSubjectId,
        );
        if (!platformSubject?.isActive) {
          throw new OrganizationInvariantError(
            'The selected platform subject is unavailable',
          );
        }
      }
      subject.linkToPlatformSubject(payload.platformSubjectId);
    }
    if (payload.isActive !== undefined) {
      if (payload.isActive) {
        subject.activate();
      } else {
        subject.deactivate();
      }
    }

    await this.orgSubjectRepository.save(subject);
  }
}
