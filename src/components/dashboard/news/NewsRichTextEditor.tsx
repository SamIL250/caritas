"use client";

import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  Undo2,
  Redo2,
  Video,
  Captions,
} from "lucide-react";
import { MediaPicker, type PickedMediaItem } from "@/components/dashboard/MediaPicker";
import { enrichRichTextMediaEmbeds, parseMediaEmbedUrl } from "@/lib/rich-text-media-embed";
import { enrichRichTextFigures } from "@/lib/rich-text-figure";
import { RichTextMediaEmbed } from "./RichTextMediaEmbedExtension";
import { RichTextFigure } from "./RichTextFigureExtension";

import "./news-rich-editor.css";

export type NewsRichTextEditorHandle = {
  getHTML: () => string;
};

type Props = {
  initialHtml: string | null | undefined;
};

function pickMediaItem(m: PickedMediaItem | PickedMediaItem[]): PickedMediaItem | null {
  if (Array.isArray(m)) return m[0] ?? null;
  return m;
}

function prepareEditorHtml(html: string): string {
  return enrichRichTextFigures(enrichRichTextMediaEmbeds(html));
}

export const NewsRichTextEditor = forwardRef<NewsRichTextEditorHandle, Props>(
  function NewsRichTextEditor({ initialHtml }, ref) {
    const [pickerOpen, setPickerOpen] = useState(false);

    const starterContent = useMemo(() => {
      const raw = (initialHtml ?? "").trim();
      if (!raw) return "<p></p>";
      return prepareEditorHtml(raw);
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
            "Write the full story… Use headings, lists, quotes, and insert images from your media library.",
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: "news-rich-link",
          },
        }),
        RichTextFigure.configure({
          imageClass: "news-rich-inline-img",
        }),
        RichTextMediaEmbed,
      ],
      content: starterContent,
      editorProps: {
        attributes: {
          class:
            "tiptap ProseMirror focus:outline-none news-rich-prose max-w-none",
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
          return emptyish ? "" : prepareEditorHtml(html);
        },
      }),
      [editor],
    );

    const onInsertImage = (m: PickedMediaItem | PickedMediaItem[]) => {
      const item = pickMediaItem(m);
      const caption = item?.caption?.trim() ?? "";
      if (!item?.url || !caption || !editor) return;
      editor
        .chain()
        .focus()
        .setRichTextFigure({
          src: item.url,
          alt: caption,
          caption,
          imageClass: "news-rich-inline-img",
        })
        .run();
      setPickerOpen(false);
    };

    const editFigureCaption = () => {
      if (!editor || !editor.isActive("richTextFigure")) return;
      const current = String(editor.getAttributes("richTextFigure").caption ?? "");
      const next = window.prompt("Image caption", current);
      if (next === null) return;
      const trimmed = next.trim();
      if (!trimmed) {
        window.alert("Caption is required.");
        return;
      }
      editor.chain().focus().updateRichTextFigureCaption(trimmed).run();
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
      const embed = parseMediaEmbedUrl(t);
      if (embed) {
        editor.chain().focus().setMediaEmbed(embed).run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
    };

    const insertMediaEmbed = () => {
      if (!editor) return;
      const url = window.prompt("YouTube or Vimeo URL");
      if (url === null) return;
      const info = parseMediaEmbedUrl(url.trim());
      if (!info) {
        window.alert("Paste a valid YouTube or Vimeo link.");
        return;
      }
      editor.chain().focus().setMediaEmbed(info).run();
    };

    if (!editor) {
      return (
        <div
          className="min-h-[260px] animate-pulse rounded-xl border border-stone-200 bg-stone-50"
          aria-hidden
        />
      );
    }

    return (
      <div className="news-rich-editor overflow-hidden rounded-xl border border-stone-200 bg-white">
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
            active={editor.isActive("richTextFigure")}
            onClick={editFigureCaption}
            label="Edit image caption"
            icon={<Captions size={16} />}
            disabled={!editor.isActive("richTextFigure")}
          />
          <ToolbarIcon
            active={false}
            onClick={() => setPickerOpen(true)}
            label="Insert image from library"
            icon={<ImageIcon size={16} />}
          />
          <ToolbarIcon
            active={editor.isActive("mediaEmbed")}
            onClick={insertMediaEmbed}
            label="Embed video (YouTube or Vimeo)"
            icon={<Video size={16} />}
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
        <EditorContent editor={editor} className="max-h-[min(60vh,560px)] overflow-y-auto bg-white" />

        <MediaPicker
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={onInsertImage}
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
