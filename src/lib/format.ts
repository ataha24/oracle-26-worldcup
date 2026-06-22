import type { Confederation } from "@/lib/types";

export function pct(x: number, digits = 0): string {
  if (x > 0 && x < 0.001) return "<0.1%";
  if (x < 1 && x > 0.999) return ">99.9%";
  return `${(x * 100).toFixed(digits)}%`;
}

/** American-style odds string from a probability, for flavour */
export function americanOdds(p: number): string {
  if (p <= 0) return "—";
  if (p >= 1) return "—";
  if (p >= 0.5) return `-${Math.round((p / (1 - p)) * 100)}`;
  return `+${Math.round(((1 - p) / p) * 100)}`;
}

/** decimal odds from probability */
export function decimalOdds(p: number): string {
  if (p <= 0) return "—";
  return (1 / p).toFixed(p < 0.05 ? 0 : 2);
}

export const CONF_META: Record<
  Confederation,
  { label: string; color: string; region: string }
> = {
  UEFA: { label: "UEFA", color: "#38bdf8", region: "Europe" },
  CONMEBOL: { label: "CONMEBOL", color: "#fbbf24", region: "South America" },
  CONCACAF: { label: "CONCACAF", color: "#34d399", region: "N/C America" },
  CAF: { label: "CAF", color: "#f472b6", region: "Africa" },
  AFC: { label: "AFC", color: "#a78bfa", region: "Asia" },
  OFC: { label: "OFC", color: "#fb923c", region: "Oceania" },
};

/** heat colour for a 0..1 probability — used in odds tables */
export function heat(p: number): string {
  if (p <= 0) return "transparent";
  // emerald → amber → rose as probability rises (for "danger"/strength reads)
  const stops = [
    [16, 32, 45], // low
    [6, 78, 59], // emerald-ish
    [251, 191, 36], // amber
    [244, 63, 94], // rose
  ];
  const t = Math.max(0, Math.min(1, p));
  const seg = t * (stops.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}
