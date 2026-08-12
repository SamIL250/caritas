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
import { MessageSquare, MessageSquarePlus, Send, Sparkles, X } from "lucide-react";

import { sendChatMessage } from "@/app/actions/chat";
import ChatMessageBody from "@/components/website/ChatMessageBody";
import "./chatbot-fab.css";

type ChatLang = "en" | "fr" | "es" | "rw";

const LANG_OPTIONS: { id: ChatLang; label: string; native: string; short: string }[] = [
  { id: "en", label: "English", native: "English", short: "EN" },
  { id: "fr", label: "French", native: "Français", short: "FR" },
  { id: "es", label: "Spanish", native: "Español", short: "ES" },
  { id: "rw", label: "Kinyarwanda", native: "Ikinyarwanda", short: "RW" },
];

const COPY: Record<
  ChatLang,
  {
    fab: string;
    open: string;
    close: string;
    title: string;
    subtitle: string;
    badge: string;
    welcome: string;
    chooseLanguage: string;
    chooseLanguageHint: string;
    changeLanguage: string;
    inputPlaceholder: string;
    send: string;
    sending: string;
    clear: string;
    newChat: string;
    you: string;
    assistant: string;
    errorGeneric: string;
    errorEmpty: string;
    disclaimer: string;
    suggestionsLabel: string;
    suggestion1: string;
    suggestion2: string;
    suggestion3: string;
  }
> = {
  en: {
    fab: "Ask Caritas",
    open: "Open Caritas assistant",
    close: "Close assistant",
    title: "Caritas Assistant",
    subtitle: "Faith-driven answers, on demand",
    badge: "AI",
    welcome:
      "Hello — I can help you learn about our programs, history, and how to get involved. What would you like to know?",
    chooseLanguage: "Choose your language",
    chooseLanguageHint: "The assistant will reply in the language you select.",
    changeLanguage: "Language",
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
    suggestion3: "How can I donate or support a campaign?",
  },
  fr: {
    fab: "Demander à Caritas",
    open: "Ouvrir l’assistant Caritas",
    close: "Fermer l’assistant",
    title: "Assistant Caritas",
    subtitle: "Des réponses guidées par la foi",
    badge: "IA",
    welcome:
      "Bonjour — je peux vous parler de nos programmes, de notre histoire et de comment vous engager. Que souhaitez-vous savoir ?",
    chooseLanguage: "Choisissez votre langue",
    chooseLanguageHint: "L’assistant répondra dans la langue que vous choisissez.",
    changeLanguage: "Langue",
    inputPlaceholder: "Posez une question sur Caritas Rwanda…",
    send: "Envoyer",
    sending: "Réflexion…",
    clear: "Effacer la conversation",
    newChat: "Nouvelle conversation",
    you: "Vous",
    assistant: "Assistant",
    errorGeneric: "Une erreur s’est produite. Veuillez réessayer.",
    errorEmpty: "Veuillez d’abord saisir un message.",
    disclaimer:
      "Les réponses sont générées par l’IA et peuvent être inexactes. Pour des informations vérifiées, consultez nos pages ou le formulaire de contact.",
    suggestionsLabel: "Essayez de demander",
    suggestion1: "Que fait Caritas Rwanda ?",
    suggestion2: "Comment puis-je me porter volontaire ?",
    suggestion3: "Comment puis-je faire un don ?",
  },
  es: {
    fab: "Preguntar a Caritas",
    open: "Abrir el asistente de Caritas",
    close: "Cerrar asistente",
    title: "Asistente Caritas",
    subtitle: "Respuestas con fe, a tu alcance",
    badge: "IA",
    welcome:
      "Hola — puedo ayudarte a conocer nuestros programas, historia y cómo participar. ¿Qué te gustaría saber?",
    chooseLanguage: "Elige tu idioma",
    chooseLanguageHint: "El asistente responderá en el idioma que elijas.",
    changeLanguage: "Idioma",
    inputPlaceholder: "Pregunta cualquier cosa sobre Caritas Rwanda…",
    send: "Enviar",
    sending: "Pensando…",
    clear: "Borrar conversación",
    newChat: "Nueva conversación",
    you: "Tú",
    assistant: "Asistente",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorEmpty: "Escribe un mensaje primero.",
    disclaimer:
      "Las respuestas son generadas por IA y pueden ser inexactas. Para información verificada, consulta nuestras páginas o el formulario de contacto.",
    suggestionsLabel: "Prueba preguntar",
    suggestion1: "¿Qué hace Caritas Rwanda?",
    suggestion2: "¿Cómo puedo ser voluntario?",
    suggestion3: "¿Cómo puedo donar o apoyar una campaña?",
  },
  rw: {
    fab: "Baza Caritas",
    open: "Fungura umufasha wa Caritas",
    close: "Funga umufasha",
    title: "Umufasha wa Caritas",
    subtitle: "Ibisubizo byubashye, ku buryo bworoshye",
    badge: "AI",
    welcome:
      "Muraho — nshobora kukubwira ibijyanye n’ibikorwa byacu, amateka, n’uko wishyira mu bikorwa. Uri shaka kumenya iki?",
    chooseLanguage: "Hitamo ururimi",
    chooseLanguageHint: "Umufasha azasubiza mu rurimi wahisemo.",
    changeLanguage: "Ururimi",
    inputPlaceholder: "Baza ikibazo cyose kuri Caritas Rwanda…",
    send: "Ohereza",
    sending: "Ntegure…",
    clear: "Siba ikiganiro",
    newChat: "Ikiganiro gishya",
    you: "Wowe",
    assistant: "Umufasha",
    errorGeneric: "Habaye ikosa. Ongera ugerageze.",
    errorEmpty: "Andika ubutumwa mbere.",
    disclaimer:
      "Ibisubizo bikozwe n’ubwenge bw’inyongera kandi bishobora kuba si byiza. Kugira amakuru yemewe, reba amapaji yacu cyangwa ukoreshe ifishi yo kuvugana.",
    suggestionsLabel: "Gerageza kubaza",
    suggestion1: "Caritas Rwanda ikora iki?",
    suggestion2: "Nashobora gute kuba umukorerabushake?",
    suggestion3: "Nashobora gute gutanga inkunga?",
  },
};

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
}

