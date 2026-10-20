import { ICommand } from '@nestjs/cqrs';

export class SuspendOrgCommand implements ICommand {
  constructor(
    public readonly adminUserId: string,
    public readonly orgId: string,
    public readonly reason: string,
    public readonly correlationId?: string,
  ) {}
}
