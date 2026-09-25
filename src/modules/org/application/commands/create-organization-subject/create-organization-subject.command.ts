import { Command } from '@nestjs/cqrs';
import { CreateOrganizationSubjectResult } from './create-oganization-subject.result';


export class CreateOrganizationSubjectCommand extends Command<CreateOrganizationSubjectResult> {
  constructor(
    public readonly payload: {
      orgId: string;
      name: string;
      platformSubjectId?: string | null;
      description?: string | null;
    },
  ) {
    super();
  }
}