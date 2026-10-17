import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGatewayPort, BillingInterval } from '../../domain';

@Injectable()
export class StripePaymentAdapter implements IPaymentGatewayPort {
  private readonly logger = new Logger(StripePaymentAdapter.name);
  private readonly secretKey: string | null;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') ?? null;
  }

  public async createCustomer(params: {
    email: string;
    name: string;
    orgId: string;
  }): Promise<string> {
    this.logger.log(`Creating Stripe customer for org ${params.orgId} (${params.email})`);

    if (!this.secretKey) {
      return `cus_mock_${params.orgId.substring(0, 8)}_${Date.now()}`;
    }

    try {
      const response = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: params.email,
          name: params.name,
          'metadata[orgId]': params.orgId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to create Stripe customer');
      }
      return data.id;
    } catch (err: any) {
      this.logger.warn(`Stripe API unavailable, using fallback mock: ${err.message}`);
      return `cus_mock_${params.orgId.substring(0, 8)}_${Date.now()}`;
    }
  }

  public async createConnectAccountLink(params: {
    orgId: string;
    returnUrl: string;
    refreshUrl: string;
  }): Promise<{ accountId: string; onboardingUrl: string }> {
    this.logger.log(`Initiating Stripe Connect OAuth link for org ${params.orgId}`);

    if (!this.secretKey) {
      const mockAccountId = `acct_mock_${params.orgId.substring(0, 8)}`;
      return {
        accountId: mockAccountId,
        onboardingUrl: `https://connect.stripe.com/setup/s/${mockAccountId}`,
      };
    }

    try {
      const acctResponse = await fetch('https://api.stripe.com/v1/accounts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'express',
          'metadata[orgId]': params.orgId,
        }),
      });
      const acctData = await acctResponse.json();
      const accountId = acctData.id;

      const linkResponse = await fetch('https://api.stripe.com/v1/account_links', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          account: accountId,
          refresh_url: params.refreshUrl,
          return_url: params.returnUrl,
          type: 'account_onboarding',
        }),
      });
      const linkData = await linkResponse.json();

      return {
        accountId,
        onboardingUrl: linkData.url,
      };
    } catch (err: any) {
      this.logger.warn(`Stripe API unavailable, using fallback mock: ${err.message}`);
      const mockAccountId = `acct_mock_${params.orgId.substring(0, 8)}`;
      return {
        accountId: mockAccountId,
        onboardingUrl: `https://connect.stripe.com/setup/s/${mockAccountId}`,
      };
    }
  }

  public async createPlanPrice(params: {
    name: string;
    amount: number;
    currency: string;
    interval: BillingInterval;
    stripeAccountId?: string;
  }): Promise<string> {
    this.logger.log(`Creating Stripe price for plan ${params.name} (${params.amount} ${params.currency})`);

    const intervalMap: Record<BillingInterval, string> = {
      [BillingInterval.monthly]: 'month',
      [BillingInterval.quarterly]: 'month',
      [BillingInterval.annually]: 'year',
    };

    if (!this.secretKey) {
      return `price_mock_${Date.now()}`;
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (params.stripeAccountId) {
        headers['Stripe-Account'] = params.stripeAccountId;
      }

      const bodyParams: Record<string, string> = {
        'product_data[name]': params.name,
        unit_amount: params.amount.toString(),
        currency: params.currency.toLowerCase(),
        'recurring[interval]': intervalMap[params.interval] || 'month',
      };
      if (params.interval === BillingInterval.quarterly) {
        bodyParams['recurring[interval_count]'] = '3';
      }

      const response = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers,
        body: new URLSearchParams(bodyParams),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to create Stripe price');
      }
      return data.id;
    } catch (err: any) {
      this.logger.warn(`Stripe API unavailable, using fallback mock: ${err.message}`);
      return `price_mock_${Date.now()}`;
    }
  }

  public async createCheckoutSession(params: {
    customerId?: string;
    priceId: string;
    clientReferenceId: string;
    successUrl: string;
    cancelUrl: string;
    connectedAccountId?: string;
    platformFeePercent?: number;
  }): Promise<{ sessionId: string; checkoutUrl: string }> {
    this.logger.log(`Creating checkout session for price ${params.priceId}`);

    if (!this.secretKey) {
      const sessionId = `cs_mock_${Date.now()}`;
      return {
        sessionId,
        checkoutUrl: `https://checkout.stripe.com/c/pay/${sessionId}`,
      };
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const bodyParams: Record<string, string> = {
        mode: 'subscription',
        'line_items[0][price]': params.priceId,
        'line_items[0][quantity]': '1',
        client_reference_id: params.clientReferenceId,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      };

      if (params.customerId) {
        bodyParams.customer = params.customerId;
      }
      if (params.connectedAccountId) {
        bodyParams['subscription_data[transfer_data][destination]'] = params.connectedAccountId;
        if (params.platformFeePercent) {
          bodyParams['subscription_data[application_fee_percent]'] = params.platformFeePercent.toString();
        }
      }

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers,
        body: new URLSearchParams(bodyParams),
      });

      const data = await response.json();
      return {
        sessionId: data.id,
        checkoutUrl: data.url,
      };
    } catch (err: any) {
      this.logger.warn(`Stripe API unavailable, using fallback mock: ${err.message}`);
      const sessionId = `cs_mock_${Date.now()}`;
      return {
        sessionId,
        checkoutUrl: `https://checkout.stripe.com/c/pay/${sessionId}`,
      };
    }
  }

  public async cancelSubscription(providerSubscriptionId: string): Promise<void> {
    this.logger.log(`Cancelling Stripe subscription ${providerSubscriptionId}`);
    if (!this.secretKey) {
      return;
    }
    try {
      await fetch(`https://api.stripe.com/v1/subscriptions/${providerSubscriptionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to cancel Stripe subscription: ${err.message}`);
    }
  }

  public async pauseSubscription(providerSubscriptionId: string): Promise<void> {
    this.logger.log(`Pausing Stripe subscription ${providerSubscriptionId}`);
    if (!this.secretKey) {
      return;
    }
    try {
      await fetch(`https://api.stripe.com/v1/subscriptions/${providerSubscriptionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'pause_collection[behavior]': 'void',
        }),
      });
    } catch (err: any) {
      this.logger.warn(`Failed to pause Stripe subscription: ${err.message}`);
    }
  }

  public async resumeSubscription(providerSubscriptionId: string): Promise<void> {
    this.logger.log(`Resuming Stripe subscription ${providerSubscriptionId}`);
    if (!this.secretKey) {
      return;
    }
    try {
      await fetch(`https://api.stripe.com/v1/subscriptions/${providerSubscriptionId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          pause_collection: '',
        }),
      });
    } catch (err: any) {
      this.logger.warn(`Failed to resume Stripe subscription: ${err.message}`);
    }
  }
}
