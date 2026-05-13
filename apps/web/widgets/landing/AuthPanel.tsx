"use client";

import { useMemo, useState } from "react";
import { LoginForm } from "../../features/auth/ui/LoginForm";
import { RegisterForm } from "../../features/auth/ui/RegisterForm";
import { Panel } from "../../shared/ui/Panel";

type Mode = "login" | "register";

const MODE_COPY: Record<Mode, { title: string; hint: string; points: string[] }> = {
  login: {
    title: "Быстрый вход в сеть",
    hint: "Продолжи с текущим профилем и сразу возвращайся к охоте.",
    points: [
      "Мгновенный доступ к Dashboard и чату",
      "Сохраненные настройки интерфейса подхватятся автоматически",
      "Вход защищен серверной авторизацией",
    ],
  },
  register: {
    title: "Создание нового агента",
    hint: "Запусти новый профиль и пройди интро-инициализацию архетипа.",
    points: [
      "Новый никнейм и чистый прогресс",
      "Автоматический вход после регистрации",
      "Переход в интро-режим с выбором роли",
    ],
  },
};

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const copy = useMemo(() => MODE_COPY[mode], [mode]);

  return (
    <Panel className="w-full max-w-xl space-y-6 reveal-fade">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.32em] text-text-dim">
          ADMIN / HANDSHAKE
        </div>
        <div className="text-sm text-text-muted">
          Управляй входом как в контрольной панели: понятные режимы, быстрый путь в игру.
        </div>
      </div>

      <div
        className="auth-switch"
        role="tablist"
        aria-label="Режим авторизации"
      >
        <button
          id="auth-tab-login"
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          aria-controls="auth-panel-login"
          onClick={() => setMode("login")}
          className={`auth-switch__tab ${mode === "login" ? "auth-switch__tab--active" : ""}`}
        >
          Войти
        </button>
        <button
          id="auth-tab-register"
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          aria-controls="auth-panel-register"
          onClick={() => setMode("register")}
          className={`auth-switch__tab ${mode === "register" ? "auth-switch__tab--active" : ""}`}
        >
          Регистрация
        </button>
      </div>

      <div className="rounded-xl border border-meta-border/80 bg-meta-bg/40 px-4 py-4 space-y-3">
        <div className="text-xs uppercase tracking-[0.22em] text-text-dim">{copy.title}</div>
        <p className="text-sm text-text-muted">{copy.hint}</p>
        <ul className="space-y-2 text-xs text-text-muted">
          {copy.points.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-cyan" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        id="auth-panel-login"
        role="tabpanel"
        aria-labelledby="auth-tab-login"
        hidden={mode !== "login"}
        className="pt-1"
      >
        {mode === "login" && <LoginForm />}
      </div>

      <div
        id="auth-panel-register"
        role="tabpanel"
        aria-labelledby="auth-tab-register"
        hidden={mode !== "register"}
        className="pt-1"
      >
        {mode === "register" && <RegisterForm />}
      </div>

      <div className="text-[11px] uppercase tracking-[0.2em] text-text-dim border-t border-meta-border pt-3">
        Security Layer Active • Transport encrypted • Session scoped
      </div>
    </Panel>
  );
}