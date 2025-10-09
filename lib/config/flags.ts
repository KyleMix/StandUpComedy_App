const toBoolean = (value: string | undefined): boolean => {
  if (!value) return false;
  return ["1", "true", "TRUE", "True", "yes", "YES", "on", "ON"].includes(value);
};

export const FEATURE_FLAGS = {
  premiumBoost: toBoolean(process.env.FEATURE_PREMIUM_BOOST),
  premiumEarlyApply: toBoolean(process.env.FEATURE_PREMIUM_EARLY_APPLY),
} as const;

export const isPremiumBoostEnabled = (): boolean => FEATURE_FLAGS.premiumBoost;
export const isPremiumEarlyApplyEnabled = (): boolean => FEATURE_FLAGS.premiumEarlyApply;
