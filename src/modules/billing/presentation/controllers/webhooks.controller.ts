import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { BillingService } from '../services/billing.service';
import { BillingEventType, PaymentProvider } from '../../domain';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly billingService: BillingService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') _signature?: string,
  ) {
    this.logger.log(`Received Stripe webhook: ${payload?.type} (${payload?.id})`);

    const eventId = payload?.id;
    const eventType = payload?.type;
    const dataObject = payload?.data?.object || {};

    let mappedType: BillingEventType | null = null;
    switch (eventType) {
      case 'invoice.payment_succeeded':
        mappedType = BillingEventType.subscription_renewed;
        break;
      case 'invoice.payment_failed':
        mappedType = BillingEventType.payment_failed;
        break;
      case 'customer.subscription.deleted':
        mappedType = BillingEventType.subscription_cancelled;
        break;
      case 'customer.subscription.created':
        mappedType = BillingEventType.subscription_created;
        break;
      case 'charge.refunded':
        mappedType = BillingEventType.refund_issued;
        break;
      default:
        return { received: true };
    }

    const orgId = dataObject?.metadata?.orgId || dataObject?.client_reference_id || 'unknown';
    const providerSubscriptionId = dataObject?.subscription || dataObject?.id;
    const amount = dataObject?.amount_paid ?? dataObject?.amount;
    const currency = dataObject?.currency;

    await this.billingService.processWebhook(
      PaymentProvider.stripe,
      eventId,
      mappedType,
      orgId,
      undefined,
      providerSubscriptionId,
      amount,
      currency,
      payload,
    );

    return { received: true };
  }

  @Post('paypal')
  @HttpCode(HttpStatus.OK)
  async handlePayPalWebhook(@Body() payload: any) {
    this.logger.log(`Received PayPal webhook: ${payload?.event_type} (${payload?.id})`);

    const eventId = payload?.id;
    const eventType = payload?.event_type;
    const resource = payload?.resource || {};

    let mappedType: BillingEventType | null = null;
    switch (eventType) {
      case 'PAYMENT.SALE.COMPLETED':
        mappedType = BillingEventType.subscription_renewed;
        break;
      case 'PAYMENT.SALE.DENIED':
        mappedType = BillingEventType.payment_failed;
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        mappedType = BillingEventType.subscription_cancelled;
        break;
      case 'BILLING.SUBSCRIPTION.CREATED':
        mappedType = BillingEventType.subscription_created;
        break;
      default:
        return { received: true };
    }

    const orgId = resource?.custom_id || 'unknown';
    const providerSubscriptionId = resource?.billing_agreement_id || resource?.id;
    const amount = resource?.amount?.total ? Math.round(parseFloat(resource.amount.total) * 100) : null;
    const currency = resource?.amount?.currency;

    await this.billingService.processWebhook(
      PaymentProvider.paypal,
      eventId,
      mappedType,
      orgId,
      undefined,
      providerSubscriptionId,
      amount,
      currency,
      payload,
    );

    return { received: true };
  }
}
