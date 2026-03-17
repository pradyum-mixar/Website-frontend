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
  subscription_type: number;
  subscription_expires_at?: string | null;
  trial_days_remaining?: number | null;
  trial_utilized?: boolean;
  /** Plan identifiers returned by /auth/me when subscription_type > 0 */
  plan_slug?: string;
  plan_name?: string;
};
