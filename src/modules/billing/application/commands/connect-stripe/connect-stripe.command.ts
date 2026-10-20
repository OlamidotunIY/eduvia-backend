import { ICommand } from '@nestjs/cqrs';

export class ConnectStripeCommand implements ICommand {
  constructor(
    public readonly orgId: string,
    public readonly stripeAccountId: string,
  ) {}
}
