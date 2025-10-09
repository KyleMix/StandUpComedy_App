const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === null) return fallback;
  return ["1", "true", "TRUE", "True", "yes", "YES", "on", "ON"].includes(value);
};

export const FEATURE_FLAGS = {
  premiumBoost: toBoolean(process.env.FEATURE_PREMIUM_BOOST),
  premiumEarlyApply: toBoolean(process.env.FEATURE_PREMIUM_EARLY_APPLY),
  adsEnabled: toBoolean(process.env.FEATURE_ADS_ENABLED, true),
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAG_METADATA: Record<FeatureFlagKey, { label: string; description: string }> = {
  premiumBoost: {
    label: "Premium search boost",
    description: "Move premium comedians higher in search results.",
  },
  premiumEarlyApply: {
    label: "Premium early applications",
    description: "Allow premium comedians to apply to gigs before the general audience.",
  },
  adsEnabled: {
    label: "Ads enabled",
    description: "Render configured ad slots across the application.",
  },
};

export const getDefaultFeatureFlags = (): Record<FeatureFlagKey, boolean> => ({ ...FEATURE_FLAGS });

export const isPremiumBoostEnabled = (): boolean => FEATURE_FLAGS.premiumBoost;
export const isPremiumEarlyApplyEnabled = (): boolean => FEATURE_FLAGS.premiumEarlyApply;
export const areAdsEnabled = (): boolean => FEATURE_FLAGS.adsEnabled;
