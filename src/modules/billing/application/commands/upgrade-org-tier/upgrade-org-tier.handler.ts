import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpgradeOrgTierCommand } from './upgrade-org-tier.command';
import {
  IOrgBillingAccountRepository,
  OrgBillingAccountNotFoundError,
} from '../../../domain';

@CommandHandler(UpgradeOrgTierCommand)
export class UpgradeOrgTierHandler implements ICommandHandler<UpgradeOrgTierCommand, void> {
  constructor(private readonly accountRepository: IOrgBillingAccountRepository) {}

  async execute(command: UpgradeOrgTierCommand): Promise<void> {
    const account = await this.accountRepository.findByOrgId(command.orgId);
    if (!account) {
      throw new OrgBillingAccountNotFoundError(command.orgId);
    }

    account.upgradeTier(command.newTier);
    await this.accountRepository.save(account);
  }
}
