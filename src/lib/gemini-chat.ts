import "server-only";

/**
 * Thin wrapper around the Gemini REST API (`generateContent`).
 *
 * Required env vars:
 *   GEMINI_API_KEY   — Free key from https://aistudio.google.com/apikey
 *
 * Optional env vars:
 *   GEMINI_MODEL     — Model id. Defaults to "gemini-2.5-flash".
 *                      Other free-tier options: "gemini-2.0-flash",
 *                      "gemini-2.5-flash-lite". Set to a Gemini 3 model id
 *                      (e.g. "gemini-3-flash-latest") once available on your key.
 *   GEMINI_API_BASE  — Override the API base if proxying. Defaults to the
 *                      official Google endpoint.
 *
 * No SDK is added — this uses plain `fetch` so the dependency footprint stays
 * small. The API key is read on the server only and never exposed to the client.
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GeminiChatOptions {
  systemInstruction?: string;
  /** Lower = more focused; higher = more creative. */
  temperature?: number;
  /** Hard cap on tokens in the reply. Cheaper + snappier UX with a cap. */
  maxOutputTokens?: number;
  /** Abort the request if the network hangs. */
  signal?: AbortSignal;
}

interface GeminiPart {
  text: string;
}
interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}
interface GeminiResponse {
  candidates?: Array<{
    content?: GeminiContent;
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: unknown;
  };
  error?: { message?: string; status?: string; code?: number };
}

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function modelEndpoint(model: string, base: string): string {
  return `${base.replace(/\/$/, "")}/models/${encodeURIComponent(model)}:generateContent`;
}

function toGeminiContents(history: ChatMessage[]): GeminiContent[] {
  return history.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export class GeminiChatError extends Error {
  /** Best-effort surface code for callers (e.g. 429 = rate limit). */
  public readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "GeminiChatError";
    this.status = status;
  }
}

/**
 * Send a turn to Gemini and return the assistant's reply text.
 *
 * @throws {GeminiChatError} on missing API key, blocked content, or network errors.
 */
export async function generateGeminiReply(
  history: ChatMessage[],
  options: GeminiChatOptions = {},
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiChatError(
      "GEMINI_API_KEY is not configured. Add it to your environment to enable the assistant.",
      500,
    );
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const apiBase = process.env.GEMINI_API_BASE?.trim() || DEFAULT_API_BASE;
  const url = modelEndpoint(model, apiBase);

  const body = {
    contents: toGeminiContents(history),
    ...(options.systemInstruction
      ? { systemInstruction: { parts: [{ text: options.systemInstruction }] } }
      : {}),
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 768,
      // Disabling token streaming keeps server actions simple — the panel still
      // feels snappy because Flash models reply in well under a second.
      responseMimeType: "text/plain",
    },
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
      signal: options.signal,
      cache: "no-store",
    });
  } catch (e) {
    throw new GeminiChatError(
      e instanceof Error ? e.message : "Network error contacting Gemini.",
      503,
    );
  }

  let parsed: GeminiResponse;
  try {
    parsed = (await res.json()) as GeminiResponse;
  } catch {
    throw new GeminiChatError(
      `Gemini returned a non-JSON response (HTTP ${res.status}).`,
      res.status,
    );
  }

  if (!res.ok) {
    const msg = parsed?.error?.message?.trim();
    throw new GeminiChatError(
      msg || `Gemini request failed with HTTP ${res.status}.`,
      res.status,
    );
  }

  const blockReason = parsed?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new GeminiChatError(
      `Your message was blocked by safety filters (${blockReason}). Please rephrase.`,
      400,
    );
  }

  const text = parsed?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new GeminiChatError(
      "Gemini did not return any content. Please try again.",
      502,
    );
  }

  return text;
}
