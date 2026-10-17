export * from './setup-org-billing/setup-org-billing.command';
export * from './setup-org-billing/setup-org-billing.handler';

export * from './connect-stripe/connect-stripe.command';
export * from './connect-stripe/connect-stripe.handler';

export * from './connect-paypal/connect-paypal.command';
export * from './connect-paypal/connect-paypal.handler';

export * from './upgrade-org-tier/upgrade-org-tier.command';
export * from './upgrade-org-tier/upgrade-org-tier.handler';

export * from './create-subscription-plan/create-subscription-plan.command';
export * from './create-subscription-plan/create-subscription-plan.handler';

export * from './deactivate-subscription-plan/deactivate-subscription-plan.command';
export * from './deactivate-subscription-plan/deactivate-subscription-plan.handler';

export * from './add-plan-discount/add-plan-discount.command';
export * from './add-plan-discount/add-plan-discount.handler';

export * from './subscribe-parent/subscribe-parent.command';
export * from './subscribe-parent/subscribe-parent.handler';

export * from './cancel-parent-subscription/cancel-parent-subscription.command';
export * from './cancel-parent-subscription/cancel-parent-subscription.handler';

export * from './pause-parent-subscription/pause-parent-subscription.command';
export * from './pause-parent-subscription/pause-parent-subscription.handler';

export * from './resume-parent-subscription/resume-parent-subscription.command';
export * from './resume-parent-subscription/resume-parent-subscription.handler';

export * from './process-billing-webhook/process-billing-webhook.command';
export * from './process-billing-webhook/process-billing-webhook.handler';

import { SetupOrgBillingHandler } from './setup-org-billing/setup-org-billing.handler';
import { ConnectStripeHandler } from './connect-stripe/connect-stripe.handler';
import { ConnectPayPalHandler } from './connect-paypal/connect-paypal.handler';
import { UpgradeOrgTierHandler } from './upgrade-org-tier/upgrade-org-tier.handler';
import { CreateSubscriptionPlanHandler } from './create-subscription-plan/create-subscription-plan.handler';
import { DeactivateSubscriptionPlanHandler } from './deactivate-subscription-plan/deactivate-subscription-plan.handler';
import { AddPlanDiscountHandler } from './add-plan-discount/add-plan-discount.handler';
import { SubscribeParentHandler } from './subscribe-parent/subscribe-parent.handler';
import { CancelParentSubscriptionHandler } from './cancel-parent-subscription/cancel-parent-subscription.handler';
import { PauseParentSubscriptionHandler } from './pause-parent-subscription/pause-parent-subscription.handler';
import { ResumeParentSubscriptionHandler } from './resume-parent-subscription/resume-parent-subscription.handler';
import { ProcessBillingWebhookHandler } from './process-billing-webhook/process-billing-webhook.handler';

export const COMMAND_HANDLERS = [
  SetupOrgBillingHandler,
  ConnectStripeHandler,
  ConnectPayPalHandler,
  UpgradeOrgTierHandler,
  CreateSubscriptionPlanHandler,
  DeactivateSubscriptionPlanHandler,
  AddPlanDiscountHandler,
  SubscribeParentHandler,
  CancelParentSubscriptionHandler,
  PauseParentSubscriptionHandler,
  ResumeParentSubscriptionHandler,
  ProcessBillingWebhookHandler,
];
