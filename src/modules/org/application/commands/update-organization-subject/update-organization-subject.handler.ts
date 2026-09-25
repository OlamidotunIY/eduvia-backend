import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOrganizationSubjectCommand } from './updat-organization-subject.command';
import { IOrganizationSubjectRepository } from '../../../domain/repository';
import { OrganizationSubjectId } from '../../../domain';

@CommandHandler(UpdateOrganizationSubjectCommand)
export class UpdateOrganizationSubjectHandler implements ICommandHandler<UpdateOrganizationSubjectCommand, void> {
  constructor(private readonly orgSubjectRepository: IOrganizationSubjectRepository) {}

  async execute(command: UpdateOrganizationSubjectCommand): Promise<void> {
    const { payload } = command;

    const subject = await this.orgSubjectRepository.findById(
      OrganizationSubjectId.from(payload.subjectId),
    );
    if (!subject) {
      throw new Error('subject not found');
    }

    if (subject.orgId !== payload.orgId) {
      throw new Error('')
    }

    if (payload.name !== undefined) subject.rename(payload.name);
    if (payload.description !== undefined) subject.updateDescription(payload.description);
    if (payload.platformSubjectId !== undefined) subject.linkToPlatformSubject(payload.platformSubjectId);
    if (payload.isActive !== undefined) {
      payload.isActive ? subject.activate() : subject.deactivate();
    }

    await this.orgSubjectRepository.save(subject);
  }
}