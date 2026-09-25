import { Command } from '@nestjs/cqrs';

export class UpdateOrganizationSubjectCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orgId: string;
      subjectId: string;
      name?: string;
      description?: string | null;
      platformSubjectId?: string | null;
      isActive?: boolean;
    },
  ) {
    super();
  }
}