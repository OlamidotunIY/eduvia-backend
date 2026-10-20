import { Injectable } from '@nestjs/common';

export type OrgPlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface OrgTierFeatures {
  maxStudents: number;
  canAccessAi: boolean;
  marketplaceListing: boolean;
  deepAnalytics: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  whiteLabelBranding: boolean;
  apiAccess: boolean;
}

const TIER_FEATURES: Record<OrgPlanTier, OrgTierFeatures> = {
  free: {
    maxStudents: 5,
    canAccessAi: false,
    marketplaceListing: false,
    deepAnalytics: false,
    prioritySupport: false,
    customDomain: false,
    whiteLabelBranding: false,
    apiAccess: false,
  },
  starter: {
    maxStudents: 25,
    canAccessAi: true,
    marketplaceListing: true,
    deepAnalytics: false,
    prioritySupport: false,
    customDomain: false,
    whiteLabelBranding: false,
    apiAccess: false,
  },
  professional: {
    maxStudents: 100,
    canAccessAi: true,
    marketplaceListing: true,
    deepAnalytics: true,
    prioritySupport: true,
    customDomain: false,
    whiteLabelBranding: false,
    apiAccess: false,
  },
  enterprise: {
    maxStudents: Infinity,
    canAccessAi: true,
    marketplaceListing: true,
    deepAnalytics: true,
    prioritySupport: true,
    customDomain: true,
    whiteLabelBranding: true,
    apiAccess: true,
  },
};

@Injectable()
export class PlatformFeatureGuard {
  public getFeaturesForTier(tier: string | OrgPlanTier = 'free'): OrgTierFeatures {
    const normalized = (tier?.toLowerCase() as OrgPlanTier) || 'free';
    return TIER_FEATURES[normalized] ?? TIER_FEATURES.free;
  }

  public canAccessFeature(
    tier: string | OrgPlanTier = 'free',
    feature: keyof OrgTierFeatures,
  ): boolean {
    const features = this.getFeaturesForTier(tier);
    const value = features[feature];
    if (typeof value === 'boolean') {
      return value;
    }
    return true;
  }

  public getMaxActiveStudents(tier: string | OrgPlanTier = 'free'): number {
    return this.getFeaturesForTier(tier).maxStudents;
  }
}
