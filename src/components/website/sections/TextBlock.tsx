import React from 'react';

interface TextBlockProps {
  heading: string;
  body: string;
  alignment?: 'left' | 'center' | 'right';
}

export default function TextBlock({
  heading = "Section heading",
  body = "",
  alignment = "left",
}: TextBlockProps) {
  const displayHeading = heading || "Section heading";
  const displayBody = body;
  
  const alignmentClass = alignment === 'center' ? 'text-center mx-auto' : alignment === 'right' ? 'text-right ml-auto' : 'text-left';

  return (
    <section className="py-24 bg-white">
      <div className={`container mx-auto px-4 max-w-4xl ${alignmentClass}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
          {displayHeading}
        </h2>
        <div className="mt-8 text-lg text-stone-600 leading-relaxed space-y-4 whitespace-pre-line">
          {displayBody}
        </div>
      </div>
    </section>
  );
}
