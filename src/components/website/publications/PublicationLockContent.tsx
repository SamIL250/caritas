"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Lock, Mail, CheckCircle, Loader2, KeyRound, Send } from "lucide-react";
import { verifyPublicationPassword, requestPublicationAccess } from "@/app/actions/publication-access";

type Tab = "password" | "request";

type Props = {
  publicationId: string;
  publicationTitle?: string;
  onUnlock: () => void;
  autoFocus?: boolean;
  headingId?: string;
};

export function PublicationLockContent({
  publicationId,
  publicationTitle,
  onUnlock,
  autoFocus = true,
  headingId = "pub-lock-access-heading",
}: Props) {
  const [tab, setTab] = useState<Tab>("password");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [requestState, setRequestState] = useState<"idle" | "sent" | "loading">("idle");
  const [requestError, setRequestError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTab("password");
    setPassword("");
    setEmail("");
    setPasswordError("");
    setRequestError("");
    setRequestState("idle");
    setVerifying(false);
    if (autoFocus) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 400);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [publicationId, autoFocus]);

  const handlePasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");
      setVerifying(true);
      const result = await verifyPublicationPassword(publicationId, password);
      setVerifying(false);
      if (result.valid) {
        try {
          localStorage.setItem(`pub_unlocked_${publicationId}`, "1");
        } catch {
          /* ignore */
        }
        onUnlock();
      } else {
        setPasswordError("Incorrect password. Try again or request access.");
      }
    },
    [publicationId, password, onUnlock],
  );

  const handleRequestAccess = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setRequestError("");
      setRequestState("loading");
      const result = await requestPublicationAccess(publicationId, email);
      if (result.success) {
        setRequestState("sent");
      } else {
        setRequestError(result.error || "Something went wrong.");
        setRequestState("idle");
      }
    },
    [publicationId, email],
  );

  return (
    <div className="flex flex-col justify-center pub-lock-shell">
      <div className="pub-lock-icon">
        <div className="pub-lock-icon-inner">
          <Lock size={26} />
        </div>
      </div>

      <h2 className="pub-lock-heading" id={headingId}>
        Access Required
      </h2>
      <p className="pub-lock-subtitle">
        {publicationTitle ? (
          <>
            <strong className="font-semibold text-stone-700">{publicationTitle}</strong> is private.
            Enter the password or request access from the administrator.
          </>
        ) : (
          <>Enter the password or request access from the administrator to view this publication.</>
        )}
      </p>

      <div className="pub-lock-tabs">
        <button
          type="button"
          onClick={() => {
            setTab("password");
            setPasswordError("");
          }}
          className={`pub-lock-tab${tab === "password" ? " active" : ""}`}
        >
          <KeyRound size={15} />
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("request");
            setRequestError("");
          }}
          className={`pub-lock-tab${tab === "request" ? " active" : ""}`}
        >
          <Send size={15} />
          Request Access
        </button>
      </div>

      {tab === "password" ? (
        <form onSubmit={handlePasswordSubmit} className="pub-lock-form">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter publication password"
            className="pub-lock-input"
          />
          {passwordError ? (
            <p className="pub-lock-error">
              <Lock size={12} />
              {passwordError}
            </p>
          ) : null}
          <button type="submit" disabled={verifying || !password} className="pub-lock-btn">
            {verifying ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <>
                <KeyRound size={15} />
                Unlock Publication
              </>
            )}
          </button>
        </form>
      ) : requestState === "sent" ? (
        <div className="pub-lock-sent-card">
          <div className="pub-lock-sent-icon">
            <CheckCircle size={24} />
          </div>
          <p className="pub-lock-sent-title">Request Sent!</p>
          <p className="pub-lock-sent-desc">
            The administrator will review your request and email the access password to you.
          </p>
        </div>
      ) : (
        <form onSubmit={handleRequestAccess} className="pub-lock-form">
          <div className="pub-lock-input-icon-wrap">
            <Mail size={15} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="pub-lock-input pub-lock-input-icon"
            />
          </div>
          <p className="pub-lock-hint">
            We&apos;ll send the password to this email once the administrator grants your request.
          </p>
          {requestError ? (
            <p className="pub-lock-error">
              <Lock size={12} />
              {requestError}
            </p>
          ) : null}
          <button type="submit" disabled={requestState === "loading" || !email} className="pub-lock-btn">
            {requestState === "loading" ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <>
                <Send size={15} />
                Send Request
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
