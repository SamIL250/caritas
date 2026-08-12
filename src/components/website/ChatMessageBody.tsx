"use client";

import React from "react";

type Segment =
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string };

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
const BARE_URL_RE = /(https?:\/\/[^\s<]+|\/(?:about|programs|news|publications|contact|donate|metrics|campaigns|get-involved|diocesan)[^\s<]*)/gi;

function stripHeavyMarkdown(input: string): string {
  return input
    // Remove bold/italic markers the model overuses
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, "$1")
    .replace(/(?<!\w)_([^_\n]+)_(?!\w)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\r\n/g, "\n")
    .trim();
}

function linkifyLine(line: string): Segment[] {
  const parts: Segment[] = [];
  let cursor = 0;
  const mdMatches = [...line.matchAll(MARKDOWN_LINK_RE)];

  if (mdMatches.length > 0) {
    for (const m of mdMatches) {
      const start = m.index ?? 0;
      if (start > cursor) {
        parts.push(...linkifyBare(line.slice(cursor, start)));
      }
      parts.push({ type: "link", href: m[2], label: m[1] });
      cursor = start + m[0].length;
    }
    if (cursor < line.length) parts.push(...linkifyBare(line.slice(cursor)));
    return parts;
  }

  return linkifyBare(line);
}

function linkifyBare(text: string): Segment[] {
  const parts: Segment[] = [];
  let last = 0;
  const re = new RegExp(BARE_URL_RE.source, BARE_URL_RE.flags);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", value: text.slice(last, m.index) });
    }
    let href = m[0];
    // Trim trailing punctuation often stuck to URLs
    href = href.replace(/[.,;:!?)]+$/, "");
    const label = href.startsWith("http") ? href.replace(/^https?:\/\//, "") : href;
    parts.push({ type: "link", href, label });
    last = m.index + href.length;
    re.lastIndex = last;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts.length ? parts : [{ type: "text", value: text }];
}

function isBulletLine(line: string): boolean {
  return /^\s*([-*•]|\d+[.)])\s+/.test(line);
}

function bulletText(line: string): string {
  return line.replace(/^\s*([-*•]|\d+[.)])\s+/, "");
}

function renderSegments(segments: Segment[], keyPrefix: string): React.ReactNode[] {
  return segments.map((seg, i) => {
    if (seg.type === "text") {
      return <React.Fragment key={`${keyPrefix}-t-${i}`}>{seg.value}</React.Fragment>;
    }
    const external = /^https?:\/\//i.test(seg.href);
    return (
      <a
        key={`${keyPrefix}-a-${i}`}
        href={seg.href}
        className="cb-msg__link"
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {seg.label}
      </a>
    );
  });
}

/**
 * Renders assistant chat text with light formatting:
 * paragraphs, bullet lists, and clickable links — without raw ** markdown.
 */
export default function ChatMessageBody({ text }: { text: string }) {
  const cleaned = stripHeavyMarkdown(text || "");
  if (!cleaned) return null;

  const blocks = cleaned.split(/\n{2,}/);
  const nodes: React.ReactNode[] = [];

  blocks.forEach((block, bi) => {
    const lines = block.split("\n").map((l) => l.trimEnd()).filter((l) => l.length > 0);
    if (lines.length === 0) return;

    const allBullets = lines.every(isBulletLine);
    if (allBullets) {
      nodes.push(
        <ul key={`ul-${bi}`} className="cb-msg__list">
          {lines.map((line, li) => (
            <li key={`li-${bi}-${li}`}>
              {renderSegments(linkifyLine(bulletText(line)), `b${bi}-${li}`)}
            </li>
          ))}
        </ul>,
      );
      return;
    }

    nodes.push(
      <p key={`p-${bi}`} className="cb-msg__p">
        {lines.map((line, li) => (
          <React.Fragment key={`pl-${bi}-${li}`}>
            {li > 0 ? <br /> : null}
            {renderSegments(linkifyLine(line), `p${bi}-${li}`)}
          </React.Fragment>
        ))}
      </p>,
    );
  });

  return <div className="cb-msg__rich">{nodes}</div>;
}
