import { useCallback, useEffect, useState } from "react";
import { getGameProfile, type GameProfileResponse } from "../../lib/api";

export function useGameProfile(token: string | null, enabled = true) {
  const [profile, setProfile] = useState<GameProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !enabled) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await getGameProfile(token);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка профиля");
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, enabled]);

  useEffect(() => {
    if (!token || !enabled) {
      setProfile(null);
      return;
    }
    refresh();
  }, [token, enabled, refresh]);

  return { profile, loading, error, refresh, setProfile };
}
