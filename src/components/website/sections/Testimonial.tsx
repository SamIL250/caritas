import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar_url: string;
}

export default function Testimonial({ 
  quote = "Caritas Rwanda has been a beacon of hope for our community. Their dedication to restoring dignity and providing sustainable support has changed my life forever.", 
  author = "Marie Claire Uwimana", 
  role = "Community Beneficiary", 
  avatar_url = "/img/slide2.jpg" 
}: TestimonialProps) {
  const displayQuote = quote || "Caritas Rwanda has been a beacon of hope for our community. Their dedication to restoring dignity and providing sustainable support has changed my life forever.";
  const displayAuthor = author || "Marie Claire Uwimana";
  const displayRole = role || "Community Beneficiary";
  const displayAvatarUrl = avatar_url || "/img/slide2.jpg";
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[200px] font-serif text-stone-50 leading-none pointer-events-none select-none">
        "
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium text-stone-800 leading-snug italic">
            "{displayQuote}"
          </blockquote>
          <div className="mt-12 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-stone-50 shadow-lg">
              <img src={displayAvatarUrl} alt={displayAuthor} className="w-full h-full object-cover" />
            </div>
            <div className="mt-4">
              <div className="font-bold text-stone-900 text-lg uppercase tracking-wider">{displayAuthor}</div>
              <div className="text-[#7A1515] font-bold text-sm mt-1">{displayRole}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
