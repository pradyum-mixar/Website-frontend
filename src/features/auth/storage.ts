import type { AuthTokens, CurrentUser } from "./types";

const ACCESS_TOKEN_KEY = "mixie_access_token";
const REFRESH_TOKEN_KEY = "mixie_refresh_token";
const USER_KEY = "mixie_current_user";

export const authStorage = {
  readTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
    if (!accessToken) return null;
    return { accessToken, refreshToken };
  },
  writeTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  },
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  readUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  },
  writeUser(user: CurrentUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  },
};
