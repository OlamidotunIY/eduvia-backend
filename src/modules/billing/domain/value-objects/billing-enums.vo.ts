export enum BillingModel {
  marketplace = 'marketplace',
  saas = 'saas',
}

export enum PaymentProvider {
  stripe = 'stripe',
  paypal = 'paypal',
}

export enum OrgPlanTier {
  free = 'free',
  starter = 'starter',
  professional = 'professional',
  enterprise = 'enterprise',
}

export enum BillingAccountStatus {
  active = 'active',
  suspended = 'suspended',
  past_due = 'past_due',
  cancelled = 'cancelled',
}

export enum BillingInterval {
  monthly = 'monthly',
  quarterly = 'quarterly',
  annually = 'annually',
}

export enum DiscountType {
  percentage = 'percentage',
  fixed_amount = 'fixed_amount',
}

export enum DiscountScope {
  all_parents = 'all_parents',
  specific_parent = 'specific_parent',
}

export enum SubscriptionStatus {
  active = 'active',
  past_due = 'past_due',
  cancelled = 'cancelled',
  paused = 'paused',
  trialing = 'trialing',
}

export enum BillingEventType {
  subscription_created = 'subscription_created',
  subscription_renewed = 'subscription_renewed',
  payment_failed = 'payment_failed',
  subscription_cancelled = 'subscription_cancelled',
  refund_issued = 'refund_issued',
}
