# Setup Guide — Payments (Stripe Connect + PayPal Subscriptions)

> Full production setup for billing in Eduvia covering Stripe Connect (marketplace payouts) and PayPal Subscriptions, with idempotent webhook processing.

---

## Architecture Decision

Eduvia has two payment models:
- **Marketplace orgs** — Eduvia collects payment from parents and pays out to org via **Stripe Connect** (platform fee taken automatically via `application_fee_amount`)
- **SaaS orgs** — Eduvia invoices the org directly via **Stripe Billing** (flat monthly SaaS tier)

**PayPal** is supported as a secondary option (some orgs prefer it for international regions). PayPal subscriptions use IPN/webhooks for lifecycle events.

All webhook processing is **idempotent**: the `BillingEvent.providerEventId` has a unique constraint — duplicate webhooks are silently accepted with HTTP 200 but not reprocessed.

---

## 1. Install Dependencies

```bash
pnpm add stripe @paypal/paypal-server-sdk
```

---

## 2. Stripe Module

```typescript
// src/modules/billing/infrastructure/stripe/stripe.module.ts

import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { StripeConnectService } from './stripe-connect.service';

@Module({
  providers: [StripeService, StripeWebhookService, StripeConnectService],
  exports: [StripeService, StripeWebhookService, StripeConnectService],
})
export class StripeModule {}
```

```typescript
// src/modules/billing/infrastructure/stripe/stripe.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  readonly client: Stripe;

  constructor() {
    this.client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
      typescript: true,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.balance.retrieve();
      this.logger.log('Stripe client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Stripe', error);
    }
  }
}
```

---

## 3. Stripe Connect — Org Onboarding

```typescript
// src/modules/billing/infrastructure/stripe/stripe-connect.service.ts

import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Injectable()
export class StripeConnectService {
  constructor(private readonly stripe: StripeService) {}

  // Step 1: Create a Connect account for the org
  async createConnectedAccount(orgId: string, email: string): Promise<string> {
    const account = await this.stripe.client.accounts.create({
      type: 'express',
      email,
      metadata: { orgId },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: { schedule: { interval: 'weekly', weekly_anchor: 'friday' } },
      },
    });

    return account.id; // store as OrgBillingAccount.stripeAccountId
  }

  // Step 2: Generate OAuth onboarding link
  async createOnboardingLink(stripeAccountId: string): Promise<string> {
    const link = await this.stripe.client.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.APP_URL}/billing/stripe/refresh`,
      return_url: `${process.env.APP_URL}/billing/stripe/complete`,
      type: 'account_onboarding',
    });

    return link.url;
  }

  // Check if the org's Connect account is fully onboarded
  async isOnboarded(stripeAccountId: string): Promise<boolean> {
    const account = await this.stripe.client.accounts.retrieve(stripeAccountId);
    return account.details_submitted && !account.requirements?.currently_due?.length;
  }

  // Create a customer for a parent (for saving payment methods)
  async createCustomer(parentId: string, email: string): Promise<string> {
    const customer = await this.stripe.client.customers.create({
      email,
      metadata: { parentId },
    });
    return customer.id;
  }

  // Create a subscription with platform fee (marketplace billing)
  async createSubscription(params: {
    customerId: string;
    priceId: string;
    connectedAccountId: string;
    applicationFeePercent: number;  // Eduvia's cut, e.g. 15 (= 15%)
    metadata: Record<string, string>;
  }): Promise<Stripe.Subscription> {
    return this.stripe.client.subscriptions.create(
      {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        application_fee_percent: params.applicationFeePercent,
        expand: ['latest_invoice.payment_intent'],
        metadata: params.metadata,
      },
      {
        stripeAccount: params.connectedAccountId,  // charge on behalf of the org's account
      },
    );
  }

  // Create a Stripe Price object when org creates a subscription plan
  async createPrice(params: {
    connectedAccountId: string;
    unitAmount: number;
    currency: string;
    interval: 'month' | 'year';
    productName: string;
    orgId: string;
    planId: string;
  }): Promise<string> {
    const product = await this.stripe.client.products.create(
      { name: params.productName, metadata: { orgId: params.orgId, planId: params.planId } },
      { stripeAccount: params.connectedAccountId },
    );

    const price = await this.stripe.client.prices.create(
      {
        product: product.id,
        unit_amount: params.unitAmount,
        currency: params.currency,
        recurring: { interval: params.interval },
      },
      { stripeAccount: params.connectedAccountId },
    );

    return price.id; // store as SubscriptionPlan.stripePriceId
  }
}
```

---

## 4. Stripe Webhook Handler

```typescript
// src/modules/billing/presentation/controllers/stripe-webhook.controller.ts

