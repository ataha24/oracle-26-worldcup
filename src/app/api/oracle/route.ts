import { generateText, stepCountIs } from "ai";
import { oracleTools, TEAM_NAME_LIST } from "@/lib/oracle/tools";
import { answer } from "@/lib/oracle/answer";
import { FORECAST } from "@/lib/forecast";

export const maxDuration = 30;

const MODEL = process.env.ORACLE_MODEL ?? "anthropic/claude-haiku-4.5";

// The model string routes through the Vercel AI Gateway, which authenticates
// via OIDC on Vercel (auto-injected VERCEL_OIDC_TOKEN) or an AI_GATEWAY_API_KEY
// locally. We only enable the LLM path when one of those is present.
function hasCredentials(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

const SYSTEM = `You are ORACLE '26, a witty, sharp World Cup 2026 analyst.

You are backed by a Monte-Carlo simulation engine that ran ${FORECAST.iterations.toLocaleString()} full simulations of the rest of the tournament from the live state (real results are locked in through ${FORECAST.dataThrough}). The 2026 World Cup is hosted by Canada, Mexico and the USA, with 48 teams in 12 groups; the top 2 of each group plus the 8 best third-placed teams reach a Round of 32.

RULES:
- For ANY number (probabilities, odds, scores, standings), you MUST call a tool. Never invent or estimate figures.
- Be concise and lively — a couple of short paragraphs at most. Lead with the answer.
- Use the team's name; you may add a relevant flag emoji.
- If a question is vague, make a reasonable interpretation and answer it.
- If asked about something the engine can't model (e.g. an individual player's Golden Boot odds), say so briefly, then give the closest insight the tools support.

Valid team names: ${TEAM_NAME_LIST}.`;

export async function POST(req: Request) {
  let question = "";
  try {
    const body = await req.json();
    question = (body?.question ?? "").toString().slice(0, 500);
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  if (!question.trim()) return Response.json({ error: "empty" }, { status: 400 });

  // No model credentials → fall back to the deterministic engine answer.
  if (!hasCredentials()) {
    return Response.json({ mode: "engine", answer: answer(question) });
  }

  try {
    const { text } = await generateText({
      model: MODEL,
      system: SYSTEM,
      prompt: question,
      tools: oracleTools,
      stopWhen: stepCountIs(6),
      temperature: 0.5,
    });
    if (!text.trim()) {
      return Response.json({ mode: "engine", answer: answer(question) });
    }
    return Response.json({ mode: "ai", text });
  } catch (err) {
    console.error("Oracle LLM error:", err);
    // graceful degradation — still answer from the engine
    return Response.json({ mode: "engine", answer: answer(question) });
  }
}
