import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import {
  IPaymentGatewayPort,
  ISubscriptionPlanRepository,
  IOrgBillingAccountRepository,
  BillingModel,
} from '../../../domain';

@Processor('billing-events')
@Injectable()
export class BillingEventProcessor extends WorkerHost {
  private readonly logger = new Logger(BillingEventProcessor.name);

  constructor(
    private readonly planRepository: ISubscriptionPlanRepository,
    private readonly accountRepository: IOrgBillingAccountRepository,
    @Optional()
    @Inject(IPaymentGatewayPort)
    private readonly paymentGateway?: IPaymentGatewayPort,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const { name, data } = job;
    const payload = data?.payload || {};

    this.logger.log(`Processing billing domain event: ${name}`);

    switch (name) {
      case 'SubscriptionPlanCreatedEvent': {
        if (!this.paymentGateway) {
          break;
        }
        const { planId, orgId, name: planName, priceAmount, currency, billingInterval } = payload;
        const account = await this.accountRepository.findByOrgId(orgId);
        if (!account) {
          break;
        }

        try {
          const stripePriceId = await this.paymentGateway.createPlanPrice({
            name: planName,
            amount: priceAmount,
            currency,
            interval: billingInterval,
            stripeAccountId: account.stripeAccountId ?? undefined,
          });

          const plan = await this.planRepository.findById(planId);
          if (plan) {
            plan.setStripePriceId(stripePriceId);
            await this.planRepository.save(plan);
            this.logger.log(`Synced plan ${planId} to Stripe price ${stripePriceId}`);
          }
        } catch (err: any) {
          this.logger.warn(`Failed to sync plan ${planId} to payment gateway: ${err.message}`);
        }
        break;
      }

      case 'OrgBillingAccountCreatedEvent': {
        const { orgId, billingModel } = payload;
        this.logger.log(`OrgBillingAccount created for org ${orgId} with model ${billingModel}`);

        if (billingModel === BillingModel.saas && this.paymentGateway) {
          try {
            const customerId = await this.paymentGateway.createCustomer({
              email: `billing@org-${orgId}.eduvia.local`,
              name: `Org ${orgId}`,
              orgId,
            });
            const account = await this.accountRepository.findByOrgId(orgId);
            if (account) {
              account.setStripeCustomerId(customerId);
              await this.accountRepository.save(account);
            }
          } catch (err: any) {
            this.logger.warn(`Failed to create Stripe customer for SaaS org ${orgId}: ${err.message}`);
          }
        }
        break;
      }

      default:
        this.logger.debug(`Unhandled billing event: ${name}`);
        break;
    }
  }
}
