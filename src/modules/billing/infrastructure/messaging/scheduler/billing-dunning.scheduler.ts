import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  IParentSubscriptionRepository,
  IOrgBillingAccountRepository,
  ISeatUsageRecordRepository,
  SeatUsageRecord,
  BillingModel,
} from '../../../domain';

@Injectable()
export class BillingDunningScheduler {
  private readonly logger = new Logger(BillingDunningScheduler.name);

  constructor(
    private readonly subscriptionRepository: IParentSubscriptionRepository,
    private readonly accountRepository: IOrgBillingAccountRepository,
    private readonly seatUsageRepository: ISeatUsageRecordRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePastDueGracePeriodCheck(): Promise<void> {
    this.logger.log('Starting daily past-due subscription dunning check (7-day grace period)...');

    try {
      const pastDueSubscriptions = await this.subscriptionRepository.findPastDueSubscriptions();
      const now = Date.now();
      const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;

      let cancelledCount = 0;
      for (const subscription of pastDueSubscriptions) {
        const periodEndMs = subscription.currentPeriodEnd.getTime();
        if (now - periodEndMs > gracePeriodMs) {
          subscription.cancel('7-day payment grace period expired without settlement');
          await this.subscriptionRepository.save(subscription);
          cancelledCount++;
        }
      }

      this.logger.log(
        `Past-due dunning sweep completed. Evaluated ${pastDueSubscriptions.length} subscriptions, cancelled ${cancelledCount}.`,
      );
    } catch (err: any) {
      this.logger.error(`Error in past-due dunning check: ${err.message}`, err.stack);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthlySeatUsageSnapshot(): Promise<void> {
    this.logger.log('Starting monthly seat usage snapshot for SaaS organizations...');

    try {
      const accounts = await this.accountRepository.findAll();
      const date = new Date();
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      let recordedCount = 0;
      for (const account of accounts) {
        if (account.billingModel !== BillingModel.saas) {
          continue;
        }

        const existingRecord = await this.seatUsageRepository.findByOrgAndMonth(account.orgId, month);
        if (!existingRecord) {
          const newRecord = SeatUsageRecord.create({
            orgId: account.orgId,
            month,
            seatCount: account.seatCount,
            tierAtTime: account.planTier,
          });
          await this.seatUsageRepository.save(newRecord);
          recordedCount++;
        }
      }

      this.logger.log(
        `Monthly seat usage snapshot completed for ${month}: recorded ${recordedCount} orgs.`,
      );
    } catch (err: any) {
      this.logger.error(`Error in monthly seat usage snapshot: ${err.message}`, err.stack);
    }
  }
}
