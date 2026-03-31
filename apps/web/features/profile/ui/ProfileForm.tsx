"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, type UserResponse } from "../../../lib/api";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Panel } from "../../../shared/ui/Panel";

const PRIVACY_OPTIONS = [
  { value: "public", label: "Публичный" },
  { value: "friends", label: "Только друзья" },
  { value: "private", label: "Скрытый" },
];

type Props = {
  token: string;
  user: UserResponse;
  onUpdated?: (user: UserResponse) => void;
};

export function ProfileForm({ token, user, onUpdated }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const u = await updateProfile(token, {
        nickname: (fd.get("nickname") as string) || undefined,
        avatar: (fd.get("avatar") as string) || undefined,
        bio: (fd.get("bio") as string) || undefined,
        privacy: (fd.get("privacy") as string) || undefined,
      });
      onUpdated?.(u);
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
            Nickname
          </label>
          <Input name="nickname" defaultValue={user.nickname} />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
            Avatar URL
          </label>
          <Input
            name="avatar"
            defaultValue={user.avatar ?? ""}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
            Bio
          </label>
          <textarea
            name="bio"
            defaultValue={user.bio ?? ""}
            rows={4}
            className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
            placeholder="Короткое описание..."
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
            Приватность
          </label>
          <select
            name="privacy"
            defaultValue={user.privacy ?? "public"}
            className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
          >
            {PRIVACY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
            {loading ? "..." : "Сохранить"}
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
