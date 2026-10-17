import { BillingInterval } from '../value-objects';

export abstract class IPaymentGatewayPort {
  public abstract createCustomer(params: {
    email: string;
    name: string;
    orgId: string;
  }): Promise<string>;

  public abstract createConnectAccountLink(params: {
    orgId: string;
    returnUrl: string;
    refreshUrl: string;
  }): Promise<{ accountId: string; onboardingUrl: string }>;

  public abstract createPlanPrice(params: {
    name: string;
    amount: number;
    currency: string;
    interval: BillingInterval;
    stripeAccountId?: string;
  }): Promise<string>;

  public abstract createCheckoutSession(params: {
    customerId?: string;
    priceId: string;
    clientReferenceId: string;
    successUrl: string;
    cancelUrl: string;
    connectedAccountId?: string;
    platformFeePercent?: number;
  }): Promise<{ sessionId: string; checkoutUrl: string }>;

  public abstract cancelSubscription(providerSubscriptionId: string): Promise<void>;
  public abstract pauseSubscription(providerSubscriptionId: string): Promise<void>;
  public abstract resumeSubscription(providerSubscriptionId: string): Promise<void>;
}
