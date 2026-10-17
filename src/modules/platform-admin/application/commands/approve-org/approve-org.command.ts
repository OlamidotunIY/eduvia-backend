import { ICommand } from '@nestjs/cqrs';

export class ApproveOrgCommand implements ICommand {
  constructor(
    public readonly reviewerUserId: string,
    public readonly orgId: string,
    public readonly reason?: string,
    public readonly correlationId?: string,
  ) {}
}
