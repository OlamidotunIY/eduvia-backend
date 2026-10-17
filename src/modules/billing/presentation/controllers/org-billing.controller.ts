import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/shared';
import { BillingService } from '../services/billing.service';
import {
  SetupOrgBillingDto,
  ConnectStripeDto,
  ConnectPayPalDto,
  UpgradeOrgTierDto,
  CreateSubscriptionPlanDto,
  AddPlanDiscountDto,
} from '../dto';

@Controller('orgs/:orgId')
@UseGuards(AuthGuard)
export class OrgBillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('billing/setup')
  async setupOrgBilling(
    @Param('orgId') orgId: string,
    @Body() dto: SetupOrgBillingDto,
  ) {
    return this.billingService.setupOrgBilling(orgId, dto);
  }

  @Get('billing')
  async getOrgBilling(@Param('orgId') orgId: string) {
    return this.billingService.getOrgBillingAccount(orgId);
  }

  @Post('billing/stripe/connect')
  async connectStripe(
    @Param('orgId') orgId: string,
    @Body() dto: ConnectStripeDto,
  ) {
    return this.billingService.connectStripe(orgId, dto);
  }

  @Post('billing/paypal/connect')
  async connectPayPal(
    @Param('orgId') orgId: string,
    @Body() dto: ConnectPayPalDto,
  ) {
    return this.billingService.connectPayPal(orgId, dto);
  }

  @Post('billing/upgrade')
  async upgradeOrgTier(
    @Param('orgId') orgId: string,
    @Body() dto: UpgradeOrgTierDto,
  ) {
    return this.billingService.upgradeOrgTier(orgId, dto);
  }

  @Get('subscription-plans')
  async listSubscriptionPlans(
    @Param('orgId') orgId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.billingService.listOrgSubscriptionPlans(orgId, activeOnly === 'true');
  }

  @Post('subscription-plans')
  async createSubscriptionPlan(
    @Param('orgId') orgId: string,
    @Body() dto: CreateSubscriptionPlanDto,
  ) {
    return this.billingService.createSubscriptionPlan(orgId, dto);
  }

  @Post('subscription-plans/:planId/deactivate')
  async deactivateSubscriptionPlan(
    @Param('orgId') orgId: string,
    @Param('planId') planId: string,
  ) {
    return this.billingService.deactivateSubscriptionPlan(orgId, planId);
  }

  @Post('subscription-plans/:planId/discounts')
  async addPlanDiscount(
    @Param('orgId') orgId: string,
    @Param('planId') planId: string,
    @Body() dto: AddPlanDiscountDto,
  ) {
    return this.billingService.addPlanDiscount(orgId, planId, dto);
  }
}
