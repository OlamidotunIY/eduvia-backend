# 09 — Billing & Subscriptions

> **Module:** `src/modules/billing`
> **Status:** To build.
> **NestJS Module:** `BillingModule`

---

## Overview

The Billing & Subscriptions module handles all financial flows in Eduvia. There are two parallel billing models:

**Model A — Marketplace Orgs (Eduvia processes payments):**
- Orgs define subscription plans per subject
- Parents subscribe directly through Eduvia
- Eduvia takes a platform fee (% cut) via Stripe Connect
- Payout flows to the org's connected Stripe account

**Model B — SaaS Orgs (Eduvia bills the org, not the parent):**
- Orgs handle parent payments themselves (external to Eduvia)
- Org pays Eduvia a per-seat (per-student) monthly subscription
- Free tier available with limited features; premium features require paid plan

Both models can coexist — an org chooses at setup time whether they accept payments through Eduvia or self-manage.

---

## Domain Models

### 1. OrgBillingAccount (Aggregate Root)

The org's billing configuration with Eduvia. Determines which model the org uses.

```
OrgBillingAccount
  id:              UUID
  orgId:           UUID (unique — one billing account per org)
  billingModel:    marketplace | saas
  stripeAccountId: string? (Stripe Connect account ID — for marketplace orgs)
  paypalMerchantId: string? (PayPal merchant ID — alternative to Stripe)
  paymentProvider: stripe | paypal (which provider is primary)
  stripeCustomerId: string? (Stripe customer ID for SaaS invoice billing)
  seatCount:       int (current enrolled student count — for SaaS billing)
  freeTierActive:  boolean
  planTier:        free | starter | professional | enterprise
  currentPeriodEnd: DateTime?
  status:          active | suspended | past_due | cancelled
  createdAt:       DateTime
  updatedAt:       DateTime
```

**Domain Methods:**
- `OrgBillingAccount.create(params)` — emits `OrgBillingAccountCreatedEvent`
- `billing.connectStripe(stripeAccountId)` — links Stripe Connect account
- `billing.connectPayPal(merchantId)` — links PayPal merchant
- `billing.upgradeTier(tier)` — emits `OrgPlanUpgradedEvent`
- `billing.suspend()` — locks premium features; emits `OrgBillingSuspendedEvent`
- `billing.reactivate()` — restores access

---

### 2. SubscriptionPlan (Aggregate Root)

An org-defined plan that parents subscribe to for their child's access to a subject.

```
SubscriptionPlan
  id:              UUID
  orgId:           UUID
  subjectId:       UUID (FK -> OrgSubject)
  name:            string (e.g. "GCSE Maths - Weekly 1hr")
  description:     string?
  priceAmount:     int (in lowest currency unit, e.g. pence, cents)
  currency:        string (ISO 4217, e.g. "GBP", "USD", "NGN")
  billingInterval: monthly | quarterly | annually
  lessonsPerInterval: int (e.g. 4 = 4 lessons per month)
  isActive:        boolean
  stripePriceId:   string? (Stripe Price object ID — for Stripe-managed plans)
  paypalPlanId:    string? (PayPal Subscription Plan ID)
  createdAt:       DateTime
  updatedAt:       DateTime

  discounts:       PlanDiscount[]
  subscriptions:   ParentSubscription[]
```

**Domain Methods:**
- `SubscriptionPlan.create(params)` — emits `SubscriptionPlanCreatedEvent`; syncs to Stripe/PayPal via event
- `plan.deactivate()` — marks inactive; existing subscriptions continue until period end; new subscriptions not allowed
- `plan.addDiscount(discount)` — adds a discount code or permanent discount for specific parents
- `plan.removeDiscount(discountId)` — removes a discount

---

### 3. PlanDiscount (Entity)

Org-defined discounts for specific parents or time-limited promotions.

```
PlanDiscount
  id:           UUID
  planId:       UUID
  type:         percentage | fixed_amount
  amount:       int (percentage 0-100, or fixed amount in lowest currency unit)
  currency:     string? (only for fixed_amount)
  scope:        all_parents | specific_parent
  parentId:     UUID? (null for all_parents scope)
  expiresAt:    DateTime? (null = permanent)
  isActive:     boolean
  code:         string? (optional promo code)
  createdAt:    DateTime
```

