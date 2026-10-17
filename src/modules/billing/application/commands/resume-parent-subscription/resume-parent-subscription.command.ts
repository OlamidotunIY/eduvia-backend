import { ICommand } from '@nestjs/cqrs';

export class ResumeParentSubscriptionCommand implements ICommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly parentId?: string,
  ) {}
}
