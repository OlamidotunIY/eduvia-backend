import { Command } from '@nestjs/cqrs';

export class ProvisionDefaultOrganizationRolesCommand extends Command<string[]> {
  constructor(
    public readonly payload: { orgId: string; correlationId: string },
  ) {
    super();
  }
}
