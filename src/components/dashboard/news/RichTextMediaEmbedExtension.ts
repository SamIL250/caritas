import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import {
  buildMediaEmbedHtml,
  parseMediaEmbedUrl,
  type MediaEmbedInfo,
} from "@/lib/rich-text-media-embed";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mediaEmbed: {
      setMediaEmbed: (info: MediaEmbedInfo) => ReturnType;
    };
  }
}

export const RichTextMediaEmbed = Node.create({
  name: "mediaEmbed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      provider: { default: "youtube" },
      videoId: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-media-embed="youtube"]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const videoId = el.getAttribute("data-video-id")?.trim();
          return videoId ? { provider: "youtube", videoId } : false;
        },
      },
      {
        tag: 'div[data-media-embed="vimeo"]',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const videoId = el.getAttribute("data-video-id")?.trim();
          return videoId ? { provider: "vimeo", videoId } : false;
        },
      },
      {
        tag: 'div.rich-media-embed',
        getAttrs: (el) => {
          if (!(el instanceof HTMLElement)) return false;
          const provider = el.getAttribute("data-media-embed")?.trim();
          const videoId = el.getAttribute("data-video-id")?.trim();
          if (!provider || !videoId) return false;
          if (provider !== "youtube" && provider !== "vimeo") return false;
          return { provider, videoId };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const provider = HTMLAttributes.provider as string;
    const videoId = HTMLAttributes.videoId as string;
    const info = parseMediaEmbedUrl(
      provider === "vimeo" ? `https://vimeo.com/${videoId}` : `https://youtu.be/${videoId}`,
    );
    if (!info) {
      return ["div", mergeAttributes(HTMLAttributes, { class: "rich-media-embed" })];
    }
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "rich-media-embed",
        "data-media-embed": info.provider,
        "data-video-id": info.videoId,
      }),
      [
        "iframe",
        {
          src: info.embedUrl,
          title: info.provider === "youtube" ? "YouTube video embed" : "Vimeo video embed",
          loading: "lazy",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          referrerpolicy: "strict-origin-when-cross-origin",
          allowfullscreen: "true",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setMediaEmbed:
        (info: MediaEmbedInfo) =>
        ({ commands }) =>
          commands.insertContent(buildMediaEmbedHtml(info)),
    };
  },

  addProseMirrorPlugins() {
    const nodeType = this.type;

    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const text = event.clipboardData?.getData("text/plain")?.trim();
            if (!text) return false;

            const info = parseMediaEmbedUrl(text);
            if (!info) return false;

            event.preventDefault();
            const node = nodeType.create({
              provider: info.provider,
              videoId: info.videoId,
            });
            const { state, dispatch } = view;
            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
            return true;
          },
        },
      }),
    ];
  },
});
