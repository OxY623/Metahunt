"use client";

import { usePathname } from "next/navigation";
import { UserDrawer } from "./UserDrawer";
import { SiteFooter } from "./SiteFooter";

const HIDE_FOOTER = new Set(["/chat"]);

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFooter = !HIDE_FOOTER.has(pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="scanlines" aria-hidden />
      <div className="flex-1">{children}</div>
      <UserDrawer />
      {showFooter && <SiteFooter />}
    </div>
  );
}
