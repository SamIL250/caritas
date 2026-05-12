import React from 'react';

interface GalleryImage {
  url: string;
}

interface GalleryProps {
  images: GalleryImage[];
  caption?: string;
}

const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop" },
  { url: "https://images.unsplash.com/photo-1593113515830-67eb1711de03?q=80&w=400&auto=format&fit=crop" },
  { url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=400&auto=format&fit=crop" },
  { url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400&auto=format&fit=crop" },
  { url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400&auto=format&fit=crop" }
];

export default function Gallery({ images = DEFAULT_GALLERY_IMAGES, caption }: GalleryProps) {
  const displayImages = images?.length > 0 ? images : DEFAULT_GALLERY_IMAGES;
  return (
    <section className="py-24 bg-stone-900 text-white">
      <div className="container mx-auto px-4">
        {caption && (
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <p className="text-xl font-medium text-stone-300 italic">{caption}</p>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayImages.map((img, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-2xl group ${
                idx % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <img 
                src={img.url} 
                alt={`Gallery image ${idx + 1}`}
                className="w-full h-full object-cover aspect-square transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <i className="fa-solid fa-magnifying-glass text-white text-2xl"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
