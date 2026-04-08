"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminProtocolComic from "../../widgets/foxy/AdminProtocolComic";
import AdminGlitchTerminal from "../../widgets/foxy/AdminGlitchTerminal";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Button } from "../../shared/ui/Button";
import { useSession } from "../../shared/model/session";
import {
  isIntroPending,
  hasSeenIntro,
  markIntroSeen,
} from "../../shared/model/intro";
import LoadingScreen from "../../shared/ui/LoadingScreen";

export default function IntroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading } = useSession();
  const forceIntro = searchParams.get("force") === "1";

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/");
      return;
    }
    if (!forceIntro && user && (!isIntroPending() || hasSeenIntro(user.id))) {
      router.replace("/dashboard");
    }
  }, [token, user, loading, router, forceIntro]);

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

  const handleComplete = () => {
    markIntroSeen(user.id);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen pb-16">
      <div className="page-shell pt-10 space-y-6">
        <SectionHeading as="h1">Протокол Admin</SectionHeading>
        <AdminProtocolComic onComplete={handleComplete} />

        <div className="w-full max-w-4xl mx-auto">
          <AdminGlitchTerminal
            title="ADMIN / DIRECT"
            lines={[
              "Admin: Новый пользователь найден.",
              "Если ты читаешь это — значит сеть уже нашла тебя.",
              "TRUST = FALSE",
              "SURVIVAL = TRUE",
              `// user: ${user.nickname || "unknown"}`,
            ]}
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="neutral" size="sm" onClick={() => router.push("/codex")}>
            Кодекс / Правила
          </Button>
          <Button variant="neutral" size="sm" onClick={handleComplete}>
            Пропустить
          </Button>
        </div>
      </div>
    </main>
  );
}



