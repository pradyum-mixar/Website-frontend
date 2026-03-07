export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  name?: string;
  is_verified: boolean;
  is_superuser: boolean | number | string;
  google_id?: string;
  credits: number;
  subscription_type: number; // 0=Free, 1=Pro, 2=Enterprise
  subscription_expires_at?: string | null; // ISO timestamp; set when cancelled but not yet expired
};

/** Maps subscription_type integer to plan slug used by the plans API */
export const SUBSCRIPTION_TYPE_TO_SLUG: Record<number, string> = {
  0: "free",
  1: "pro",
  2: "enterprise",
};

export const SUBSCRIPTION_TYPE_TO_LABEL: Record<number, string> = {
  0: "Free",
  1: "Pro",
  2: "Enterprise",
};
