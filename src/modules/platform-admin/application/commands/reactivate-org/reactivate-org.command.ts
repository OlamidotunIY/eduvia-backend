import { ICommand } from '@nestjs/cqrs';

export class ReactivateOrgCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly orgId: string,
    public readonly correlationId?: string,
  ) {}
}
