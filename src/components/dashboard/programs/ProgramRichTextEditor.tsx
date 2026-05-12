"use client";

import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Link2,
  Unlink,
  Paperclip,
  Undo2,
  Redo2,
} from "lucide-react";
import { MediaPicker } from "@/components/dashboard/MediaPicker";

import "./program-rich-editor.css";

export type ProgramRichTextEditorHandle = {
  getHTML: () => string;
};

type MediaItem = { id: string; url: string; filename: string };

type Props = {
  initialHtml: string | null | undefined;
  placeholder?: string;
};

function pickMediaUrl(m: MediaItem | MediaItem[]): { url: string; filename: string } {
  if (Array.isArray(m)) {
    const first = m[0];
    return { url: first?.url ?? "", filename: first?.filename ?? "" };
  }
  return { url: m.url, filename: m.filename };
}

export const ProgramRichTextEditor = forwardRef<ProgramRichTextEditorHandle, Props>(
  function ProgramRichTextEditor({ initialHtml, placeholder }, ref) {
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [filePickerOpen, setFilePickerOpen] = useState(false);

    const starterContent = useMemo(() => {
      const raw = (initialHtml ?? "").trim();
      if (!raw) return "<p></p>";
      return raw;
    }, [initialHtml]);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Placeholder.configure({
          placeholder:
            placeholder ??
            "Tell the program story… Use headings, lists, quotes, embed images, link out to PDFs or partner pages — anything that helps the reader understand what's happening on the ground.",
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        }),
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: "program-rich-inline-img",
          },
        }),
      ],
      content: starterContent,
      editorProps: {
        attributes: {
          class: "tiptap ProseMirror focus:outline-none program-rich-prose max-w-none",
        },
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => {
          const html = editor?.getHTML() ?? "";
          const emptyish =
            !html ||
            html.replace(/\s/g, "") === "<p></p>" ||
            html.replace(/\s/g, "") === "<p><br></p>";
          return emptyish ? "" : html;
        },
      }),
      [editor],
    );

    const onInsertImage = (m: MediaItem | MediaItem[]) => {
      const { url } = pickMediaUrl(m);
      if (!url || !editor) return;
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
      setImagePickerOpen(false);
    };

    const onInsertFile = (m: MediaItem | MediaItem[]) => {
      const { url, filename } = pickMediaUrl(m);
      if (!url || !editor) return;
      const labelBase = (filename || url.split("/").pop() || "Download file").replace(
        /[_-]+/g,
        " ",
      );
      const label = `📎 ${labelBase}`;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: label,
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  },
                },
              ],
            },
          ],
        })
        .run();
      setFilePickerOpen(false);
    };

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

    if (!editor) {
      return (
        <div
          className="min-h-[320px] animate-pulse rounded-xl border border-stone-200 bg-stone-50"
          aria-hidden
        />
      );
    }

    return (
      <div className="program-rich-editor overflow-hidden rounded-xl border border-stone-200 bg-white">
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
          <ToolbarIcon
            active={false}
            onClick={() => setImagePickerOpen(true)}
            label="Insert image from library"
            icon={<ImageIcon size={16} />}
          />
          <ToolbarIcon
            active={false}
            onClick={() => setFilePickerOpen(true)}
            label="Embed file (PDF, doc…) from library"
            icon={<Paperclip size={16} />}
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
        <EditorContent
          editor={editor}
          className="max-h-[min(70vh,720px)] overflow-y-auto bg-white"
        />

        <MediaPicker
          isOpen={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={onInsertImage}
        />
        <MediaPicker
          isOpen={filePickerOpen}
          onClose={() => setFilePickerOpen(false)}
          onSelect={onInsertFile}
        />
      </div>
    );
  },
);

function ToolbarIcon({
  icon,
  label,
  onClick,
  active,
  disabled,
}: {
  icon: React.ReactNode;
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

export default ProgramRichTextEditor;
