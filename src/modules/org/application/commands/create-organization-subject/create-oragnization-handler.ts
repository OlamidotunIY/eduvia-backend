import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrganizationSubjectCommand } from './create-organization-subject.command';
import { CreateOrganizationSubjectResult } from './create-oganization-subject.result';
import { IOrganizationRepository, OrganizationNotFound } from '../../../domain';
import { IOrganizationSubjectRepository } from '../../../domain/repository';
import { OrganizationSubject } from '../../../domain/entities';



@CommandHandler(CreateOrganizationSubjectCommand)
export class CreateOrganizationSubjectHandler
  implements ICommandHandler<CreateOrganizationSubjectCommand, CreateOrganizationSubjectResult>
{
  constructor(
    private readonly organizationSubjectRepository: IOrganizationSubjectRepository,
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(command: CreateOrganizationSubjectCommand): Promise<CreateOrganizationSubjectResult> {
    const { payload } = command;

    const organization = await this.organizationRepository.findById(payload.orgId);
    if (!organization) {
      throw new OrganizationNotFound();
    }

    const subject = OrganizationSubject.create({
      orgId: payload.orgId,
      name: payload.name,
      platformSubjectId: payload.platformSubjectId,
      description: payload.description,
    });

    await this.organizationSubjectRepository.save(subject);

    return { id: subject.id.toString() };
  }
}