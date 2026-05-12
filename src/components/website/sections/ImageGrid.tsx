import React from 'react';

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
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=400&auto=format&fit=crop" }
];

export default function ImageGrid({ images = DEFAULT_IMAGES, columns = 3 }: ImageGridProps) {
  const displayImages = images?.length > 0 ? images : DEFAULT_IMAGES;
  const colClass = columns === 2 ? 'md:grid-cols-2' : columns === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 ${colClass} gap-8`}>
          {displayImages.map((img, idx) => (
            <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
              <img 
                src={img.url} 
                alt={img.alt || `Grid image ${idx + 1}`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
