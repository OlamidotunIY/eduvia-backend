import { ICommand } from '@nestjs/cqrs';

export class DeactivateSubscriptionPlanCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly planId: string,
  ) {}
}
