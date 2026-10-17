import { ICommand } from '@nestjs/cqrs';

export class PauseParentSubscriptionCommand implements ICommand {
  constructor(
    public readonly subscriptionId: string,
    public readonly parentId?: string,
  ) {}
}