---

### 4. ParentSubscription (Aggregate Root)

A parent's subscription to an org's plan for a specific student-subject enrollment.

```
ParentSubscription
  id:                 UUID
  orgId:              UUID
  planId:             UUID (FK -> SubscriptionPlan)
  parentId:           UUID (FK -> ParentProfile)
  studentId:          UUID (FK -> StudentProfile)
  subjectId:          UUID
  provider:           stripe | paypal
  providerSubscriptionId: string (Stripe/PayPal subscription ID)
  status:             active | past_due | cancelled | paused | trialing
  discountId:         UUID? (applied discount)
  effectivePriceAmount: int (after discount applied)
  currentPeriodStart: DateTime
  currentPeriodEnd:   DateTime
  cancelledAt:        DateTime?
  cancelReason:       string?
  createdAt:          DateTime
  updatedAt:          DateTime
```

**Domain Methods:**
- `ParentSubscription.create(params)` — emits `SubscriptionCreatedEvent`; enables classroom access
- `subscription.cancel(reason)` — emits `SubscriptionCancelledEvent`; access ends at `currentPeriodEnd`
- `subscription.pause()` — temporarily suspends (e.g. school holidays)
- `subscription.resume()` — resumes paused subscription
- `subscription.markPastDue()` — payment failed; emits `SubscriptionPaymentFailedEvent`
- `subscription.renew(newPeriodEnd)` — payment succeeded; emits `SubscriptionRenewedEvent`

---

### 5. BillingEvent (Entity)

An immutable audit log of every billing-related event. Never deleted.

```
BillingEvent
  id:              UUID
  orgId:           UUID
  subscriptionId:  UUID?
  type:            subscription_created | subscription_renewed | payment_failed | subscription_cancelled | refund_issued
  provider:        stripe | paypal
  providerEventId: string (Stripe event ID or PayPal IPN message ID — for idempotency)
  amount:          int?
  currency:        string?
  metadata:        JSON
  occurredAt:      DateTime
  createdAt:       DateTime
```

---

### 6. SeatUsageRecord (Entity)

Tracks org seat usage (student count) for SaaS billing orgs. Updated monthly.

```
SeatUsageRecord
  id:          UUID
  orgId:       UUID
  month:       string (e.g. "2025-01")
  seatCount:   int (active student count for this billing period)
  tierAtTime:  string (org plan tier during this period)
  invoicedAt:  DateTime?
  createdAt:   DateTime
```

---

## Domain Events

| Event | Emitted By | Payload | Consumer Queue |
|---|---|---|---|
| `OrgBillingAccountCreatedEvent` | OrgBillingAccount.create | orgId, billingModel | billing-events |
| `SubscriptionPlanCreatedEvent` | SubscriptionPlan.create | planId, orgId, priceAmount | billing-events (sync to Stripe/PayPal) |
| `SubscriptionCreatedEvent` | ParentSubscription.create | subscriptionId, orgId, parentId, studentId | classroom-events (unlock access), notification-events |
| `SubscriptionPaymentFailedEvent` | subscription.markPastDue | subscriptionId, orgId, parentId | notification-events, classroom-events (warn of access risk) |
| `SubscriptionCancelledEvent` | subscription.cancel | subscriptionId, orgId, parentId | classroom-events (schedule access end), notification-events |
| `SubscriptionRenewedEvent` | subscription.renew | subscriptionId, orgId, newPeriodEnd | notification-events |
| `OrgPlanUpgradedEvent` | billing.upgradeTier | orgId, newTier | (unlock platform features) |
| `OrgBillingSuspendedEvent` | billing.suspend | orgId | notification-events, org-events (lock premium features) |

---

## Domain Logic

