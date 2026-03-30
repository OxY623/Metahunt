"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/legal/privacy", label: "Защита данных" },
  { href: "/legal/terms", label: "Соглашение" },
  { href: "/", label: "Главная" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Чат" },
  { href: "/profile", label: "Профиль" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-16">

      {/* 🔲 LINE GLOW */}
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

      {/* 🌫 BACKGROUND */}
      <div className="bg-black/60 backdrop-blur-xl border-t border-white/10 opacity-[0.9]">

        <div className="max-w-6xl mx-auto px-4 py-6">

          {/* 🧠 TOP ROW */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* 🧬 BRAND */}
            <div className="text-xs text-white/50 font-mono tracking-widest">
              © 2026 METAHUNT
              <span className="text-cyan-400 ml-2">SYSTEM ACTIVE</span>
            </div>

            {/* 🔗 LINKS */}
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="
                    relative
                    text-white/60
                    hover:text-cyan-400
                    transition
                    after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0
                    after:bg-cyan-400
                    hover:after:w-full
                    after:transition-all
                  "
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* 🛰 STATUS */}
            <div className="text-xs font-mono text-purple-400">
              TRUST = FALSE
            </div>
          </div>

          {/* ⚡ BOTTOM ROW */}
          <div className="mt-4 text-center text-[10px] text-white/30 font-mono">
            ADMIN WATCHING • ALL ACTIONS LOGGED
          </div>
        </div>
      </div>
    </footer>
  );
}



// import Link from "next/link";

// const FOOTER_LINKS = [
//   { href: "/legal/privacy", label: "Защита персональных данных" },
//   { href: "/legal/terms", label: "Пользовательское соглашение" },
//   { href: "/", label: "Главная" },
//   { href: "/dashboard", label: "Dashboard" },
//   { href: "/chat", label: "Чат" },
//   { href: "/profile", label: "Профиль" },
// ];

// export function SiteFooter() {
//   return (
//     <footer className="mt-12 py-6 text-center text-text-dim text-xs border-t border-meta-border bg-meta-bg/90">
//       <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4">
//         <span>© 2026 METAHUNT — DIGITAL DOMINANCE</span>
//         {FOOTER_LINKS.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className="hover:text-brand-cyan"
//           >
//             {link.label}
//           </Link>
//         ))}
//       </div>
//     </footer>
//   );
// }