const STORAGE_KEY = "caritas:chatbot:history:v2";
const LANG_KEY = "caritas:chatbot:lang:v1";
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
    /* non-fatal */
  }
}

function loadLang(): ChatLang | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LANG_KEY);
  if (raw === "en" || raw === "fr" || raw === "es" || raw === "rw") return raw;
  return null;
}

function persistLang(lang: ChatLang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* non-fatal */
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
  const [lang, setLang] = useState<ChatLang | null>(null);
  const [langReady, setLangReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const chat = COPY[lang ?? "en"];
  const suggestions = useMemo(
    () => [chat.suggestion1, chat.suggestion2, chat.suggestion3],
    [chat.suggestion1, chat.suggestion2, chat.suggestion3],
  );

  useEffect(() => {
    setLang(loadLang());
    setLangReady(true);
    setMessages(loadHistory());
    setHistoryHydrated(true);
  }, []);

  useEffect(() => {
    if (!historyHydrated) return;
    persistHistory(messages);
  }, [messages, historyHydrated]);

  useEffect(() => {
    if (!open) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [open, messages, lang]);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("cb-chat-open");
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => {
      if (lang) textareaRef.current?.focus();
    }, 180);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove("cb-chat-open");
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      lastFocusedRef.current?.focus?.();
    };
  }, [open, lang]);

  const chooseLanguage = (next: ChatLang) => {
    setLang(next);
    persistLang(next);
    setError(null);
    window.setTimeout(() => textareaRef.current?.focus(), 120);
  };

  const submit = useCallback(
    async (rawMessage: string) => {
      const activeLang = lang ?? "en";
      const copy = COPY[activeLang];
      const trimmed = rawMessage.trim();
      if (!trimmed) {
        setError(copy.errorEmpty);
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
          language: activeLang,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  ...m,
                  pending: false,
                  content: result.ok
                    ? result.reply ?? ""
                    : result.error || copy.errorGeneric,
                }
              : m,
          ),
        );
        if (!result.ok) setError(result.error || copy.errorGeneric);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { ...m, pending: false, content: copy.errorGeneric }
              : m,
          ),
        );
        setError(copy.errorGeneric);
      } finally {
        setBusy(false);
        textareaRef.current?.focus();
      }
    },
    [busy, messages, lang],
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
  const showWelcome = !conversationStarted && Boolean(lang);
  const showLanguagePicker = open && langReady && !lang;
  const remaining = INPUT_MAX_LENGTH - input.length;

  return (
    <>
      <button
        type="button"
        className="cb-fab"
        aria-label={chat.open}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <MessageSquare size={18} strokeWidth={2} aria-hidden />
        <span className="cb-fab__label">{chat.fab}</span>
      </button>

      {open ? (
        <div className="cb-overlay" aria-hidden onClick={() => setOpen(false)} />
      ) : null}

      <aside
        className={`cb-panel${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={chat.title}
        aria-hidden={!open}
        data-lenis-prevent
        data-lenis-prevent-wheel
      >
        <header className="cb-header">
          <div className="cb-header__title">
            <span className="cb-header__icon" aria-hidden>
              <Sparkles size={16} strokeWidth={2} />
            </span>
            <div className="cb-header__text">
              <div className="cb-header__name">
                <span className="cb-header__name-text">{chat.title}</span>
                <span className="cb-header__badge">{chat.badge}</span>
              </div>
              <p className="cb-header__sub">{chat.subtitle}</p>
            </div>
          </div>
          <div className="cb-header__actions">
            {lang ? (
              <label className="cb-lang-select">
                <span className="sr-only">{chat.changeLanguage}</span>
                <select
                  value={lang}
                  aria-label={chat.changeLanguage}
                  onChange={(e) => chooseLanguage(e.target.value as ChatLang)}
                >
                  {LANG_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id} title={o.native}>
                      {o.short}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {conversationStarted ? (
              <button
                type="button"
                className="cb-icon-btn"
                onClick={clearConversation}
                title={chat.clear}
                aria-label={chat.newChat}
              >
                <MessageSquarePlus size={18} strokeWidth={2} />
              </button>
            ) : null}
            <button
              type="button"
              className="cb-icon-btn"
              aria-label={chat.close}
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </header>

        <div
          className="cb-body"
          ref={scrollerRef}
          data-lenis-prevent
          data-lenis-prevent-wheel
          onWheel={(e) => e.stopPropagation()}
        >
          {showLanguagePicker ? (
            <div className="cb-lang-picker">
              <p className="cb-lang-picker__title">{COPY.en.chooseLanguage}</p>
              <p className="cb-lang-picker__hint">{COPY.en.chooseLanguageHint}</p>
              <div className="cb-lang-picker__grid">
                {LANG_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="cb-lang-picker__btn"
                    onClick={() => chooseLanguage(o.id)}
                  >
                    <span className="cb-lang-picker__native">{o.native}</span>
                    <span className="cb-lang-picker__label">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showWelcome ? (
            <div className="cb-welcome">
              <div className="cb-welcome__lead">{chat.welcome}</div>

              <div className="cb-suggestions">
                <p className="cb-suggestions__label">{chat.suggestionsLabel}</p>
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
                    {m.role === "user" ? chat.you : chat.assistant}
                  </div>
                  <div className="cb-msg__bubble">
                    {m.pending ? (
                      <span className="cb-typing" aria-label={chat.sending}>
                        <span />
                        <span />
                        <span />
                      </span>
                    ) : m.role === "assistant" ? (
                      <ChatMessageBody text={m.content} />
                    ) : (
                      m.content
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {lang ? (
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
                placeholder={chat.inputPlaceholder}
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
                aria-label={chat.send}
                disabled={busy || input.trim().length === 0}
              >
                <Send size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>

            <div className="cb-foot">
              <p className="cb-disclaimer">{chat.disclaimer}</p>
              <span
                className={`cb-counter${remaining < 100 ? " is-near" : ""}`}
                aria-hidden
              >
                {input.length}/{INPUT_MAX_LENGTH}
              </span>
            </div>
          </form>
        ) : null}
      </aside>
    </>
  );
}
