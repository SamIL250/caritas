"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type CommentRow = Database["public"]["Tables"]["community_campaign_comments"]["Row"];

type TreeNode = CommentRow & { children: TreeNode[] };

const DEFAULT_DISPLAY_NAME = "Community supporter";

function buildTree(rows: CommentRow[]): TreeNode[] {
  const sorted = [...rows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const map = new Map<string, TreeNode>();
  for (const r of sorted) {
    map.set(r.id, { ...r, children: [] });
  }
  const roots: TreeNode[] = [];
  for (const r of sorted) {
    const node = map.get(r.id)!;
    if (r.parent_id && map.has(r.parent_id)) {
      map.get(r.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function EmptyIllustration() {
  return (
    <svg className="campaign-comments-empty-icon" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="9" y="11" width="30" height="24" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 15l15 11 15-11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Thread({
  nodes,
  depth,
  onReply,
}: {
  nodes: TreeNode[];
  depth: number;
  onReply: (id: string, name: string) => void;
}) {
  return (
    <ul className={`campaign-comments-thread-ul ${depth > 0 ? "is-nested" : ""}`}>
      {nodes.map((n) => (
        <li key={n.id} className="campaign-comments-thread-li">
          <article className="campaign-comments-msg">
            <header className="campaign-comments-msg-head">
              <p className="campaign-comments-msg-author">{n.author_display_name}</p>
              <time className="campaign-comments-msg-time" dateTime={n.created_at}>
                {new Date(n.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </header>
            <p className="campaign-comments-msg-body">{n.body}</p>
            <button
              type="button"
              className="campaign-comments-msg-reply"
              onClick={() => onReply(n.id, n.author_display_name)}
            >
              Reply
            </button>
          </article>
          {n.children.length > 0 ? (
            <Thread nodes={n.children} depth={depth + 1} onReply={onReply} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function CampaignComments({
  campaignId,
  initialComments,
}: {
  campaignId: string;
  initialComments: CommentRow[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const tree = useMemo(() => buildTree(initialComments), [initialComments]);

  const [showIdentityFields, setShowIdentityFields] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [parentLabel, setParentLabel] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function beginReply(id: string, author: string) {
    setParentId(id);
    setParentLabel(author);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const bd = body.trim();
    if (bd.length < 2) {
      setStatus({ ok: false, text: "Please write a short message (at least 2 characters)." });
      return;
    }

    const nm = name.trim();
    const author_display_name =
      showIdentityFields && nm.length >= 1 ? nm.slice(0, 120) : DEFAULT_DISPLAY_NAME;
    const author_email =
      showIdentityFields && email.trim().length > 0 ? email.trim() : null;

    setSubmitting(true);
    const { error } = await supabase.from("community_campaign_comments").insert({
      campaign_id: campaignId,
      parent_id: parentId,
      author_display_name,
      author_email,
      body: bd.slice(0, 4000),
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      setStatus({ ok: false, text: error.message });
      return;
    }
    setBody("");
    setParentId(null);
    setParentLabel(null);
    setStatus({
      ok: true,
      text: "Thank you — your message was submitted for review by our team before it appears publicly.",
    });
    router.refresh();
  }

  return (
    <aside id="campaign-comments-panel" className="campaign-comments-aside" aria-labelledby="campaign-comments-heading">
      <div className="campaign-comments-card">
        <div className="campaign-comments-head">
          <i className="fa-regular fa-comments" aria-hidden />
          <h2 id="campaign-comments-heading" className="campaign-comments-title">
            Community messages
          </h2>
        </div>
        <p className="campaign-comments-note">
          Messages are reviewed by Caritas Rwanda staff before publication. Please keep contributions respectful and
          constructive.
        </p>

        <div className="campaign-comments-thread-scroll">
          {tree.length === 0 ? (
            <div className="campaign-comments-empty">
              <div className="campaign-comments-empty-inner">
                <EmptyIllustration />
                <p className="campaign-comments-empty-text">
                  <span className="campaign-comments-empty-title">Be the first to leave an encouraging word</span>
                  Share hope, ask a question, or cheer this campaign on — your voice matters once approved.
                </p>
              </div>
            </div>
          ) : (
            <Thread nodes={tree} depth={0} onReply={beginReply} />
          )}
        </div>

        <form className="campaign-comments-form" onSubmit={handleSubmit}>
          {parentLabel ? (
            <p className="campaign-comments-reply-line">
              Replying to <strong>{parentLabel}</strong>
              <button
                type="button"
                className="campaign-comments-cancel-reply"
                onClick={() => {
                  setParentId(null);
                  setParentLabel(null);
                }}
              >
                Cancel
              </button>
            </p>
          ) : null}
          {status ? (
            <p
              role="status"
              className={`campaign-comments-status ${status.ok ? "is-ok" : "is-err"}`}
            >
              {status.text}
            </p>
          ) : null}

          <div className="campaign-comments-float-field">
            <textarea
              id="campaign-comment-body"
              name="message"
              placeholder=" "
              required
              rows={5}
              maxLength={4000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              autoComplete="off"
            />
            <label htmlFor="campaign-comment-body">
              Share an encouraging word or ask a question — we read every note before it is published.
            </label>
          </div>

          <button
            type="button"
            className="campaign-comments-identity-toggle"
            aria-expanded={showIdentityFields}
            aria-controls="campaign-comments-identity-panel"
            onClick={() => setShowIdentityFields((v) => !v)}
          >
            <span>Optional: include my name or email</span>
            <i className={`fa-solid fa-chevron-${showIdentityFields ? "up" : "down"}`} aria-hidden />
          </button>

          <div
            id="campaign-comments-identity-panel"
            className={`campaign-comments-identity-panel ${showIdentityFields ? "is-open" : ""}`}
          >
            <div className="campaign-comments-identity-inner">
              <div className="campaign-comments-identity-fields">
                <label className="campaign-comments-field-label">
                  <span>Display name</span>
                  <input
                    type="text"
                    name="display_name"
                    value={name}
                    maxLength={120}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="campaign-comments-field-label">
                  <span>Email (optional)</span>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="campaign-comments-submit" disabled={submitting}>
            {submitting ? "Sending…" : "Submit for review"}
          </button>
        </form>
      </div>
    </aside>
  );
}
