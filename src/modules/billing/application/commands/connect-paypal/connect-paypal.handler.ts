import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConnectPayPalCommand } from './connect-paypal.command';
import {
  IOrgBillingAccountRepository,
  OrgBillingAccountNotFoundError,
} from '../../../domain';

@CommandHandler(ConnectPayPalCommand)
export class ConnectPayPalHandler implements ICommandHandler<ConnectPayPalCommand, void> {
  constructor(private readonly accountRepository: IOrgBillingAccountRepository) {}

  async execute(command: ConnectPayPalCommand): Promise<void> {
    const account = await this.accountRepository.findByOrgId(command.orgId);
    if (!account) {
      throw new OrgBillingAccountNotFoundError(command.orgId);
    }

    account.connectPayPal(command.merchantId);
    await this.accountRepository.save(account);
  }
}
