"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "../../../lib/api";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { storeToken } from "../../../shared/model/session";
import { setIntroPending } from "../../../shared/model/intro";
import { cn } from "../../../shared/lib/cn";

type Props = {
  onSuccess?: () => void;
  className?: string;
};

export function RegisterForm({ onSuccess, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const passwordStrength = useMemo(() => {
    if (!password.length) return "Не задан";
    if (password.length < 8) return "Слабый";
    if (password.length < 12) return "Нормальный";
    return "Сильный";
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("reg_email") as string;
    const rawPassword = fd.get("reg_password") as string;
    try {
      await register({
        email,
        password: rawPassword,
        nickname: fd.get("nickname") as string,
      });
      const res = await login(email, rawPassword);
      storeToken(res.access_token);
      setIntroPending();
      onSuccess?.();
      router.push("/intro");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Nickname</label>
        <Input
          name="nickname"
          type="text"
          required
          minLength={3}
          autoComplete="nickname"
          placeholder="hunter_01"
        />
      </div>

      <div>
        <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Email</label>
        <Input
          name="reg_email"
          type="email"
          required
          autoComplete="email"
          placeholder="user@domain.net"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">Пароль (мин. 8)</label>
        <Input
          name="reg_password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between text-xs text-text-dim">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 accent-cyan-400"
            />
            Показать пароль
          </label>
          <span>Уровень: {passwordStrength}</span>
        </div>
      </div>

      {error && (
        <div className="text-xs text-brand-pink border border-brand-pink/40 px-3 py-2 rounded">{error}</div>
      )}

      <Button type="submit" variant="pink" size="lg" disabled={loading} className="w-full">
        {loading ? "Создание..." : "Создать аккаунт"}
      </Button>
    </form>
  );
}