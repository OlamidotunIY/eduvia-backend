import { PlatformFeatureGuard } from '../infrastructure/services/platform-feature.guard';

describe('PlatformFeatureGuard', () => {
  let guard: PlatformFeatureGuard;

  beforeEach(() => {
    guard = new PlatformFeatureGuard();
  });

  it('should return correct features for free tier', () => {
    const features = guard.getFeaturesForTier('free');
    expect(features.maxStudents).toBe(5);
    expect(features.canAccessAi).toBe(false);
    expect(features.marketplaceListing).toBe(false);
    expect(features.deepAnalytics).toBe(false);
    expect(features.prioritySupport).toBe(false);
  });

  it('should return correct features for starter tier', () => {
    const features = guard.getFeaturesForTier('starter');
    expect(features.maxStudents).toBe(25);
    expect(features.canAccessAi).toBe(true);
    expect(features.marketplaceListing).toBe(true);
    expect(features.deepAnalytics).toBe(false);
  });

  it('should return correct features for professional tier', () => {
    const features = guard.getFeaturesForTier('professional');
    expect(features.maxStudents).toBe(100);
    expect(features.canAccessAi).toBe(true);
    expect(features.deepAnalytics).toBe(true);
    expect(features.prioritySupport).toBe(true);
  });

  it('should return unlimited students for enterprise tier', () => {
    const features = guard.getFeaturesForTier('enterprise');
    expect(features.maxStudents).toBe(Infinity);
    expect(features.canAccessAi).toBe(true);
    expect(features.deepAnalytics).toBe(true);
    expect(features.customDomain).toBe(true);
    expect(features.whiteLabelBranding).toBe(true);
    expect(features.apiAccess).toBe(true);
  });

  it('should check canAccessFeature correctly', () => {
    expect(guard.canAccessFeature('free', 'canAccessAi')).toBe(false);
    expect(guard.canAccessFeature('starter', 'canAccessAi')).toBe(true);
    expect(guard.canAccessFeature('starter', 'deepAnalytics')).toBe(false);
    expect(guard.canAccessFeature('professional', 'deepAnalytics')).toBe(true);
  });

  it('should return max active students per tier', () => {
    expect(guard.getMaxActiveStudents('free')).toBe(5);
    expect(guard.getMaxActiveStudents('starter')).toBe(25);
    expect(guard.getMaxActiveStudents('professional')).toBe(100);
    expect(guard.getMaxActiveStudents('enterprise')).toBe(Infinity);
  });
});
