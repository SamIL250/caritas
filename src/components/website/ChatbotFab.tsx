"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";

import { sendChatMessage } from "@/app/actions/chat";
import "./chatbot-fab.css";

const CHAT = {
  fab: "Ask Caritas",
  open: "Open Caritas assistant",
  close: "Close assistant",
  title: "Caritas Assistant",
  subtitle: "Faith-driven answers, on demand",
  badge: "AI",
  welcome:
    "Hello — I can help you learn about our programs, history, and how to get involved. What would you like to know?",
  inputPlaceholder: "Ask anything about Caritas Rwanda…",
  send: "Send message",
  sending: "Thinking…",
  clear: "Clear conversation",
  newChat: "New conversation",
  you: "You",
  assistant: "Assistant",
  errorGeneric: "Something went wrong. Please try again.",
  errorEmpty: "Please type a message first.",
  disclaimer:
    "Responses are AI-generated and may be inaccurate. For verified information, see our pages or use the contact form.",
  suggestionsLabel: "Try asking",
  suggestion1: "What does Caritas Rwanda do?",
  suggestion2: "How can I volunteer?",
  suggestion3: "Where do you work in Rwanda?",
} as const;

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
}

const STORAGE_KEY = "caritas:chatbot:history:v1";
const MAX_PERSISTED_MESSAGES = 40;
const INPUT_MAX_LENGTH = 2000;

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          typeof m.id === "string",
      )
      .slice(-MAX_PERSISTED_MESSAGES);
  } catch {
    return [];
  }
}

function persistHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = messages
      .filter((m) => !m.pending)
      .slice(-MAX_PERSISTED_MESSAGES)
      .map(({ id, role, content }) => ({ id, role, content }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* localStorage full or disabled — non-fatal */
  }
}

function autosizeTextarea(el: HTMLTextAreaElement | null): void {
  if (!el) return;
  el.style.height = "auto";
  const next = Math.min(el.scrollHeight, 160);
  el.style.height = `${next}px`;
}

export default function ChatbotFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const suggestions = useMemo(
    () => [CHAT.suggestion1, CHAT.suggestion2, CHAT.suggestion3],
    [],
  );

  // ── Hydrate history on first mount (client only)
  useEffect(() => {
    setMessages(loadHistory());
    setHistoryHydrated(true);
  }, []);

  // ── Persist history whenever it changes (after hydration)
  useEffect(() => {
    if (!historyHydrated) return;
    persistHistory(messages);
  }, [messages, historyHydrated]);

  // ── Auto-scroll to the newest message when the panel is open
  useEffect(() => {
    if (!open) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [open, messages]);

  // ── Body scroll lock + Esc to close + restore focus
  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // Focus the input shortly after the open animation begins.
    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 180);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

  const submit = useCallback(
    async (rawMessage: string) => {
      const trimmed = rawMessage.trim();
      if (!trimmed) {
        setError(CHAT.errorEmpty);
        return;
      }
      if (busy) return;

      setError(null);
      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed.slice(0, INPUT_MAX_LENGTH),
      };
      const placeholderId = newId();
      const placeholder: ChatMessage = {
        id: placeholderId,
        role: "assistant",
        content: "",
        pending: true,
      };

      // Snapshot the prior conversation to send to the server (without the placeholder).
      const historyForServer = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      setMessages((prev) => [...prev, userMsg, placeholder]);
      setInput("");
      autosizeTextarea(textareaRef.current);
      setBusy(true);

      try {
        const result = await sendChatMessage({
          history: historyForServer.slice(0, -1),
          message: userMsg.content,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  ...m,
                  pending: false,
                  content: result.ok
                    ? result.reply ?? ""
                    : result.error || CHAT.errorGeneric,
                }
              : m,
          ),
        );
        if (!result.ok) setError(result.error || CHAT.errorGeneric);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, pending: false, content: CHAT.errorGeneric }
              : m,
          ),
        );
        setError(CHAT.errorGeneric);
      } finally {
        setBusy(false);
        textareaRef.current?.focus();
      }
    },
    [busy, messages],
  );

  const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit(input);
  };

  const onTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit(input);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
    persistHistory([]);
    textareaRef.current?.focus();
  };

  const conversationStarted = messages.length > 0;
  const showWelcome = !conversationStarted;
  const remaining = INPUT_MAX_LENGTH - input.length;

  return (
    <>
      <button
        type="button"
        className="cb-fab"
        aria-label={CHAT.open}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <MessageSquare size={18} strokeWidth={2} aria-hidden />
        <span className="cb-fab__label">{CHAT.fab}</span>
      </button>

      {open ? (
        <div className="cb-overlay" aria-hidden onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className={`cb-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={CHAT.title}
        aria-hidden={!open}
      >
        <header className="cb-header">
          <div className="cb-header__title">
            <span className="cb-header__icon" aria-hidden>
              <Sparkles size={16} strokeWidth={2} />
            </span>
            <div className="cb-header__text">
              <div className="cb-header__name">
                {CHAT.title}
                <span className="cb-header__badge">{CHAT.badge}</span>
              </div>
              <p className="cb-header__sub">{CHAT.subtitle}</p>
            </div>
          </div>
          <div className="cb-header__actions">
            {conversationStarted ? (
              <button
                type="button"
                className="cb-btn-ghost"
                onClick={clearConversation}
                title={CHAT.clear}
              >
                {CHAT.newChat}
              </button>
            ) : null}
            <button
              type="button"
              className="cb-icon-btn"
              aria-label={CHAT.close}
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="cb-body" ref={scrollerRef}>
          {showWelcome ? (
            <div className="cb-welcome">
              <div className="cb-welcome__lead">{CHAT.welcome}</div>

              <div className="cb-suggestions">
                <p className="cb-suggestions__label">{CHAT.suggestionsLabel}</p>
                <ul className="cb-suggestions__list">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        className="cb-suggestion"
                        disabled={busy}
                        onClick={() => void submit(s)}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}

          {messages.length > 0 ? (
            <ul className="cb-messages" role="log" aria-live="polite" aria-relevant="additions">
              {messages.map((m) => (
                <li key={m.id} className={`cb-msg cb-msg--${m.role}`}>
                  <div className="cb-msg__role">
                    {m.role === "user" ? CHAT.you : CHAT.assistant}
                  </div>
                  <div className="cb-msg__bubble">
                    {m.pending ? (
                      <span className="cb-typing" aria-label={CHAT.sending}>
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : (
                      m.content
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <form className="cb-composer" onSubmit={onFormSubmit}>
          {error ? (
            <div className="cb-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="cb-input-row">
            <textarea
              ref={textareaRef}
              className="cb-input"
              placeholder={CHAT.inputPlaceholder}
              value={input}
              maxLength={INPUT_MAX_LENGTH}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
                autosizeTextarea(e.currentTarget);
              }}
              onKeyDown={onTextareaKeyDown}
              rows={1}
              disabled={busy && messages[messages.length - 1]?.pending}
            />
            <button
              type="submit"
              className="cb-send"
              aria-label={CHAT.send}
              disabled={busy || input.trim().length === 0}
            >
              <Send size={16} strokeWidth={2} aria-hidden />
            </button>
          </div>

          <div className="cb-foot">
            <p className="cb-disclaimer">{CHAT.disclaimer}</p>
            <span
              className={`cb-counter${remaining < 100 ? " is-near" : ""}`}
              aria-hidden
            >
              {input.length}/{INPUT_MAX_LENGTH}
            </span>
          </div>
        </form>
      </aside>
    </>
  );
}
