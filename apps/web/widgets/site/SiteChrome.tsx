"use client";

import { usePathname } from "next/navigation";
import { UserDrawer } from "./UserDrawer";
import { SiteFooter } from "./SiteFooter";
import { useSession } from "../../shared/model/session";
import { useGameProfile } from "../../shared/model/game-profile";

const HIDE_FOOTER = new Set(["/chat"]);

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = !HIDE_FOOTER.has(pathname);
  const { token } = useSession();
  const { profile } = useGameProfile(token, Boolean(token));

  return (
    <div
      className="min-h-screen flex flex-col"
      data-archetype={profile?.archetype ?? undefined}
    >
      <div className="scanlines" aria-hidden />
      <div className="flex-1">{children}</div>
      <UserDrawer />
      {showFooter && <SiteFooter />}
    </div>
  );
}
