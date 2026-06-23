"use client";

import { useEffect, useState } from "react";

// Inclusive sharing: native share sheet where supported (mobile → WhatsApp,
// Messages, etc.), plus explicit per-platform buttons that work everywhere
// (desktop included), an Instagram-Story image download, and copy-link.
export function ShareBar({
  path,
  text,
  cardUrl,
  storyUrl,
}: {
  path: string; // app-relative share URL, e.g. /soulmate/share?...
  text: string;
  cardUrl: string; // landscape card (download)
  storyUrl: string; // 9:16 story card (Instagram)
}) {
  const [origin, setOrigin] = useState("");
  const [native, setNative] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setNative(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const url = origin + path;
  const full = `${text} ${url}`;
  const e = encodeURIComponent;

  const links = [
    { label: "WhatsApp", bg: "#25D366", fg: "#072b15", href: `https://wa.me/?text=${e(full)}` },
    { label: "X", bg: "#000", fg: "#fff", href: `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}` },
    { label: "Telegram", bg: "#229ED9", fg: "#fff", href: `https://t.me/share/url?url=${e(url)}&text=${e(text)}` },
    { label: "Facebook", bg: "#1877F2", fg: "#fff", href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
    { label: "Reddit", bg: "#FF4500", fg: "#fff", href: `https://www.reddit.com/submit?url=${e(url)}&title=${e(text)}` },
  ];

  async function nativeShare() {
    try {
      await navigator.share({ title: "My World Cup Fan ID", text, url });
    } catch {
      /* cancelled */
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="card p-4 mt-6">
      <div className="text-center text-sm font-bold mb-3">📣 Share your Fan ID</div>

      {native && (
        <button
          onClick={nativeShare}
          className="w-full py-3 rounded-xl bg-emerald text-black font-bold text-sm hover:brightness-110 transition mb-3"
        >
          Share… (Messages, WhatsApp & more)
        </button>
      )}

      <div className="flex flex-wrap gap-2 justify-center">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg text-xs font-bold transition hover:brightness-110"
            style={{ background: l.bg, color: l.fg }}
          >
            {l.label}
          </a>
        ))}
        <button
          onClick={copy}
          className="px-3.5 py-2 rounded-lg text-xs font-bold border border-line hover:border-white/40 transition"
        >
          {copied ? "Copied! ✓" : "Copy link"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-line/60">
        <a
          href={storyUrl}
          download="my-fan-id-story.png"
          className="px-3.5 py-2 rounded-lg text-xs font-bold transition hover:brightness-110"
          style={{ background: "linear-gradient(90deg,#f5c542,#fb5d7a,#a78bfa)", color: "#0a0a0a" }}
        >
          📸 Instagram Story
        </a>
        <a
          href={cardUrl}
          download="my-fan-id.png"
          className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-emerald/40 text-emerald hover:bg-emerald/10 transition"
        >
          ⬇ Download card
        </a>
      </div>
      <p className="text-[11px] text-mute text-center mt-3">
        Instagram has no share link — download the Story image and post it (add a link sticker to{" "}
        <span className="text-white">/soulmate</span>).
      </p>
    </div>
  );
}
