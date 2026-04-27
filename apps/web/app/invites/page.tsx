"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createInvite,
  getInvites,
  redeemInvite,
  type Invite,
  type InviteLimits,
} from "../../lib/api";
import { useSession } from "../../shared/model/session";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Panel } from "../../shared/ui/Panel";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";

function prettyDate(value: string): string {
  try {
    return new Date(value).toLocaleString("ru-RU");
  } catch {
    return value;
  }
}

export default function InvitesPage() {
  const router = useRouter();
  const { token, user, loading } = useSession();

  const [items, setItems] = useState<Invite[]>([]);
  const [limits, setLimits] = useState<InviteLimits | null>(null);
  const [delivery, setDelivery] = useState("link");
  const [note, setNote] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [creating, setCreating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  const loadInvites = useCallback(async () => {
    if (!token) return;
    setLoadingList(true);
    setError(null);
    try {
      const response = await getInvites(token);
      setItems(response.items);
      setLimits(response.limits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки инвайтов");
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    loadInvites();
  }, [loadInvites]);

  const onCreate = useCallback(async () => {
    if (!token) return;
    setCreating(true);
    setError(null);
    setInfo(null);
    try {
      const response = await createInvite(token, {
        delivery,
        note: note.trim() || undefined,
      });
      setInfo(
        `Инвайт ${response.invite.code} создан. Баланс invites: ${response.balances.invite_balance}.`,
      );
      setNote("");
      await loadInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания инвайта");
    } finally {
      setCreating(false);
    }
  }, [token, delivery, note, loadInvites]);

  const onRedeem = useCallback(async () => {
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    setError(null);
    setInfo(null);
    try {
      const response = await redeemInvite({
        code: redeemCode.trim().toUpperCase(),
      });
      setInfo(
        `Код активирован. Награда пригласителю: +${response.reward.inviter_shards_delta} shards.`,
      );
      setRedeemCode("");
      await loadInvites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка активации инвайта");
    } finally {
      setRedeeming(false);
    }
  }, [redeemCode, loadInvites]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        <p>Перенаправление...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />

      <div className="page-shell pt-8 space-y-6">
        <SectionHeading as="h1">Инвайты</SectionHeading>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Список кодов</div>
              <Button variant="neutral" size="sm" onClick={loadInvites} disabled={loadingList}>
                {loadingList ? "..." : "Обновить"}
              </Button>
            </div>

            {limits && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="rounded border border-meta-border px-2 py-2">
                  day: {limits.daily_used}/{limits.daily_total}
                </div>
                <div className="rounded border border-meta-border px-2 py-2">
                  storage: {limits.storage_cap}
                </div>
                <div className="rounded border border-meta-border px-2 py-2">mode: {limits.mode}</div>
                <div className="rounded border border-meta-border px-2 py-2">total: {items.length}</div>
              </div>
            )}

            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-text-muted">Инвайтов пока нет.</div>
              ) : (
                items.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-lg border border-meta-border bg-meta-surface/75 px-3 py-3 space-y-1"
                  >
                    <div className="text-sm font-display tracking-[0.12em] text-brand-cyan">
                      {invite.code}
                    </div>
                    <div className="text-xs text-text-muted">status: {invite.status}</div>
                    <div className="text-xs text-text-dim">expires: {prettyDate(invite.expires_at)}</div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel variant="pink" className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Создать инвайт</div>
              <Input
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                placeholder="link"
              />
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="aug-input w-full px-4 py-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/30"
                placeholder="Комментарий"
              />
              <Button variant="cyan" size="md" onClick={onCreate} disabled={creating}>
                {creating ? "..." : "Создать"}
              </Button>
            </div>

            <div className="space-y-2 pt-2 border-t border-meta-border">
              <div className="text-xs uppercase tracking-[0.26em] text-text-dim">Активировать код</div>
              <Input
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                placeholder="MH-XXXX-XXXX"
              />
              <Button variant="warning" size="md" onClick={onRedeem} disabled={redeeming}>
                {redeeming ? "..." : "Redeem"}
              </Button>
            </div>

            {error && (
              <div className="text-xs border border-brand-pink/45 bg-brand-pink/10 text-brand-pink rounded px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-xs border border-brand-cyan/45 bg-brand-cyan/10 text-brand-cyan rounded px-3 py-2">
                {info}
              </div>
            )}

            <Button variant="neutral" size="sm" onClick={() => router.push("/dashboard")}>Назад в панель</Button>
          </Panel>
        </div>
      </div>
    </main>
  );
}
