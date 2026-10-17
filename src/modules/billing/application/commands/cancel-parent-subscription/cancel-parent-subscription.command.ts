import { ICommand } from '@nestjs/cqrs';

export class CancelParentSubscriptionCommand implements ICommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly parentId?: string,
    public readonly reason?: string,
  ) {}
}
