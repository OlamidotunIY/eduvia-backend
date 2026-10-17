import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConnectStripeCommand } from './connect-stripe.command';
import {
  IOrgBillingAccountRepository,
  OrgBillingAccountNotFoundError,
} from '../../../domain';

@CommandHandler(ConnectStripeCommand)
export class ConnectStripeHandler implements ICommandHandler<ConnectStripeCommand, void> {
  constructor(private readonly accountRepository: IOrgBillingAccountRepository) {}

  async execute(command: ConnectStripeCommand): Promise<void> {
    const account = await this.accountRepository.findByOrgId(command.orgId);
    if (!account) {
      throw new OrgBillingAccountNotFoundError(command.orgId);
    }

    account.connectStripe(command.stripeAccountId);
    await this.accountRepository.save(account);
  }
}
