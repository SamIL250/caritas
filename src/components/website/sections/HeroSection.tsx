'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDonation } from "@/context/DonationContext";

/** Shortest wrap-aware direction for carousel slides (+1 = incoming from right). */
function navigateDirection(from: number, to: number, len: number): 1 | -1 {
  if (len <= 1 || from === to) return 1;
  const forward = (to - from + len) % len;
  const backward = (from - to + len) % len;
  return forward <= backward ? 1 : -1;
}

const HERO_SLIDE_EASE = [0.32, 0.72, 0, 1] as const;

const heroSlideVariants = {
  enter: (dir: 1 | -1) => ({
    x: dir === 1 ? '100vw' : '-100vw',
  }),
  center: { x: 0 },
  exit: (dir: 1 | -1) => ({
    x: dir === 1 ? '-100vw' : '100vw',
  }),
};

const heroSlideTransition = { duration: 0.72, ease: HERO_SLIDE_EASE };

interface HeroSlide {
  heading: string;
  subheading: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  badge_text?: string;
  secondary_cta_text?: string;
  secondary_cta_url?: string;
}

interface HeroSectionProps {
  heading: string;
  subheading: string;
  cta_text: string;
  cta_url: string;
  image_url: string;
  options?: {
    align?: 'left' | 'center' | 'right';
    overlay_opacity?: number;
    text_color?: string;
    badge_text?: string;
    secondary_cta_text?: string;
    secondary_cta_url?: string;
    slides?: HeroSlide[]; // Support for multiple slides
  };
}

export default function HeroSection({ 
  heading, 
  subheading, 
  cta_text, 
  cta_url, 
  image_url,
  options
}: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  /** +1 = advance (next / shorter forward path); -1 = retreat (prev / shorter backward path). */
  const [slideDir, setSlideDir] = useState<1 | -1>(1);

  // Define default slide
  const defaultSlide: HeroSlide = {
    heading: heading || "Restoring Hearts for Better Rwanda",
    subheading: subheading || "Through strategic humanitarian programs, social development initiatives, and faith-driven service, Caritas Rwanda works to create lasting change for the most vulnerable.",
    cta_text: cta_text || "Donate Now",
    cta_url: cta_url || "#",
    image_url: image_url || "/img/bg_3.png",
    badge_text: options?.badge_text || "WELCOME TO CARITAS RWANDA",
    secondary_cta_text: options?.secondary_cta_text || "Volunteer with Us",
    secondary_cta_url: options?.secondary_cta_url || "#"
  };

  // Combine default slide with any additional slides from options
  const slides: HeroSlide[] = options?.slides?.length 
    ? options.slides 
    : [defaultSlide];

  // Auto-play carousel — restart interval whenever slide changes so arrows/dots reset the 6s pause
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        setSlideDir(navigateDirection(prev, next, slides.length));
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, currentSlide]);

  const goPrev = () => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    setSlideDir(navigateDirection(currentSlide, prev, slides.length));
    setCurrentSlide(prev);
  };

  const goNext = () => {
    const next = (currentSlide + 1) % slides.length;
    setSlideDir(navigateDirection(currentSlide, next, slides.length));
    setCurrentSlide(next);
  };

  const goToSlide = (idx: number) => {
    if (idx === currentSlide) return;
    setSlideDir(navigateDirection(currentSlide, idx, slides.length));
    setCurrentSlide(idx);
  };

  const slide = slides[currentSlide];
  const displayAlignment = options?.align || 'left';
  const displayOpacity = options?.overlay_opacity ?? 0.45;
  const displayTextColor = options?.text_color || '#ffffff';

  const alignmentClass = displayAlignment === 'center' ? 'text-center items-center mx-auto' : displayAlignment === 'right' ? 'text-right items-end ml-auto' : 'text-left items-start';
  
  const { openModal } = useDonation();
  
  return (
    <section className="relative h-screen flex items-center pt-20 overflow-hidden bg-stone-900 font-poppins">
      {/* overflow-hidden clips sliding layers so nothing flashes the fallback bg between slides */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="sync" initial={false} custom={slideDir}>
          <motion.div
            key={`slide-bg-${currentSlide}`}
            role="presentation"
            custom={slideDir}
            variants={heroSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={heroSlideTransition}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image_url})` }}
          />
        </AnimatePresence>
      </div>
      
      {/* Dynamic Overlay */}
      <div 
        className="absolute inset-0 z-1"
        style={{ background: `rgba(0,0,0,${displayOpacity})` }}
      />
      
      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className={`flex flex-col max-w-4xl ${alignmentClass}`}>
          <AnimatePresence mode="wait" initial={false} custom={slideDir}>
            <motion.div
              key={`slide-content-${currentSlide}`}
              custom={slideDir}
              variants={heroSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={heroSlideTransition}
              className={`flex flex-col ${alignmentClass}`}
            >
              {/* Hero Badge */}
              {slide.badge_text && (
                <div className="inline-block px-10 py-3.5 rounded border border-white/20 text-[11px] md:text-[12px] font-medium text-white uppercase tracking-[0.2em] mb-8">
                  {slide.badge_text}
                </div>
              )}

              <h1 
                className="text-[2.2rem] sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] mb-6 tracking-[-0.02em]"
                style={{ color: displayTextColor }}
              >
                {slide.heading}
              </h1>
              
              <p 
                className="text-base md:text-lg leading-[1.7] mb-10 max-w-2xl opacity-90 font-normal"
                style={{ color: displayTextColor }}
              >
                {slide.subheading}
              </p>
              
              <div className="flex flex-wrap gap-4">
                {slide.cta_url && slide.cta_text && (
                  slide.cta_url === '#donate' ? (
                    <button 
                      onClick={() => openModal()}
                      className="inline-flex items-center gap-3 px-12 py-5 bg-primary-orange text-white text-[0.88rem] font-medium tracking-wide rounded-lg hover:bg-primary-orange-hover transition-colors"
                    >
                      {slide.cta_text}
                      <span className="text-sm">→</span>
                    </button>
                  ) : (
                    <Link 
                      href={slide.cta_url}
                      className="inline-flex items-center gap-3 px-12 py-5 bg-primary-orange text-white text-[0.88rem] font-medium tracking-wide rounded-lg hover:bg-primary-orange-hover transition-colors"
                    >
                      {slide.cta_text}
                      <span className="text-sm">→</span>
                    </Link>
                  )
                )}
                
                {slide.secondary_cta_text && (
                  slide.secondary_cta_url === '#donate' ? (
                    <button 
                      onClick={() => openModal()}
                      className="inline-flex items-center gap-3 px-12 py-5 bg-transparent border border-white/25 text-white text-[0.88rem] font-medium tracking-wide rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {slide.secondary_cta_text}
                    </button>
                  ) : (
                    <Link 
                      href={slide.secondary_cta_url || '#'}
                      className="inline-flex items-center gap-3 px-12 py-5 bg-transparent border border-white/25 text-white text-[0.88rem] font-medium tracking-wide rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {slide.secondary_cta_text}
                    </Link>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous hero slide"
            className="hero-carousel-btn hero-carousel-btn--prev"
          >
            <ChevronLeft size={26} strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next hero slide"
            className="hero-carousel-btn hero-carousel-btn--next"
          >
            <ChevronRight size={26} strokeWidth={2.25} aria-hidden />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1} of ${slides.length}`}
              aria-current={currentSlide === idx ? 'true' : undefined}
              className={`h-1 transition-all duration-300 rounded-full ${
                currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
