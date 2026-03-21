"use client";

import { useState } from "react";
import { LoginForm } from "../../features/auth/ui/LoginForm";
import { RegisterForm } from "../../features/auth/ui/RegisterForm";
import { Panel } from "../../shared/ui/Panel";
import { Button } from "../../shared/ui/Button";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register" | null>(null);

  return (
    <Panel className="w-full max-w-md">
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
        <div className="mt-6">
          <LoginForm />
        </div>
      )}

      {mode === "register" && (
        <div className="mt-6">
          <RegisterForm />
        </div>
      )}
    </Panel>
  );
}
