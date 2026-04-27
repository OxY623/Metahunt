"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "metahunt-cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(CONSENT_KEY);
    setVisible(stored !== "accepted");
  }, []);

  const handleAccept = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleCloseTab = () => {
    if (typeof window === "undefined") return;
    setClosing(true);
    try {
      window.open("", "_self");
      window.close();
    } catch (_) {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-text-primary">
            Этот сайт использует файлы cookie для улучшения работы и аналитики.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleAccept}
              className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]"
            >
              Принять
            </button>
            <button
              type="button"
              onClick={handleCloseTab}
              className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white"
            >
              Закрыть вкладку
            </button>
          </div>
        </div>
        {closing && (
          <div className="mt-2 text-xs text-white/70">
            Если вкладка не закрылась, закройте ее вручную.
          </div>
        )}
      </div>
    </div>
  );
}
