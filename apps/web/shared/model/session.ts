import { useCallback, useEffect, useState } from "react";
import { getMe, type UserResponse } from "../../lib/api";

const TOKEN_KEY = "metahunt_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return null;
    const u = await getMe(token);
    setUser(u);
    return u;
  }, [token]);

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setLoading(false);
      return;
    }
    setToken(t);
    getMe(t)
      .then((u) => setUser(u))
      .catch(() => clear())
      .finally(() => setLoading(false));
  }, [clear]);

  return {
    token,
    user,
    loading,
    setToken,
    setUser,
    clear,
    refresh,
  };
}
