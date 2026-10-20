import { Injectable, Optional, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  SetupOrgBillingCommand,
  ConnectStripeCommand,
  ConnectPayPalCommand,
  UpgradeOrgTierCommand,
  CreateSubscriptionPlanCommand,
  DeactivateSubscriptionPlanCommand,
  AddPlanDiscountCommand,
  SubscribeParentCommand,
  CancelParentSubscriptionCommand,
  PauseParentSubscriptionCommand,
  ResumeParentSubscriptionCommand,
  ProcessBillingWebhookCommand,
} from '../../application/commands';
import {
  GetOrgBillingAccountQuery,
  GetSubscriptionPlanQuery,
  ListOrgSubscriptionPlansQuery,
  GetParentSubscriptionsQuery,
  GetParentSubscriptionByIdQuery,
  GetBillingHistoryQuery,
  OrgBillingAccountDto,
  SubscriptionPlanDto,
  ParentSubscriptionDto,
  BillingEventDto,
} from '../../application/queries';
import {
  SetupOrgBillingDto,
  ConnectStripeDto,
  ConnectPayPalDto,
  UpgradeOrgTierDto,
  CreateSubscriptionPlanDto,
  AddPlanDiscountDto,
  SubscribeParentDto,
} from '../dto';
import { IPaymentGatewayPort, PaymentProvider, BillingEventType } from '../../domain';

@Injectable()
export class BillingService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Optional()
    @Inject(IPaymentGatewayPort)
    private readonly paymentGateway?: IPaymentGatewayPort,
  ) {}

  async setupOrgBilling(orgId: string, dto: SetupOrgBillingDto): Promise<{ id: string }> {
    const id = await this.commandBus.execute(
      new SetupOrgBillingCommand(orgId, dto.billingModel, dto.planTier),
    );
    return { id };
  }

  async getOrgBillingAccount(orgId: string): Promise<OrgBillingAccountDto> {
    return this.queryBus.execute(new GetOrgBillingAccountQuery(orgId));
  }

  async connectStripe(
    orgId: string,
    dto: ConnectStripeDto,
  ): Promise<{ accountId?: string; onboardingUrl?: string; success: boolean }> {
    if (dto.stripeAccountId) {
      await this.commandBus.execute(new ConnectStripeCommand(orgId, dto.stripeAccountId));
      return { accountId: dto.stripeAccountId, success: true };
    }

    if (this.paymentGateway) {
      const link = await this.paymentGateway.createConnectAccountLink({
        orgId,
        returnUrl: dto.returnUrl || `https://app.eduvia.local/orgs/${orgId}/billing?status=success`,
        refreshUrl: dto.refreshUrl || `https://app.eduvia.local/orgs/${orgId}/billing?status=refresh`,
      });
      await this.commandBus.execute(new ConnectStripeCommand(orgId, link.accountId));
      return { accountId: link.accountId, onboardingUrl: link.onboardingUrl, success: true };
    }

    return { success: false };
  }

  async connectPayPal(orgId: string, dto: ConnectPayPalDto): Promise<{ success: boolean }> {
    await this.commandBus.execute(new ConnectPayPalCommand(orgId, dto.merchantId));
    return { success: true };
  }

  async upgradeOrgTier(orgId: string, dto: UpgradeOrgTierDto): Promise<{ success: boolean }> {
    await this.commandBus.execute(new UpgradeOrgTierCommand(orgId, dto.tier));
    return { success: true };
  }

  async createSubscriptionPlan(
    orgId: string,
    dto: CreateSubscriptionPlanDto,
  ): Promise<{ id: string }> {
    const id = await this.commandBus.execute(
      new CreateSubscriptionPlanCommand(
        orgId,
        dto.subjectId,
        dto.name,
        dto.priceAmount,
        dto.currency,
        dto.billingInterval,
        dto.lessonsPerInterval,
        dto.description,
      ),
    );
    return { id };
  }

  async listOrgSubscriptionPlans(
    orgId: string,
    activeOnly: boolean = false,
  ): Promise<SubscriptionPlanDto[]> {
    return this.queryBus.execute(new ListOrgSubscriptionPlansQuery(orgId, activeOnly));
  }

  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlanDto> {
    return this.queryBus.execute(new GetSubscriptionPlanQuery(planId));
  }

  async deactivateSubscriptionPlan(orgId: string, planId: string): Promise<{ success: boolean }> {
    await this.commandBus.execute(new DeactivateSubscriptionPlanCommand(orgId, planId));
    return { success: true };
  }

  async addPlanDiscount(
    orgId: string,
    planId: string,
    dto: AddPlanDiscountDto,
  ): Promise<{ id: string }> {
    const id = await this.commandBus.execute(
      new AddPlanDiscountCommand(
        orgId,
        planId,
        dto.type,
        dto.amount,
        dto.scope,
        dto.currency,
        dto.parentId,
        dto.expiresAt,
        dto.code,
      ),
    );
    return { id };
  }

  async subscribeParent(
    parentId: string,
    dto: SubscribeParentDto,
  ): Promise<{ id: string }> {
    const id = await this.commandBus.execute(
      new SubscribeParentCommand(
        dto.orgId,
        dto.planId,
        parentId,
        dto.studentId,
        dto.provider,
        dto.providerSubscriptionId,
        dto.discountCode,
        dto.durationDays ?? 30,
      ),
    );
    return { id };
  }

  async getParentSubscriptions(parentId: string): Promise<ParentSubscriptionDto[]> {
    return this.queryBus.execute(new GetParentSubscriptionsQuery(parentId));
  }

  async getParentSubscriptionById(id: string): Promise<ParentSubscriptionDto> {
    return this.queryBus.execute(new GetParentSubscriptionByIdQuery(id));
  }

  async cancelSubscription(
    id: string,
    parentId?: string,
    reason?: string,
  ): Promise<{ success: boolean }> {
    await this.commandBus.execute(new CancelParentSubscriptionCommand(id, parentId, reason));
    return { success: true };
  }

  async pauseSubscription(id: string, parentId?: string): Promise<{ success: boolean }> {
    await this.commandBus.execute(new PauseParentSubscriptionCommand(id, parentId));
    return { success: true };
  }

  async resumeSubscription(id: string, parentId?: string): Promise<{ success: boolean }> {
    await this.commandBus.execute(new ResumeParentSubscriptionCommand(id, parentId));
    return { success: true };
  }

  async getBillingHistory(
    orgId: string,
    subscriptionId?: string,
    limit?: number,
  ): Promise<BillingEventDto[]> {
    return this.queryBus.execute(new GetBillingHistoryQuery(orgId, subscriptionId, limit));
  }

  async processWebhook(
    provider: PaymentProvider,
    providerEventId: string,
    eventType: BillingEventType,
    orgId: string,
    subscriptionId?: string,
    providerSubscriptionId?: string,
    amount?: number,
    currency?: string,
    metadata: Record<string, any> = {},
  ): Promise<{ id: string }> {
    const id = await this.commandBus.execute(
      new ProcessBillingWebhookCommand(
        provider,
        providerEventId,
        eventType,
        orgId,
        subscriptionId,
        providerSubscriptionId,
        amount,
        currency,
        metadata,
      ),
    );
    return { id };
  }
}
