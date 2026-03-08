"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminListUsers,
  adminUpdateUserRole,
  getMe,
  type AdminUser,
} from "../../lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [meRole, setMeRole] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("metahunt_token")
        : null;
    if (!t) {
      router.replace("/");
      return;
    }
    setToken(t);
    (async () => {
      try {
        const me = await getMe(t);
        setMeRole(me.role);
        if (me.role !== "ADMIN") {
          setError("Нет доступа. Нужна роль ADMIN.");
          setLoading(false);
          return;
        }
        const list = await adminListUsers(t, { limit: 100, offset: 0 });
        setUsers(list);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Ошибка загрузки админки"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleToggleRole = async (user: AdminUser) => {
    if (!token) return;
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setUpdatingId(user.id);
    setError(null);
    try {
      const updated = await adminUpdateUserRole(token, user.id, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Не удалось обновить роль"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <div className="scanlines" aria-hidden />
      <header className="fixed top-0 left-0 right-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-display text-lg tracking-widest neon-text-cyan">
            ADMIN PANEL
          </span>
          <a
            href="/"
            className="cyber-btn px-4 py-2 text-sm text-text-muted hover:text-brand-cyan rounded"
          >
            ← НАЗАД
          </a>
        </div>
      </header>

      <div className="pt-20 px-4 max-w-5xl mx-auto">
        {error && (
          <div className="cyber-border-pink bg-brand-pink/10 text-brand-pink px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-text-muted text-sm">Загрузка...</p>
        ) : meRole !== "ADMIN" ? (
          <p className="text-text-muted text-sm">
            Доступ запрещён. Нужна роль ADMIN.
          </p>
        ) : (
          <section className="cyber-card cyber-border rounded-lg p-4 md:p-6">
            <h1 className="font-display text-xl tracking-widest neon-text-cyan mb-4">
              Пользователи
            </h1>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-text-dim border-b border-meta-border">
                    <th className="py-2 pr-4">Nick</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Archetype</th>
                    <th className="py-2 pr-4">Level</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-meta-border/50 last:border-0"
                    >
                      <td className="py-2 pr-4">{u.nickname}</td>
                      <td className="py-2 pr-4 text-text-dim">{u.email}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={
                            u.role === "ADMIN"
                              ? "text-brand-pink"
                              : "text-text-muted"
                          }
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {u.game_profile?.archetype ?? "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {u.game_profile?.level ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-text-dim">
                        {new Date(u.created_at).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u)}
                          disabled={updatingId === u.id}
                          className="cyber-btn px-3 py-1 text-xs bg-brand-cyan/10 text-brand-cyan cyber-border rounded disabled:opacity-50"
                        >
                          {u.role === "ADMIN"
                            ? "Сделать USER"
                            : "Сделать ADMIN"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