| Rule | Enforcement |
|---|---|
| A student can only have one active subscription per subject per org | Unique constraint on `(parentId, studentId, subjectId, orgId)` where status=active |
| A SubscriptionPlan cannot be created for an org that has not connected Stripe or PayPal (for marketplace billing) | `SubscriptionPlan.create()` — checks `orgBillingAccount.stripeAccountId != null OR paypalMerchantId != null` |
| Discounts with `scope=specific_parent` can only be applied to that parent's subscriptions | `PlanDiscount` scope enforced at subscription creation |
| BillingEvents are idempotent — duplicate webhook events are ignored | `providerEventId` has unique constraint; duplicate webhook returns 200 but is not reprocessed |
| Past due subscriptions get a 7-day grace period before classroom access is revoked | Business logic in BillingWorker — waits 7 days after `SubscriptionPaymentFailedEvent` |
| SaaS billing orgs cannot use marketplace payment features | `OrgBillingAccount.billingModel` determines which features are available |
| Free tier orgs are limited in features (no AI features, max 5 students, no marketplace listing) | Feature flag checked via `OrgBillingAccount.planTier` |

---

## Business Actions

### Org Billing Setup

| Action | Actor | Description |
|---|---|---|
| Create org billing account | OrgOwner | Choose marketplace or SaaS billing model |
| Connect Stripe account | OrgOwner | OAuth flow via Stripe Connect |
| Connect PayPal merchant | OrgOwner | Link PayPal merchant account |
| Create subscription plan | OrgAdmin | Define plan with price, interval, lessons included |
| Deactivate plan | OrgAdmin | Stop new subscriptions to this plan |
| Add discount for parent | OrgAdmin | Create PlanDiscount for a specific parent or all |
| Upgrade org tier | OrgAdmin | Upgrade SaaS tier (starter -> professional -> enterprise) |

### Parent Billing

| Action | Actor | Description |
|---|---|---|
| View available plans | Parent | Browse org's subscription plans for a subject |
| Subscribe to plan | Parent | Creates ParentSubscription via Stripe/PayPal; activates classroom access |
| Apply discount code | Parent | Applies promo code at checkout |
| View billing history | Parent | Lists BillingEvents for their subscriptions |
| Cancel subscription | Parent | Cancels at period end (access until then) |
| Pause subscription | Parent | Temporarily pauses (org-configurable policy) |
| Resume subscription | Parent | Resumes paused subscription |

### Stripe/PayPal Webhook Processing

| Webhook Event | Action |
|---|---|
| `customer.subscription.created` (Stripe) | Confirm subscription active, sync to DB |
| `customer.subscription.updated` (Stripe) | Sync status changes |
| `invoice.payment_failed` (Stripe) | `subscription.markPastDue()` → grace period flow |
| `invoice.payment_succeeded` (Stripe) | `subscription.renew(newPeriodEnd)` |
| `customer.subscription.deleted` (Stripe) | `subscription.cancel()` |
| `BILLING.SUBSCRIPTION.CREATED` (PayPal) | Same as Stripe created |
| `BILLING.SUBSCRIPTION.CANCELLED` (PayPal) | Same as Stripe deleted |
| `PAYMENT.SALE.COMPLETED` (PayPal) | `subscription.renew()` |
| `PAYMENT.SALE.DENIED` (PayPal) | `subscription.markPastDue()` |

---

## Repositories

| Repository | Interface | Scope |
|---|---|---|
| OrgBillingAccount | `IOrgBillingAccountRepository` | Org-scoped (1:1 with org) |
| SubscriptionPlan | `ISubscriptionPlanRepository` | Org-scoped |
| ParentSubscription | `IParentSubscriptionRepository` | Org-scoped |
| BillingEvent | `IBillingEventRepository` | Org-scoped (immutable) |
| SeatUsageRecord | `ISeatUsageRecordRepository` | Org-scoped |

---

## Prisma Schema (To Add)

