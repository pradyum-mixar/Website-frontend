import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { authStorage } from "./storage";
import type { CurrentUser } from "./types";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperuser: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(authStorage.readUser());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const tokens = authStorage.readTokens();
    if (!tokens?.accessToken) {
      setUser(null);
      return;
    }
    const me = await apiClient.me();
    setUser(me);
  };

  const login = async (email: string, password: string) => {
    await apiClient.login(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } catch {
        authStorage.clearTokens();
        authStorage.clearUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isSuperuser: Boolean(user?.is_superuser),
      login,
      logout,
      refreshUser,
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
