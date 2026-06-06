'use client';

import Link from 'next/link';

export default function AboutSection(_props: Record<string, unknown> = {}) {
  return (
    <section className="bg-[#8b221d]">
      <img
        src="/img/about_bg.webp"
        alt="Caritas Rwanda Network — About Us"
        className="w-full select-none pointer-events-none"
        draggable={false}
        loading="lazy"
      />
      <div className="container mx-auto px-4 md:px-12">
        <div className="border-t border-white/10 mt-8 md:mt-20" />
        <div className="flex justify-center py-7 md:py-9">
          <Link
            href="/about"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '9999px',
              padding: '14px 44px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textDecoration: 'none',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
          >
            Read More
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.4)',
                fontSize: '11px',
                lineHeight: 1,
              }}
            >
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
