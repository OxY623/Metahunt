"use client";

import { useState } from "react";
import { LoginForm } from "../../features/auth/ui/LoginForm";
import { RegisterForm } from "../../features/auth/ui/RegisterForm";
import { Panel } from "../../shared/ui/Panel";
import { Button } from "../../shared/ui/Button";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register" | null>(null);

  return (
    <Panel className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.32em] text-text-dim">
          ADMIN / HANDSHAKE
        </div>
        <div className="text-sm text-text-muted">
          Авторизуйся, чтобы подключиться к сети и выбрать архетип.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="cyan"
          size="lg"
          className="w-full"
          onClick={() => setMode((prev) => (prev === "login" ? null : "login"))}
        >
          Войти
        </Button>
        <Button
          variant="pink"
          size="lg"
          className="w-full"
          onClick={() =>
            setMode((prev) => (prev === "register" ? null : "register"))
          }
        >
          Регистрация
        </Button>
      </div>

      {mode === "login" && (
        <div className="pt-4 border-t border-meta-border">
          <LoginForm />
        </div>
      )}

      {mode === "register" && (
        <div className="pt-4 border-t border-meta-border">
          <RegisterForm />
        </div>
      )}
    </Panel>
  );
}
