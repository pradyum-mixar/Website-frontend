import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { queryClient } from "../../app/providers";
import { authStorage } from "./storage";
import type { CurrentUser } from "./types";

type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperuser: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<CurrentUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(() => {
    // Only trust cached user if we also have a token
    const tokens = authStorage.readTokens();
    return tokens?.accessToken ? authStorage.readUser() : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (): Promise<CurrentUser | null> => {
    const tokens = authStorage.readTokens();
    if (!tokens?.accessToken) {
      setUser(null);
      return null;
    }
    const me = await apiClient.me();
    setUser(me);
    return me;
  };

  const login = async (email: string, password: string) => {
    queryClient.clear();
    await apiClient.login(email, password);
    await refreshUser();
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    queryClient.clear();
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } catch (err) {
        console.error("Auth init error:", err);
        authStorage.clearTokens();
        authStorage.clearUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => {
      // Safely handle strict true/false conversion
      const isSuper = user?.is_superuser === true || user?.is_superuser === "true" || user?.is_superuser === 1;
      return {
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isSuperuser: isSuper,
        login,
        logout,
        refreshUser,
      };
    },
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
