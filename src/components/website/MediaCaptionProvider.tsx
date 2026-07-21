"use client";

import React, { createContext, useContext, useMemo } from "react";
import { lookupMediaCaption } from "@/lib/media-captions";

type MediaCaptionContextValue = {
  lookup: (url: string | null | undefined) => string | null;
};

const MediaCaptionContext = createContext<MediaCaptionContextValue | null>(null);

export function MediaCaptionProvider({
  captions,
  children,
}: {
  captions: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useMemo<MediaCaptionContextValue>(() => {
    const map = new Map<string, string>(Object.entries(captions));
    return {
      lookup: (url) => lookupMediaCaption(map, url),
    };
  }, [captions]);

  return <MediaCaptionContext.Provider value={value}>{children}</MediaCaptionContext.Provider>;
}

export function useMediaCaption(url: string | null | undefined): string | null {
  const ctx = useContext(MediaCaptionContext);
  if (!ctx) return null;
  return ctx.lookup(url);
}

type MediaFigureProps = {
  src: string;
  alt?: string;
  caption?: string | null;
  /** Hide caption (e.g. hero backgrounds, decorative thumbnails). */
  hideCaption?: boolean;
  className?: string;
  imgClassName?: string;
  figureClassName?: string;
  captionClassName?: string;
};

export function MediaFigure({
  src,
  alt,
  caption: captionProp,
  hideCaption = false,
  className,
  imgClassName,
  figureClassName,
  captionClassName,
}: MediaFigureProps) {
  const lookedUp = useMediaCaption(src);
  const caption = !hideCaption ? (captionProp?.trim() || lookedUp?.trim() || "") : "";

  if (!caption) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} className={imgClassName ?? className} />
    );
  }

  return (
    <figure className={figureClassName ?? `media-figure ${className ?? ""}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt ?? caption} className={imgClassName ?? className} />
      <figcaption className={captionClassName ?? "media-figure-caption"}>{caption}</figcaption>
    </figure>
  );
}
