"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../../lib/api";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { storeToken } from "../../../shared/model/session";
import { cn } from "../../../shared/lib/cn";

type Props = {
  onSuccess?: () => void;
  className?: string;
};

export function LoginForm({ onSuccess, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    try {
      const res = await login(email, password);
      storeToken(res.access_token);
      onSuccess?.();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div>
        <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
          Email
        </label>
        <Input
          name="email"
          type="email"
          required
          placeholder="user@domain.net"
        />
      </div>
      <div>
        <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
          Пароль
        </label>
        <Input
          name="password"
          type="password"
          required
          placeholder="••••••••"
        />
      </div>
      {error && (
        <div className="text-xs text-brand-pink border border-brand-pink/40 px-3 py-2 rounded">
          {error}
        </div>
      )}
      <Button
        type="submit"
        variant="cyan"
        size="lg"
        disabled={loading}
        className="w-full"
      >
        {loading ? "..." : "Подтвердить вход"}
      </Button>
    </form>
  );
}
