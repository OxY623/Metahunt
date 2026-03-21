"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { useSession } from "../../shared/model/session";
import { PasswordForm } from "../../features/profile/ui/PasswordForm";

export default function PasswordPage() {
  const router = useRouter();
  const { token, loading } = useSession();

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center text-text-muted">
        {" "}
        <p>Перенаправление...</p>{" "}
      </main>
    );
  }
  return (
    <main className="min-h-screen pb-16">
      <SiteHeader />
      <div className="pt-10 px-4 max-w-4xl mx-auto space-y-6">
        <SectionHeading as="h1">Смена пароля</SectionHeading>
        <PasswordForm token={token} />
      </div>
    </main>
  );
}
