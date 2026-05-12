"use client";

import { useCallback, useState } from "react";
import type { FooterSettings } from "@/lib/footer-settings";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

type Props = Pick<FooterSettings["newsletter"], "heading" | "description" | "placeholder" | "buttonLabel">;

export default function FooterNewsletterForm(props: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus("loading");
      setMessage(null);
      const r = await subscribeToNewsletter(email);
      if (r.ok) {
        setStatus("success");
        setMessage("Thank you — check your inbox for a short confirmation.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(r.error ?? "Something went wrong. Please try again.");
      }
    },
    [email],
  );

  return (
    <>
      <div className="ft-col-heading">{props.heading}</div>
      <p className="ft-newsletter-text">{props.description}</p>
      <form className="ft-newsletter-form" onSubmit={onSubmit} noValidate>
        <input
          className="ft-newsletter-input"
          type="email"
          name="newsletter-email"
          autoComplete="email"
          inputMode="email"
          placeholder={props.placeholder}
          required
          aria-invalid={status === "error"}
          aria-describedby={message ? "ft-newsletter-feedback" : undefined}
          disabled={status === "loading"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage(null);
            }
          }}
          aria-label="Email for newsletter"
        />
        <button className="ft-newsletter-btn" type="submit" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane" aria-hidden />
              {props.buttonLabel}
            </>
          )}
        </button>
        {message ? (
          <p
            id="ft-newsletter-feedback"
            role="status"
            aria-live="polite"
            className={`ft-newsletter-feedback ${status === "success" ? "is-success" : status === "error" ? "is-error" : ""}`}
          >
            {message}
          </p>
        ) : null}
      </form>
    </>
  );
}