import { Controller, Post, Req, Headers, HttpCode, Logger } from '@nestjs/common';
import { Request } from 'express';
import { StripeWebhookService } from '../../infrastructure/stripe/stripe-webhook.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    // req.body MUST be raw Buffer — configure express to NOT parse this route as JSON
    await this.webhookService.handleEvent(req.body as Buffer, signature);
  }
}
```

```typescript
// IMPORTANT: Configure raw body parsing for /webhooks/stripe in main.ts
// src/main.ts

app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json()); // for all other routes
```

```typescript
// src/modules/billing/infrastructure/stripe/stripe-webhook.service.ts

import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CommandBus } from '@nestjs/cqrs';
import { StripeService } from './stripe.service';
import {
  HandleSubscriptionRenewedCommand,
  HandleSubscriptionCancelledCommand,
  HandlePaymentFailedCommand,
} from '../../application/commands';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly stripe: StripeService,
    private readonly commandBus: CommandBus,
  ) {}

  async handleEvent(payload: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.client.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (error) {
      this.logger.error('Invalid Stripe webhook signature', error);
      throw new Error('Invalid webhook signature');
    }

    this.logger.debug(`Stripe event received: ${event.type} (${event.id})`);

    // providerEventId = event.id ensures idempotency (DB unique constraint)
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.commandBus.execute(
          new HandleSubscriptionRenewedCommand({
            providerEventId: event.id,
            providerSubscriptionId: invoice.subscription as string,
            newPeriodEnd: new Date((invoice.lines.data[0].period.end) * 1000),
            amount: invoice.amount_paid,
            currency: invoice.currency,
            provider: 'stripe',
          }),
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.commandBus.execute(
          new HandlePaymentFailedCommand({
            providerEventId: event.id,
            providerSubscriptionId: invoice.subscription as string,
            provider: 'stripe',
          }),
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.commandBus.execute(
          new HandleSubscriptionCancelledCommand({
            providerEventId: event.id,
            providerSubscriptionId: sub.id,
            provider: 'stripe',
          }),
        );
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }
}
```

---

## 5. HandleSubscriptionRenewedCommand Handler (Idempotent)

```typescript
// src/modules/billing/application/commands/handle-subscription-renewed/handler.ts

@CommandHandler(HandleSubscriptionRenewedCommand)
export class HandleSubscriptionRenewedHandler
  implements ICommandHandler<HandleSubscriptionRenewedCommand>
{
  constructor(
    private readonly subscriptionRepository: IParentSubscriptionRepository,
    private readonly billingEventRepository: IBillingEventRepository,
  ) {}

  async execute(command: HandleSubscriptionRenewedCommand): Promise<void> {
    // IDEMPOTENCY CHECK — if this webhook was already processed, skip
    const alreadyProcessed = await this.billingEventRepository.existsByProviderEventId(
      command.payload.providerEventId,
    );
    if (alreadyProcessed) return; // return 200 to Stripe, do nothing

    const subscription = await this.subscriptionRepository.findByProviderSubscriptionId(
      command.payload.providerSubscriptionId,
    );
    if (!subscription) {
      throw new Error(`Subscription not found: ${command.payload.providerSubscriptionId}`);
    }

    subscription.renew(command.payload.newPeriodEnd, command.payload.correlationId);

    await this.subscriptionRepository.save(subscription);
    // save() writes the SubscriptionRenewedEvent to the outbox atomically
    // The outbox → notification-events queue → notifies the parent
  }
}
```

---

## 6. PayPal Setup

```typescript
// src/modules/billing/infrastructure/paypal/paypal.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class PayPalService implements OnModuleInit {
  private readonly logger = new Logger(PayPalService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private readonly baseUrl = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  async onModuleInit(): Promise<void> {
    await this.refreshToken();
    this.logger.log('PayPal client initialized');
  }

  private async refreshToken(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json() as { access_token: string; expires_in: number };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  }

  async getToken(): Promise<string> {
    if (!this.accessToken || Date.now() > this.tokenExpiresAt) {
      await this.refreshToken();
    }
    return this.accessToken!;
  }

  // Create a PayPal subscription plan (one-time, reused for all parent subscriptions)
  async createPlan(params: {
    productName: string;
    description: string;
    amount: number;      // in major currency unit (e.g. 9.99)
    currency: string;
    interval: 'MONTH' | 'YEAR';
    orgId: string;
    planId: string;
  }): Promise<string> {
    const token = await this.getToken();

    // First create a PayPal Product
    const productRes = await fetch(`${this.baseUrl}/v1/catalogs/products`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: params.productName,
        description: params.description,
        type: 'SERVICE',
        category: 'EDUCATIONAL_AND_TEXTBOOKS',
      }),
    });
    const product = await productRes.json() as { id: string };

    // Then create the subscription plan
    const planRes = await fetch(`${this.baseUrl}/v1/billing/plans`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: product.id,
        name: params.productName,
        billing_cycles: [{
          frequency: { interval_unit: params.interval, interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: (params.amount / 100).toFixed(2), currency_code: params.currency },
          },
        }],
        payment_preferences: { auto_bill_outstanding: true },
      }),
    });

    const plan = await planRes.json() as { id: string };
    return plan.id; // store as SubscriptionPlan.paypalPlanId
  }

  // Webhook verification
  async verifyWebhookSignature(headers: Record<string, string>, body: string): Promise<boolean> {
    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
      }),
    });
    const result = await res.json() as { verification_status: string };
    return result.verification_status === 'SUCCESS';
  }
}
```

---

## 7. PayPal Webhook Controller

```typescript
// src/modules/billing/presentation/controllers/paypal-webhook.controller.ts