```prisma
// billing.prisma

model OrgBillingAccount {
  id               String   @id @db.Uuid
  orgId            String   @unique @db.Uuid
  billingModel     BillingModel
  stripeAccountId  String?
  paypalMerchantId String?
  paymentProvider  PaymentProvider?
  stripeCustomerId String?
  seatCount        Int      @default(0)
  freeTierActive   Boolean  @default(true)
  planTier         OrgPlanTier @default(free)
  currentPeriodEnd DateTime?
  status           BillingAccountStatus @default(active)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum BillingModel { marketplace saas }
enum PaymentProvider { stripe paypal }
enum OrgPlanTier { free starter professional enterprise }
enum BillingAccountStatus { active suspended past_due cancelled }

model SubscriptionPlan {
  id                  String   @id @db.Uuid
  orgId               String   @db.Uuid
  subjectId           String   @db.Uuid
  name                String
  description         String?
  priceAmount         Int
  currency            String
  billingInterval     BillingInterval
  lessonsPerInterval  Int
  isActive            Boolean  @default(true)
  stripePriceId       String?
  paypalPlanId        String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  discounts           PlanDiscount[]
  subscriptions       ParentSubscription[]
}

enum BillingInterval { monthly quarterly annually }

model PlanDiscount {
  id         String   @id @db.Uuid
  planId     String   @db.Uuid
  type       DiscountType
  amount     Int
  currency   String?
  scope      DiscountScope
  parentId   String?  @db.Uuid
  expiresAt  DateTime?
  isActive   Boolean  @default(true)
  code       String?
  createdAt  DateTime @default(now())

  plan       SubscriptionPlan @relation(fields: [planId], references: [id])
}

enum DiscountType { percentage fixed_amount }
enum DiscountScope { all_parents specific_parent }

model ParentSubscription {
  id                    String   @id @db.Uuid
  orgId                 String   @db.Uuid
  planId                String   @db.Uuid
  parentId              String   @db.Uuid
  studentId             String   @db.Uuid
  subjectId             String   @db.Uuid
  provider              PaymentProvider
  providerSubscriptionId String
  status                SubscriptionStatus
  discountId            String?  @db.Uuid
  effectivePriceAmount  Int
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelledAt           DateTime?
  cancelReason          String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  plan                  SubscriptionPlan @relation(fields: [planId], references: [id])

  @@unique([parentId, studentId, subjectId, orgId])
}

enum SubscriptionStatus { active past_due cancelled paused trialing }

model BillingEvent {
  id               String   @id @db.Uuid
  orgId            String   @db.Uuid
  subscriptionId   String?  @db.Uuid
  type             BillingEventType
  provider         PaymentProvider
  providerEventId  String   @unique
  amount           Int?
  currency         String?
  metadata         Json
  occurredAt       DateTime
  createdAt        DateTime @default(now())
}

enum BillingEventType { subscription_created subscription_renewed payment_failed subscription_cancelled refund_issued }
```

---

## API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /orgs/:orgId/billing/setup | OrgOwner | Create org billing account |
| GET | /orgs/:orgId/billing | OrgAdmin | Get org billing account details |
| POST | /orgs/:orgId/billing/stripe/connect | OrgOwner | Initiate Stripe Connect OAuth |
| POST | /orgs/:orgId/billing/paypal/connect | OrgOwner | Connect PayPal merchant |
| POST | /orgs/:orgId/billing/upgrade | OrgOwner | Upgrade SaaS plan tier |
| GET | /orgs/:orgId/subscription-plans | Public/Parent | List org's subscription plans |
| POST | /orgs/:orgId/subscription-plans | OrgAdmin | Create subscription plan |
| PATCH | /orgs/:orgId/subscription-plans/:planId | OrgAdmin | Update plan |
| POST | /orgs/:orgId/subscription-plans/:planId/deactivate | OrgAdmin | Deactivate plan |
| POST | /orgs/:orgId/subscription-plans/:planId/discounts | OrgAdmin | Add discount |
| POST | /subscriptions | Parent | Subscribe to a plan |
| GET | /subscriptions | Parent | List parent subscriptions |
| POST | /subscriptions/:id/cancel | Parent | Cancel subscription |
| POST | /subscriptions/:id/pause | Parent | Pause subscription |
| POST | /subscriptions/:id/resume | Parent | Resume subscription |
| GET | /billing/history | Parent | Get billing history |
| POST | /webhooks/stripe | System | Stripe webhook endpoint |
| POST | /webhooks/paypal | System | PayPal IPN/webhook endpoint |
