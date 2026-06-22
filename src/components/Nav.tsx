"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Forecast" },
  { href: "/live", label: "Live", live: true },
  { href: "/groups", label: "Groups" },
  { href: "/bracket", label: "Bracket" },
  { href: "/predictor", label: "Predictor" },
  { href: "/teams", label: "Teams" },
  { href: "/oracle", label: "Ask the Oracle" },
];

export function Nav({
  dataThrough,
  matchesPlayed,
}: {
  dataThrough: string;
  matchesPlayed: number;
}) {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl leading-none">🔮</span>
          <span className="font-extrabold tracking-tight text-lg wordmark">
            ORACLE&apos;26
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-white bg-white/8"
                    : "text-mute hover:text-white hover:bg-white/5"
                }`}
              >
                {l.live && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose animate-pulse mr-1.5 align-middle" />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 text-xs text-mute">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald/30 bg-emerald/10 text-emerald font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            LIVE · {matchesPlayed} played
          </span>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-3 pb-2 overflow-x-auto">
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                active ? "text-white bg-white/8" : "text-mute"
              }`}
            >
              {l.live && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose animate-pulse mr-1 align-middle" />
              )}
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
