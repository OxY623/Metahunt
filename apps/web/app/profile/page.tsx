"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "../../widgets/site/SiteHeader";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import LoadingScreen from "../../shared/ui/LoadingScreen";
import { useSession } from "../../shared/model/session";
import { ProfileForm } from "../../features/profile/ui/ProfileForm";

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, loading } = useSession();

  useEffect(() => {
    if (!loading && !token) router.replace("/");
  }, [token, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }
  if (!token || !user) {
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
      <div className="page-shell page-shell--narrow pt-10 space-y-6">
        <SectionHeading as="h1">Редактировать профиль</SectionHeading>
        <ProfileForm token={token} user={user} />
      </div>
    </main>
  );
}

