"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Unlink,
} from "lucide-react";
import type { ReactNode } from "react";

import "./newsletter-body-editor.css";

const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: '"Trebuchet MS", sans-serif' },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES: { label: string; value: string }[] = [
  { label: "Size…", value: "" },
  { label: "Small (14px)", value: "14px" },
  { label: "Medium (16px)", value: "16px" },
  { label: "Large (18px)", value: "18px" },
  { label: "Extra large (20px)", value: "20px" },
];

const LINE_HEIGHTS: { label: string; value: string }[] = [
  { label: "Line height…", value: "" },
  { label: "Tight", value: "1.35" },
  { label: "Normal", value: "1.5" },
  { label: "Relaxed", value: "1.65" },
  { label: "Loose", value: "1.75" },
  { label: "Very loose", value: "2" },
];

const PARAGRAPH_SPACING: { label: string; value: string }[] = [
  { label: "Paragraph gap…", value: "" },
  { label: "Compact", value: "0.35em" },
  { label: "Comfortable", value: "0.75em" },
  { label: "Spacious", value: "1.25em" },
];

const NewsletterParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      paragraphSpacing: {
        default: null,
        parseHTML: (element) => element.style.marginBottom?.trim() || null,
      },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const spacing = node.attrs.paragraphSpacing as string | null;
    const attrs: Record<string, unknown> = { ...HTMLAttributes };
    if (spacing) {
      const extra = `margin-bottom: ${spacing}`;
      attrs.style =
        typeof attrs.style === "string" && attrs.style.trim() !== ""
          ? `${attrs.style}; ${extra}`
          : extra;
    }
    return ["p", attrs, 0];
  },
});

function normalizeFontValue(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw.replace(/^['"]|['"]$/g, "").trim();
}

function findSelectValue(options: { value: string }[], current: string | undefined | null): string {
  const n = normalizeFontValue(current);
  if (!n) return "";
  const hit = options.find((o) => o.value && normalizeFontValue(o.value) === n);
  return hit?.value ?? "";
}

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export function NewsletterBodyEditor({ value, onChange }: Props) {
  const initialContentRef = useRef<string | null>(null);
  if (initialContentRef.current === null) {
    initialContentRef.current = value.trim() ? value : "<p></p>";
  }

  const editor = useEditor({
    shouldRerenderOnTransaction: true,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: false,
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: "newsletter-body-link",
          },
        },
      }),
      NewsletterParagraph,
      TextStyleKit.configure({
        color: false,
        backgroundColor: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
      }),
      Placeholder.configure({
        placeholder:
          "Write your message here — use the toolbar for fonts, spacing, and emphasis (no HTML tags needed).",
      }),
    ],
    content: initialContentRef.current,
    editorProps: {
      attributes: {
        class: "tiptap ProseMirror focus:outline-none newsletter-body-prose max-w-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  }, []);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current === value) return;
    editor.commands.setContent(value.trim() ? value : "<p></p>", { emitUpdate: false });
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "https://");
    if (url === null) return;
    const t = url.trim();
    if (t === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
  };

  const textStyle = editor?.getAttributes("textStyle") ?? {};
  const fontFamilyKey = findSelectValue(FONT_OPTIONS, textStyle.fontFamily as string | undefined);
  const fontSizeKey = findSelectValue(FONT_SIZES, textStyle.fontSize as string | undefined);
  const lineHeightRaw = (textStyle.lineHeight as string | undefined)?.trim() ?? "";
  const lineHeightKey = LINE_HEIGHTS.some((o) => o.value === lineHeightRaw) ? lineHeightRaw : "";

  const paraAttrs = editor?.getAttributes("paragraph") ?? {};
  const spacingRaw = (paraAttrs.paragraphSpacing as string | undefined)?.trim() ?? "";
  const spacingKey = PARAGRAPH_SPACING.some((o) => o.value === spacingRaw) ? spacingRaw : "";

  if (!editor) {
    return (
      <div
        className="min-h-[280px] animate-pulse rounded-xl border border-stone-200 bg-stone-50"
        aria-hidden
      />
    );
  }

  return (
    <div className="newsletter-body-editor overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-100 bg-stone-50/90 px-2 py-2">
        <ToolbarIcon
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
          icon={<Bold size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
          icon={<Italic size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          label="Underline"
          icon={<UnderlineIcon size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          label="Strikethrough"
          icon={<Strikethrough size={16} />}
        />
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <ToolbarIcon
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading 2"
          icon={<Heading2 size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Heading 3"
          icon={<Heading3 size={16} />}
        />
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <ToolbarIcon
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="Bullet list"
          icon={<List size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          label="Numbered list"
          icon={<ListOrdered size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          label="Quote"
          icon={<Quote size={16} />}
        />
        <ToolbarIcon
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Divider"
          icon={<Minus size={16} />}
        />
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <ToolbarIcon
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          label="Align left"
          icon={<AlignLeft size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          label="Align center"
          icon={<AlignCenter size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          label="Align right"
          icon={<AlignRight size={16} />}
        />
        <ToolbarIcon
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          label="Justify"
          icon={<AlignJustify size={16} />}
        />
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <ToolbarIcon
          active={editor.isActive("link")}
          onClick={setLink}
          label="Link"
          icon={<Link2 size={16} />}
        />
        <ToolbarIcon
          active={false}
          onClick={() => {
            if (editor.isActive("link")) editor.chain().focus().unsetLink().run();
          }}
          label="Remove link"
          icon={<Unlink size={16} />}
          disabled={!editor.isActive("link")}
        />
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <ToolbarIcon
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          label="Undo"
          icon={<Undo2 size={16} />}
          disabled={!editor.can().undo()}
        />
        <ToolbarIcon
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          label="Redo"
          icon={<Redo2 size={16} />}
          disabled={!editor.can().redo()}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 bg-white px-2 py-2">
        <label className="sr-only" htmlFor="newsletter-font-family">
          Font
        </label>
        <select
          id="newsletter-font-family"
          className="h-9 max-w-[10.5rem] rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 shadow-sm"
          value={fontFamilyKey}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
        >
          {FONT_OPTIONS.map((o) => (
            <option key={o.label + o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Font size"
          className="h-9 max-w-[8.5rem] rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 shadow-sm"
          value={fontSizeKey}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetFontSize().run();
            else editor.chain().focus().setFontSize(v).run();
          }}
        >
          {FONT_SIZES.map((o) => (
            <option key={o.label + o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Line height"
          className="h-9 max-w-[8.5rem] rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 shadow-sm"
          value={lineHeightKey}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) editor.chain().focus().unsetLineHeight().run();
            else editor.chain().focus().setLineHeight(v).run();
          }}
        >
          {LINE_HEIGHTS.map((o) => (
            <option key={o.label + o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Space after paragraph"
          className="h-9 max-w-[9.5rem] rounded-lg border border-stone-200 bg-white px-2 text-xs text-stone-800 shadow-sm"
          value={spacingKey}
          onChange={(e) => {
            const v = e.target.value;
            editor
              .chain()
              .focus()
              .updateAttributes("paragraph", { paragraphSpacing: v || null })
              .run();
          }}
        >
          {PARAGRAPH_SPACING.map((o) => (
            <option key={o.label + o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <EditorContent editor={editor} className="max-h-[min(50vh,420px)] overflow-y-auto bg-white" />
    </div>
  );
}

function ToolbarIcon({
  icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "bg-[#7A1515]/12 text-[#7A1515]"
          : "text-stone-600 hover:bg-white hover:text-stone-900"
      }`}
    >
      {icon}
    </button>
  );
}
