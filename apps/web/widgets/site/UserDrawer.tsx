/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../../lib/api";
import { useSession } from "../../shared/model/session";
import { useGameProfile } from "../../shared/model/game-profile";
import { UserAvatar } from "../../entities/user/ui/UserAvatar";
import { ARCHETYPE_LABELS } from "../../entities/user/lib/archetypes";
import { Button } from "../../shared/ui/Button";
import { Badge } from "../../shared/ui/Badge";
import { AudioController } from "./AudioController";

export function UserDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, clear } = useSession();
  const { profile } = useGameProfile(token, Boolean(token));
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (event: MouseEvent) => {
      if (!open) return;
      const target = event.target as Node | null;
      if (target && drawerRef.current && !drawerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const handleLogout = async () => {
    try {
      await logout();
    // eslint-disable-next-line no-empty
    } catch (_) {}
    clear();
    router.push("/");
  };

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/password", label: "Password" },
    { href: "/chat", label: "Chat" },
  ];

  if (!token || !user) return null;

  return (
    <div className="fixed right-4 top-20 z-[60]">
      <Button
        variant="neutral"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        className="shadow-[0_0_16px_rgba(0,240,255,0.2)]"
      >
        USER MENU
      </Button>

      <div
        ref={drawerRef}
        className={[
          "fixed top-0 right-0 h-full w-[280px] max-w-[85vw] bg-meta-bg/95 backdrop-blur",
          "border-l border-meta-border shadow-[0_0_20px_rgba(0,240,255,0.18)]",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <UserAvatar archetype={profile?.archetype ?? null} size={56} />
            <div>
              <div className="text-sm uppercase tracking-wider text-text-primary">
                {user.nickname}
              </div>
              <div className="text-xs text-text-dim">{user.email}</div>
            </div>
          </div>
          {profile?.archetype && (
            <Badge tone="cyan">{ARCHETYPE_LABELS[profile.archetype]}</Badge>
          )}
          <div className="space-y-2">
            {nav.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "cyan" : "neutral"}
                size="md"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
              >
                {item.label}
              </Button>
            ))}
            {user.role === "ADMIN" && (
              <Button
                variant="pink"
                size="md"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  router.push("/admin");
                }}
              >
                Admin Panel
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Button
              variant="warning"
              size="md"
              className="w-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>{" "}
          <AudioController />
        </div>
      </div>
    </div>
  );
}
