"use client";

import { useRef, useState, useEffect } from "react";
import { answer, type OracleAnswer } from "@/lib/oracle/answer";
import { getTeam } from "@/lib/data/teams";
import { SectionTitle } from "@/components/bits";

interface Msg {
  id: number;
  q: string;
  a?: OracleAnswer; // engine card
  text?: string; // AI prose
}

const SUGGESTIONS = [
  "Who will win the World Cup?",
  "Brazil vs Spain",
  "How far will the USA go?",
  "Show me Group I",
  "Who are the dark horses?",
  "Tell me about Morocco",
  "Argentina vs France",
  "Golden Boot?",
];

export default function OraclePage() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || thinking) return;
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        data?.mode === "ai"
          ? { id: idRef.current++, q: question, text: data.text }
          : { id: idRef.current++, q: question, a: data?.answer ?? answer(question) },
      ]);
    } catch {
      // ultimate fallback: compute the answer in the browser
      setMsgs((m) => [...m, { id: idRef.current++, q: question, a: answer(question) }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <SectionTitle
        kicker="Ask the Oracle"
        title="🔮 Pose any question"
        desc="The Oracle answers from the live engine — title odds, matchups, group projections, dark horses and more. Every number is computed, never guessed."
      />

      {msgs.length === 0 && !thinking && (
        <div className="card p-6 text-center mb-5">
          <div className="text-4xl mb-3">🔮</div>
          <p className="text-mute">
            The Oracle has run 50,000 simulations of the rest of the tournament. Ask it
            anything — start with a suggestion below.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {msgs.map((m) => (
          <div key={m.id} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-emerald/15 border border-emerald/30 rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[85%]">
                {m.q}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-2xl shrink-0">🔮</div>
              {m.text !== undefined ? <ProseCard text={m.text} /> : <AnswerCard a={m.a!} />}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex gap-2">
            <div className="text-2xl">🔮</div>
            <div className="card px-4 py-3 text-mute text-sm flex items-center gap-1">
              consulting the simulations
              <span className="inline-flex gap-0.5 ml-1">
                <Dot d={0} /> <Dot d={150} /> <Dot d={300} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* suggestions */}
      <div className="flex flex-wrap gap-2 mt-6">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-emerald/50 hover:text-emerald text-mute transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="sticky bottom-4 mt-4"
      >
        <div className="card flex items-center gap-2 p-2 pl-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the 2026 World Cup…"
            className="flex-1 bg-transparent text-sm focus:outline-none py-2"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2 rounded-lg bg-emerald text-black font-semibold text-sm disabled:opacity-40 hover:brightness-110 transition"
          >
            Ask
          </button>
        </div>
      </form>

      <p className="text-[11px] text-mute mt-3 text-center">
        Runs entirely on the deterministic forecast engine — instant, offline, reproducible.
      </p>
    </div>
  );
}

function ProseCard({ text }: { text: string }) {
  // light markdown: paragraphs, **bold**, and - bullet lines
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="card p-4 flex-1 rise space-y-2 text-sm leading-relaxed">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {lines.map((l, j) => (
                <li key={j}>{fmt(l.replace(/^\s*[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{fmt(b)}</p>;
      })}
    </div>
  );
}

function fmt(s: string): React.ReactNode {
  // bold **...**
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-white font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function AnswerCard({ a }: { a: OracleAnswer }) {
  return (
    <div className="card p-4 flex-1 rise">
      <div className="font-bold mb-1">{a.headline}</div>
      {a.body && <p className="text-sm text-mute mb-3">{a.body}</p>}
      {a.rows && (
        <div className="space-y-1.5">
          {a.rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {r.teamId && <span className="text-base">{getTeam(r.teamId).flag}</span>}
              <span className="w-40 truncate">{r.label}</span>
              <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                {r.bar !== undefined && (
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((r.bar ?? 0) * 100, r.bar ? 2 : 0)}%`,
                      background: r.color ?? "var(--color-emerald)",
                    }}
                  />
                )}
              </div>
              <span className="w-20 text-right tabular font-semibold">{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {a.note && <div className="text-[11px] text-mute mt-3">{a.note}</div>}
    </div>
  );
}

function Dot({ d }: { d: number }) {
  return (
    <span
      className="w-1 h-1 rounded-full bg-emerald inline-block animate-bounce"
      style={{ animationDelay: `${d}ms` }}
    />
  );
}
