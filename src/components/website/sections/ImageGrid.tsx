"use client";

import React from "react";
import { MediaFigure } from "@/components/website/MediaCaptionProvider";

interface GridImage {
  url: string;
  alt?: string;
}

interface ImageGridProps {
  images: GridImage[];
  columns?: number;
}

const DEFAULT_IMAGES: GridImage[] = [
  { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop" },
  { url: "https://images.unsplash.com/photo-1593113515830-67eb1711de03?q=80&w=400&auto=format&fit=crop" },
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=400&auto=format&fit=crop" },
];

export default function ImageGrid({ images = DEFAULT_IMAGES, columns = 3 }: ImageGridProps) {
  const displayImages = images?.length > 0 ? images : DEFAULT_IMAGES;
  const colClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 ${colClass} gap-8`}>
          {displayImages.map((img, idx) => (
            <div key={idx} className="overflow-hidden rounded-2xl border border-stone-100 shadow-sm">
              <MediaFigure
                src={img.url}
                alt={img.alt || `Grid image ${idx + 1}`}
                figureClassName="media-grid-figure"
                imgClassName="aspect-[4/3] w-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
