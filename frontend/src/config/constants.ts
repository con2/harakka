/**
 * Application-wide constants
 */

/**
 * Common ban reasons that admins can quickly select from
 */
export const COMMON_BAN_REASONS = [
  "Violation of community guidelines",
  "Harassment of other users",
  "Spam or promotional content",
  "Inappropriate behavior",
  "Security concerns",
  "Terms of service violation",
  "Other",
] as const;

export type BanReason = (typeof COMMON_BAN_REASONS)[number];

/**
 * Special value for custom ban reason
 */
export const CUSTOM_BAN_REASON = "Other" as const;

/**
 * Default Org and Role assigned to a user signing up
 */
export const DEFAULT_ORGANIZATION = "Global" as const;
export const DEFAULT_ROLE = "user" as const;
