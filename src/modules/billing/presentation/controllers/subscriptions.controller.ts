import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  CurrentUser,
  type CurrentUserPayload,
} from '@modules/shared';
import { BillingService } from '../services/billing.service';
import { SubscribeParentDto, CancelSubscriptionDto } from '../dto';

@Controller()
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(private readonly billingService: BillingService) {}

  @Post('subscriptions')
  async subscribe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: SubscribeParentDto,
  ) {
    return this.billingService.subscribeParent(user.userId, dto);
  }

  @Get('subscriptions')
  async listSubscriptions(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.getParentSubscriptions(user.userId);
  }

  @Get('billing/history')
  async getBillingHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query('orgId') orgId?: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('limit') limit?: string,
  ) {
    if (orgId) {
      const parsedLimit = limit ? parseInt(limit, 10) : 50;
      return this.billingService.getBillingHistory(orgId, subscriptionId, parsedLimit);
    }

    const subs = await this.billingService.getParentSubscriptions(user.userId);
    if (!subs || subs.length === 0) {
      return [];
    }
    const results = [];
    for (const sub of subs) {
      const events = await this.billingService.getBillingHistory(sub.orgId, sub.id);
      for (const event of events) {
        results.push({
          id: event.id,
          invoiceNumber: `INV-${event.id.slice(0, 8).toUpperCase()}`,
          childName: '',
          orgName: '',
          subjectName: '',
          amount: (event.amount ?? 0) / 100,
          currency: event.currency ?? 'NGN',
          date:
            event.occurredAt instanceof Date
              ? event.occurredAt.toISOString()
              : String(event.occurredAt),
          status: 'paid',
        });
      }
    }
    return results;
  }

  @Get('subscriptions/:id')
  async getSubscription(@Param('id') id: string) {
    return this.billingService.getParentSubscriptionById(id);
  }

  @Post('subscriptions/:id/cancel')
  async cancelSubscription(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto?: CancelSubscriptionDto,
  ) {
    return this.billingService.cancelSubscription(id, user.userId, dto?.reason);
  }

  @Post('subscriptions/:id/pause')
  async pauseSubscription(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.billingService.pauseSubscription(id, user.userId);
  }

  @Post('subscriptions/:id/resume')
  async resumeSubscription(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.billingService.resumeSubscription(id, user.userId);
  }
}
