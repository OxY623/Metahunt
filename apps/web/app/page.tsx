"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import FoxyProtocolComic from "../components/foxy/FoxyProtocolComic";
import FoxyGlitchTerminal from "../components/foxy/FoxyGlitchTerminal";
import FoxyProtocolHero from "../components/foxy/FoxyProtocolHero";
import {
  health,
  login,
  register,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getGameProfile,
  chooseArchetype,
  interact,
  glitchScreen,
  directStrike,
  goldenShield,
  banPort,
  whisper,
  type UserResponse,
  type GameProfileResponse,
  type Archetype,
} from "../lib/api";

type View =
  | "landing"
  | "dashboard"
  | "profile-edit"
  | "password"
  | "intro-foxy";

const ARCHETYPES: { key: Archetype; title: string; desc: string; accent: string }[] = [
  { key: "FOXY", title: "FOXY · Хитрость", desc: "Харизма, события, глитч экрана.", accent: "text-brand-pink" },
  { key: "OXY", title: "OXY · Стратегия", desc: "Прямой удар, визит с налогом Медведя.", accent: "text-brand-cyan" },
  { key: "BEAR", title: "BEAR · Защита", desc: "Золотой щит, блокировка порта, казна.", accent: "text-amber-300" },
  { key: "OWL", title: "OWL · Инфо", desc: "Шёпот, прослушка, сделки с данными.", accent: "text-purple-300" },
];

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [gameProfile, setGameProfile] = useState<GameProfileResponse | null>(null);
  const [view, setView] = useState<View>("landing");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState("");
  const [whisperText, setWhisperText] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    health().then(() => setApiStatus("ok")).catch(() => setApiStatus("error"));
  }, []);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("metahunt_token") : null;
    if (t) {
      setToken(t);
      getMe(t)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("metahunt_token");
          setToken(null);
        });
    }
  }, []);

  useEffect(() => {
    if (token && view !== "landing") {
      getGameProfile(token).then(setGameProfile).catch(() => setGameProfile(null));
    }
  }, [token, view]);

  useEffect(() => {
    if (!user) return;
    const pending = localStorage.getItem("metahunt_intro_foxy_pending") === "1";
    const seenKey = `metahunt_intro_foxy_seen_${user.id}`;
    const seen = localStorage.getItem(seenKey) === "1";
    if (pending && !seen) setView("intro-foxy");
  }, [user]);

  const completeFoxyIntro = () => {
    if (user) {
      localStorage.setItem(`metahunt_intro_foxy_seen_${user.id}`, "1");
    }
    localStorage.removeItem("metahunt_intro_foxy_pending");
    setView("dashboard");
  };

  const refreshGameProfile = async () => {
    if (!token) return;
    const gp = await getGameProfile(token);
    setGameProfile(gp);
  };

  const runAction = async (fn: () => Promise<{ msg: string }>) => {
    setActionMsg(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fn();
      setActionMsg(res.msg);
      await refreshGameProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    try {
      const res = await login(email, password);
      localStorage.setItem("metahunt_token", res.access_token);
      setToken(res.access_token);
      const u = await getMe(res.access_token);
      setUser(u);
      setView("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("reg_email") as string;
    const password = fd.get("reg_password") as string;
    try {
      await register({
        email,
        password,
        nickname: fd.get("nickname") as string,
      });
      const res = await login(email, password);
      localStorage.setItem("metahunt_token", res.access_token);
      setToken(res.access_token);
      const u = await getMe(res.access_token);
      setUser(u);
      localStorage.setItem("metahunt_intro_foxy_pending", "1");
      setView("intro-foxy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    localStorage.removeItem("metahunt_token");
    setToken(null);
    setUser(null);
    setGameProfile(null);
    setView("landing");
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const u = await updateProfile(token, {
        nickname: (fd.get("nickname") as string) || undefined,
        avatar: (fd.get("avatar") as string) || undefined,
      });
      setUser(u);
      setView("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await changePassword(token, {
        current_password: fd.get("current_password") as string,
        new_password: fd.get("new_password") as string,
      });
      setView("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseArchetype = async (archetype: Archetype) => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const gp = await chooseArchetype(token, archetype);
      setGameProfile(gp);
      setView("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const ArchetypeActions = () => {
    if (!gameProfile?.archetype) return null;

    return (
      <div className="cyber-card cyber-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-brand-cyan text-sm uppercase tracking-wider">Скиллы архетипа</h2>
          {actionMsg && <span className="text-xs text-brand-cyan">{actionMsg}</span>}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-text-muted uppercase tracking-wider">Target ID</label>
            <input
              value={actionTarget}
              onChange={(e) => setActionTarget(e.target.value)}
              className="cyber-input w-full px-3 py-2 rounded"
              placeholder="uuid цели"
            />
          </div>
          {gameProfile.archetype === "OWL" && (
            <div className="space-y-2">
              <label className="text-xs text-text-muted uppercase tracking-wider">Whisper</label>
              <input
                value={whisperText}
                onChange={(e) => setWhisperText(e.target.value)}
                className="cyber-input w-full px-3 py-2 rounded"
                placeholder="сообщение"
              />
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {gameProfile.archetype === "FOXY" && (
            <button
              disabled={loading || !actionTarget}
              onClick={() => runAction(() => glitchScreen(token!, actionTarget))}
              className="cyber-btn px-4 py-3 text-brand-pink border border-brand-pink/40 rounded"
            >
              Глитч экрана (15 Shards)
            </button>
          )}
          {gameProfile.archetype === "OXY" && (
            <>
              <button
                disabled={loading || !actionTarget}
                onClick={() => runAction(() => directStrike(token!, actionTarget))}
                className="cyber-btn px-4 py-3 text-brand-cyan border border-brand-cyan/40 rounded"
              >
                Прямой удар (5 Shards)
              </button>
              <button
                disabled={loading || !actionTarget}
                onClick={() => runAction(() => interact(token!, actionTarget))}
                className="cyber-btn px-4 py-3 text-text-primary border border-meta-border rounded"
              >
                Визит / налог (10 Shards)
              </button>
            </>
          )}
          {gameProfile.archetype === "BEAR" && (
            <>
              <button
                disabled={loading}
                onClick={() => runAction(() => goldenShield(token!))}
                className="cyber-btn px-4 py-3 text-amber-300 border border-amber-300/40 rounded"
              >
                Золотой щит (20 Shards)
              </button>
              <button
                disabled={loading || !actionTarget}
                onClick={() => runAction(() => banPort(token!, actionTarget))}
                className="cyber-btn px-4 py-3 text-brand-pink border border-brand-pink/40 rounded"
              >
                Бан порта (30 Shards)
              </button>
            </>
          )}
          {gameProfile.archetype === "OWL" && (
            <button
              disabled={loading || !actionTarget || !whisperText}
              onClick={() => runAction(() => whisper(token!, actionTarget, whisperText))}
              className="cyber-btn px-4 py-3 text-purple-300 border border-purple-300/40 rounded"
            >
              Шёпот (20 Shards)
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen text-text-primary pb-24">
      {/* Scanlines overlay */}
      <div className="scanlines" aria-hidden />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 cyber-border-b border-meta-border bg-meta-bg/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-lg tracking-widest neon-text-cyan">
              METAHUNT
            </span>
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                apiStatus === "ok"
                  ? "bg-state-success animate-pulse"
                  : apiStatus === "error"
                    ? "bg-state-danger"
                    : "bg-state-warning"
              }`}
              title={`API: ${apiStatus}`}
            />
          </div>
          {token && user && (
            <nav className="flex items-center gap-2">
              {user.role === "ADMIN" && (
                <a
                  href="/admin"
                  className="cyber-btn px-4 py-2 text-sm text-brand-pink hover:bg-brand-pink/10 cyber-border rounded"
                >
                  ADMIN
                </a>
              )}
              <a
                href="/chat"
                className="cyber-btn px-4 py-2 text-sm text-brand-cyan hover:bg-brand-cyan/10 cyber-border rounded"
              >
                ЧАТ
              </a>
              <button
                onClick={() => setView("dashboard")}
                className="cyber-btn px-4 py-2 text-sm text-brand-cyan hover:bg-brand-cyan/10 cyber-border rounded"
              >
                DASHBOARD
              </button>
              <button
                onClick={() => setView("profile-edit")}
                className="cyber-btn px-4 py-2 text-sm text-text-muted hover:text-brand-cyan rounded"
              >
                PROFILE
              </button>
              <button
                onClick={() => setView("password")}
                className="cyber-btn px-4 py-2 text-sm text-text-muted hover:text-brand-cyan rounded"
              >
                PASSWORD
              </button>
              <button
                onClick={handleLogout}
                className="cyber-btn px-4 py-2 text-sm text-brand-pink hover:bg-brand-pink/10 border border-brand-pink/50 rounded"
              >
                LOGOUT
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="pt-20 px-4 max-w-full mx-auto">
        {error && (
          <div className="cyber-border-pink bg-brand-pink/10 text-brand-pink px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {view === "landing" && (
          <section className="flex flex-col items-center text-center py-16">
            <FoxyProtocolHero className="mb-10" />
            <h1 className="font-display text-3xl mt-2 tracking-[0.2em] neon-text-cyan">
              ВХОД В СИСТЕМУ
            </h1>
            <p className="text-text-muted text-sm mt-2 mb-8">
              Охоться. Следи. Доминируй.
            </p>

            <div className="w-full max-w-sm cyber-card cyber-border rounded-lg p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                    EMAIL
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="cyber-input w-full px-4 py-3 rounded"
                    placeholder="user@domain.net"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                    ПАРОЛЬ
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="cyber-input w-full px-4 py-3 rounded"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cyber-btn glitch-hover w-full py-3 bg-brand-cyan/20 text-brand-cyan cyber-border rounded hover:bg-brand-cyan/30"
                >
                  {loading ? "..." : "ВОЙТИ"}
                </button>
              </form>
              <p className="text-text-dim text-xs mt-4 text-center">или</p>
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                    NICKNAME
                  </label>
                  <input
                    name="nickname"
                    type="text"
                    required
                    minLength={3}
                    className="cyber-input w-full px-4 py-3 rounded"
                    placeholder="hunter_01"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                    EMAIL
                  </label>
                  <input
                    name="reg_email"
                    type="email"
                    required
                    className="cyber-input w-full px-4 py-3 rounded"
                    placeholder="user@domain.net"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                    ПАРОЛЬ (мин. 8)
                  </label>
                  <input
                    name="reg_password"
                    type="password"
                    required
                    minLength={8}
                    className="cyber-input w-full px-4 py-3 rounded"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cyber-btn glitch-hover w-full py-3 bg-brand-pink/20 text-brand-pink border border-brand-pink/50 rounded hover:bg-brand-pink/30"
                >
                  {loading ? "..." : "РЕГИСТРАЦИЯ"}
                </button>
              </form>
            </div>
            <button
              onClick={() => window.open(`${API_URL}/api/docs`, "_blank")}
              className="mt-8 text-text-dim text-xs hover:text-brand-cyan transition"
            >
              API DOCS →
            </button>
          </section>
        )}

        {view === "intro-foxy" && user && (
          <section className="py-10 flex flex-col items-center gap-6">
            <FoxyProtocolComic onComplete={completeFoxyIntro} />

            <div className="w-full max-w-4xl">
              <FoxyGlitchTerminal
                title="FOXY / DIRECT"
                lines={[
                  "Foxy: Новый пользователь? Интересно…",
                  "Если ты читаешь это — значит сеть уже нашла тебя.",
                  "TRUST = FALSE",
                  "SURVIVAL = TRUE",
                  `// user: ${user?.nickname || "unknown"}`,
                ]}
              />
            </div>

            <button
              type="button"
              onClick={completeFoxyIntro}
              className="cyber-btn px-4 py-2 text-sm rounded border border-meta-border text-text-muted hover:text-brand-cyan hover:border-brand-cyan/40"
            >
              SKIP
            </button>
          </section>
        )}

        {view === "dashboard" && user && (
          <section className="py-8 space-y-6">
            <h1 className="font-display text-2xl tracking-widest neon-text-cyan">
              ПАНЕЛЬ УПРАВЛЕНИЯ
            </h1>

            <div className="cyber-card cyber-border rounded-lg p-6">
              <h2 className="text-brand-cyan text-sm uppercase tracking-wider mb-4">
                Профиль
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-text-dim">ID:</span> {user.id}</p>
                <p><span className="text-text-dim">Email:</span> {user.email}</p>
                <p><span className="text-text-dim">Nick:</span> {user.nickname}</p>
                <p><span className="text-text-dim">Role:</span> {user.role}</p>
              </div>
              <button
                onClick={() => setView("profile-edit")}
                className="mt-4 cyber-btn px-4 py-2 text-brand-cyan cyber-border rounded text-sm"
              >
                РЕДАКТИРОВАТЬ
              </button>
            </div>

            {gameProfile && (
              <div className="cyber-card cyber-border-pink rounded-lg p-6 space-y-3">
                <h2 className="text-brand-pink text-sm uppercase tracking-wider">
                  Игровой профиль
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><span className="text-text-dim">Архетип:</span> {gameProfile.archetype ?? "—"}</p>
                  <p><span className="text-text-dim">Уровень:</span> {gameProfile.level}</p>
                  <p><span className="text-text-dim">XP:</span> {gameProfile.xp} / {gameProfile.xp_to_next}</p>
                  <p><span className="text-text-dim">Репутация:</span> {gameProfile.reputation}</p>
                  <p><span className="text-text-dim">Сезон:</span> {gameProfile.season_points}</p>
                  <p><span className="text-text-dim">Shards:</span> {gameProfile.shards}</p>
                  <p><span className="text-text-dim">Энергия:</span> {gameProfile.energy}</p>
                </div>
                {gameProfile.stats && (
                  <div className="pt-3 border-t border-meta-border">
                    <p className="text-text-dim text-xs mb-2">Характеристики</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(gameProfile.stats).map(([k, v]) => (
                        <span key={k} className="px-2 py-1 bg-meta-surface rounded text-xs">
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gameProfile?.archetype == null && (
              <div className="cyber-card cyber-border rounded-lg p-6 space-y-4">
                <h2 className="text-brand-cyan text-sm uppercase tracking-wider">
                  Выбери архетип
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ARCHETYPES.map((a) => (
                    <button
                      key={a.key}
                      onClick={() => handleChooseArchetype(a.key)}
                      disabled={loading}
                      className="cyber-btn text-left p-4 cyber-border rounded hover:bg-meta-surface/60"
                    >
                      <div className={`text-sm font-semibold ${a.accent}`}>{a.title}</div>
                      <div className="text-text-muted text-xs mt-1">{a.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ArchetypeActions />
          </section>
        )}

        {view === "profile-edit" && user && (
          <section className="py-8">
            <h1 className="font-display text-2xl tracking-widest neon-text-cyan mb-6">
              РЕДАКТИРОВАТЬ ПРОФИЛЬ
            </h1>
            <form
              onSubmit={handleUpdateProfile}
              className="cyber-card cyber-border rounded-lg p-6 space-y-4"
            >
              <div>
                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                  NICKNAME
                </label>
                <input
                  name="nickname"
                  defaultValue={user.nickname}
                  className="cyber-input w-full px-4 py-3 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                  AVATAR URL
                </label>
                <input
                  name="avatar"
                  defaultValue={user.avatar ?? ""}
                  className="cyber-input w-full px-4 py-3 rounded"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="cyber-btn flex-1 py-3 bg-brand-cyan/20 text-brand-cyan cyber-border rounded"
                >
                  {loading ? "..." : "СОХРАНИТЬ"}
                </button>
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="cyber-btn px-6 py-3 border border-meta-border rounded text-text-muted hover:text-text-primary"
                >
                  ОТМЕНА
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "password" && (
          <section className="py-8">
            <h1 className="font-display text-2xl tracking-widest neon-text-cyan mb-6">
              СМЕНА ПАРОЛЯ
            </h1>
            <form
              onSubmit={handleChangePassword}
              className="cyber-card cyber-border rounded-lg p-6 space-y-4"
            >
              <div>
                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                  ТЕКУЩИЙ ПАРОЛЬ
                </label>
                <input
                  name="current_password"
                  type="password"
                  required
                  className="cyber-input w-full px-4 py-3 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1 uppercase tracking-wider">
                  НОВЫЙ ПАРОЛЬ
                </label>
                <input
                  name="new_password"
                  type="password"
                  required
                  minLength={8}
                  className="cyber-input w-full px-4 py-3 rounded"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="cyber-btn flex-1 py-3 bg-brand-cyan/20 text-brand-cyan cyber-border rounded"
                >
                  {loading ? "..." : "СМЕНИТЬ"}
                </button>
                <button
                  type="button"
                  onClick={() => setView("dashboard")}
                  className="cyber-btn px-6 py-3 border border-meta-border rounded text-text-muted"
                >
                  ОТМЕНА
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-text-dim text-xs border-t border-meta-border bg-meta-bg/90">
        © 2026 METAHUNT — DIGITAL DOMINANCE
      </footer>
    </main>
  );
}
