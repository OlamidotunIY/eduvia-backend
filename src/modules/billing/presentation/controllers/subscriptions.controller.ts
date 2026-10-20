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
    return this.billingService.subscribeParent(user.id, dto);
  }

  @Get('subscriptions')
  async listSubscriptions(@CurrentUser() user: CurrentUserPayload) {
    return this.billingService.getParentSubscriptions(user.id);
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
    return this.billingService.cancelSubscription(id, user.id, dto?.reason);
  }

  @Post('subscriptions/:id/pause')
  async pauseSubscription(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.billingService.pauseSubscription(id, user.id);
  }

  @Post('subscriptions/:id/resume')
  async resumeSubscription(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.billingService.resumeSubscription(id, user.id);
  }

  @Get('billing/history')
  async getBillingHistory(
    @Query('orgId') orgId: string,
    @Query('subscriptionId') subscriptionId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    return this.billingService.getBillingHistory(orgId, subscriptionId, parsedLimit);
  }
}
