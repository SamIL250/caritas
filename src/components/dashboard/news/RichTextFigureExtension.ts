import { Node } from "@tiptap/core";
import { buildRichTextFigureHtml, type RichTextFigureAttrs } from "@/lib/rich-text-figure";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    richTextFigure: {
      setRichTextFigure: (attrs: RichTextFigureAttrs) => ReturnType;
      updateRichTextFigureCaption: (caption: string) => ReturnType;
    };
  }
}

type RichTextFigureOptions = {
  imageClass: string;
};

export const RichTextFigure = Node.create<RichTextFigureOptions>({
  name: "richTextFigure",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      imageClass: "news-rich-inline-img",
    };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    const imageClass = this.options.imageClass;

    return [
      {
        tag: 'figure[data-rich-text-figure="true"]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const img = el.querySelector("img");
          const cap = el.querySelector("figcaption");
          const src = img?.getAttribute("src")?.trim();
          if (!src) return false;
          return {
            src,
            alt: img?.getAttribute("alt")?.trim() ?? "",
            caption: cap?.textContent?.trim() ?? "",
          };
        },
      },
      {
        tag: "figure.rich-text-figure",
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const img = el.querySelector("img");
          const cap = el.querySelector("figcaption");
          const src = img?.getAttribute("src")?.trim();
          if (!src) return false;
          return {
            src,
            alt: img?.getAttribute("alt")?.trim() ?? "",
            caption: cap?.textContent?.trim() ?? "",
          };
        },
      },
      {
        tag: `img.${imageClass}`,
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const src = el.getAttribute("src")?.trim();
          if (!src) return false;
          const alt = el.getAttribute("alt")?.trim() ?? "";
          return { src, alt, caption: alt };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = String(HTMLAttributes.src ?? "");
    const caption = String(HTMLAttributes.caption ?? "");
    const alt = String(HTMLAttributes.alt ?? caption);

    return [
      "figure",
      {
        class: "rich-text-figure",
        "data-rich-text-figure": "true",
      },
      [
        "img",
        {
          src,
          alt,
          class: this.options.imageClass,
        },
      ],
      ["figcaption", {}, caption],
    ];
  },

  addCommands() {
    return {
      setRichTextFigure:
        (attrs: RichTextFigureAttrs) =>
        ({ commands }) =>
          commands.insertContent(
            buildRichTextFigureHtml({
              ...attrs,
              imageClass: attrs.imageClass ?? this.options.imageClass,
            }),
          ),
      updateRichTextFigureCaption:
        (caption: string) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, {
            caption: caption.trim(),
            alt: caption.trim(),
          }),
    };
  },
});