import { Controller, Post, Req, Headers, HttpCode, Logger } from '@nestjs/common';
import { Request } from 'express';
import { PayPalService } from '../../infrastructure/paypal/paypal.service';
import { CommandBus } from '@nestjs/cqrs';

@Controller('webhooks/paypal')
export class PayPalWebhookController {
  private readonly logger = new Logger(PayPalWebhookController.name);

  constructor(
    private readonly paypal: PayPalService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
  ): Promise<void> {
    const rawBody = JSON.stringify(req.body);

    const isValid = await this.paypal.verifyWebhookSignature(headers, rawBody);
    if (!isValid) {
      this.logger.error('Invalid PayPal webhook signature');
      return; // Still return 200 to avoid PayPal retrying
    }

    const event = req.body as { event_type: string; id: string; resource: Record<string, unknown> };
    this.logger.debug(`PayPal event: ${event.event_type} (${event.id})`);

    switch (event.event_type) {
      case 'PAYMENT.SALE.COMPLETED':
        await this.commandBus.execute(/* HandleSubscriptionRenewedCommand with providerEventId: event.id */);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await this.commandBus.execute(/* HandleSubscriptionCancelledCommand */);
        break;
      case 'PAYMENT.SALE.DENIED':
        await this.commandBus.execute(/* HandlePaymentFailedCommand */);
        break;
    }
  }
}
```

---

## 8. Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=15

# PayPal
PAYPAL_MODE=sandbox          # or 'live'
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...        # from PayPal developer dashboard

# App
APP_URL=https://app.eduvia.com
```

---

## 9. Stripe CLI for Local Webhook Testing

```bash
# Install Stripe CLI and forward webhooks to local server
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger a test event
stripe trigger invoice.payment_succeeded
```
