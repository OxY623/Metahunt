"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "../../../lib/api";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Panel } from "../../../shared/ui/Panel";

type Props = {
  token: string;
};

export function PasswordForm({ token }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await changePassword(token, {
        current_password: fd.get("current_password") as string,
        new_password: fd.get("new_password") as string,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
            Текущий пароль
          </label>
          <Input name="current_password" type="password" required />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
            Новый пароль
          </label>
          <Input name="new_password" type="password" required minLength={8} />
        </div>
        {error && (
          <div className="text-xs text-brand-pink border border-brand-pink/40 px-3 py-2 rounded">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="cyan"
            size="lg"
            disabled={loading}
            className="flex-1"
          >
            {loading ? "..." : "Сменить"}
          </Button>
          <Button
            type="button"
            variant="neutral"
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="flex-1"
          >
            Отмена
          </Button>
        </div>
      </form>
    </Panel>
  );
}
