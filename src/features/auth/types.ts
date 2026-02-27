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
};
