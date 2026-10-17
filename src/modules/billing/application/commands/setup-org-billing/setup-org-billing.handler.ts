import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetupOrgBillingCommand } from './setup-org-billing.command';
import {
  IOrgBillingAccountRepository,
  OrgBillingAccount,
} from '../../../domain';

@CommandHandler(SetupOrgBillingCommand)
export class SetupOrgBillingHandler implements ICommandHandler<SetupOrgBillingCommand, string> {
  constructor(private readonly accountRepository: IOrgBillingAccountRepository) {}

  async execute(command: SetupOrgBillingCommand): Promise<string> {
    const existing = await this.accountRepository.findByOrgId(command.orgId);
    if (existing) {
      return existing.id.toString();
    }

    const account = OrgBillingAccount.create({
      orgId: command.orgId,
      billingModel: command.billingModel,
      planTier: command.planTier,
    });

    await this.accountRepository.save(account);
    return account.id.toString();
  }
}
