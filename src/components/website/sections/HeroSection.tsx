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
    <section className="relative min-h-[90vh] lg:h-screen lg:min-h-[800px] flex items-center pt-28 pb-16 sm:pt-36 sm:pb-20 md:pt-40 md:pb-24 lg:pt-44 lg:pb-28 overflow-hidden bg-stone-950 font-poppins">
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
      
      {/* Dynamic Overlay - Matches original .hero-slide.active::after */}
      <div 
        className="absolute inset-0 z-1 bg-black/45 transition-opacity duration-1000"
        style={{ opacity: displayOpacity }}
      />
      
      {/* Radial Glow (Matches original .hero::before) */}
      <div className="absolute inset-0 z-2 bg-[radial-gradient(circle_at_20%_50%,rgba(140,34,8,0.15)_0%,transparent_50%)] pointer-events-none" />
      
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
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[10px] md:text-xs font-semibold tracking-wider text-white uppercase mb-5 shadow-lg shadow-black/10 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-orange animate-pulse mr-2" />
                  {slide.badge_text}
                </div>
              )}

              <h1 
                className="!text-3xl sm:!text-5xl md:!text-6xl lg:!text-7xl !font-extrabold !leading-[1.15] !mb-5 !tracking-tight"
                style={{ 
                  color: displayTextColor,
                  textShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}
              >
                {slide.heading}
              </h1>
              
              <p 
                className="!text-sm sm:!text-base md:!text-lg lg:!text-xl !leading-relaxed !mb-8 !max-w-2xl !opacity-85 !font-normal"
                style={{ 
                  color: displayTextColor,
                  textShadow: '0 2px 8px rgba(0,0,0,0.25)'
                }}
              >
                {slide.subheading}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-5 !mt-2">
                {slide.cta_url && slide.cta_text && (
                  slide.cta_url === '#donate' ? (
                    <button 
                      onClick={() => openModal()}
                      className="!px-7 sm:!px-8 !py-3.5 sm:!py-4 !bg-primary-orange !text-white !font-bold !uppercase !tracking-wider !text-[11px] sm:!text-xs !rounded-full hover:!bg-primary-orange-hover !transition-all hover:!scale-[1.03] active:!scale-[0.98] !shadow-[0_10px_30px_-8px_rgba(140,34,8,0.45)] !flex !items-center !gap-2.5 !group !relative !overflow-hidden"
                    >
                      <span className="relative z-10">{slide.cta_text}</span>
                      <span className="relative z-10 group-hover:translate-x-1 !transition-transform !duration-300">→</span>
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                  ) : (
                    <Link 
                      href={slide.cta_url}
                      className="!px-7 sm:!px-8 !py-3.5 sm:!py-4 !bg-primary-orange !text-white !font-bold !uppercase !tracking-wider !text-[11px] sm:!text-xs !rounded-full hover:!bg-primary-orange-hover !transition-all hover:!scale-[1.03] active:!scale-[0.98] !shadow-[0_10px_30px_-8px_rgba(140,34,8,0.45)] !flex !items-center !gap-2.5 !group !relative !overflow-hidden"
                    >
                      <span className="relative z-10">{slide.cta_text}</span>
                      <span className="relative z-10 group-hover:translate-x-1 !transition-transform !duration-300">→</span>
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </Link>
                  )
                )}
                
                {slide.secondary_cta_text && (
                  slide.secondary_cta_url === '#donate' ? (
                    <button 
                      onClick={() => openModal()}
                      className="!px-7 sm:!px-8 !py-3.5 sm:!py-4 !bg-white/5 !backdrop-blur-md !border !border-white/15 !text-white !font-bold !uppercase !tracking-wider !text-[11px] sm:!text-xs !rounded-full hover:!bg-white/10 hover:!border-white/25 !transition-all hover:!scale-[1.03] active:!scale-[0.98] !flex !items-center !gap-2 !shadow-lg !shadow-black/5"
                    >
                      {slide.secondary_cta_text}
                    </button>
                  ) : (
                    <Link 
                      href={slide.secondary_cta_url || '#'}
                      className="!px-7 sm:!px-8 !py-3.5 sm:!py-4 !bg-white/5 !backdrop-blur-md !border !border-white/15 !text-white !font-bold !uppercase !tracking-wider !text-[11px] sm:!text-xs !rounded-full hover:!bg-white/10 hover:!border-white/25 !transition-all hover:!scale-[1.03] active:!scale-[0.98] !flex !items-center !gap-2 !shadow-lg !shadow-black/5"
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
            className="!hidden md:!inline-flex hero-carousel-btn hero-carousel-btn--prev"
          >
            <ChevronLeft size={24} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next hero slide"
            className="!hidden md:!inline-flex hero-carousel-btn hero-carousel-btn--next"
          >
            <ChevronRight size={24} strokeWidth={2} aria-hidden />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1} of ${slides.length}`}
              aria-current={currentSlide === idx ? 'true' : undefined}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                currentSlide === idx ? 'w-8 bg-[#8c2208]' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
