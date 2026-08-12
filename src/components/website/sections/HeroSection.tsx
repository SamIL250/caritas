'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDonation } from "@/context/DonationContext";
import { useMotionSafe } from '@/components/website/motion/useMotionSafe';
import ExpandableText from '@/components/website/ExpandableText';

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
    x: dir === 1 ? '100%' : '-100%',
  }),
  center: { x: 0 },
  exit: (dir: 1 | -1) => ({
    x: dir === 1 ? '-100%' : '100%',
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
    slides?: HeroSlide[];
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
  const [slideDir, setSlideDir] = useState<1 | -1>(1);

  const defaultSlide: HeroSlide = {
    heading: heading || "Restoring Hearts for Better Rwanda",
    subheading: subheading || "Through strategic humanitarian programs, social development initiatives, and faith-driven service, Caritas Rwanda works to create lasting change for the most vulnerable.",
    cta_text: cta_text || "Donate Now",
    cta_url: cta_url || "#",
    image_url: image_url || "/img/bg_3.webp",
    badge_text: options?.badge_text || "WELCOME TO CARITAS RWANDA",
    secondary_cta_text: options?.secondary_cta_text || "Volunteer with Us",
    secondary_cta_url: options?.secondary_cta_url || "#"
  };

  const slides: HeroSlide[] = options?.slides?.length
    ? options.slides
    : [defaultSlide];

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
  const displayAlignment = options?.align || 'center';
  const displayOpacity = options?.overlay_opacity ?? 0.42;
  const displayTextColor = options?.text_color || '#ffffff';

  const alignmentClass =
    displayAlignment === 'center'
      ? 'hero-slider-frame__copy--center'
      : displayAlignment === 'right'
        ? 'hero-slider-frame__copy--right'
        : 'hero-slider-frame__copy--left';

  const { openModal } = useDonation();
  const sectionRef = useRef<HTMLElement>(null);
  const { reducedMotion } = useMotionSafe();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const mediaY = useTransform(
    scrollYProgress,
    [0, 1],
    ['0%', reducedMotion ? '0%' : '15%'],
  );
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reducedMotion ? 0 : -24],
  );
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.75, 1],
    [1, 1, reducedMotion ? 1 : 0.88],
  );

  const foundingYear = 1959;
  const yearsActive = new Date().getFullYear() - foundingYear;

  const renderCta = (ctaUrl: string, ctaText: string, primary = true) => {
    const className = primary
      ? 'hero-slider-cta hero-slider-cta--primary'
      : 'hero-slider-cta hero-slider-cta--secondary';

    if (ctaUrl === '#donate') {
      return (
        <button type="button" onClick={() => openModal()} className={className}>
          {ctaText}
        </button>
      );
    }

    return (
      <Link href={ctaUrl} className={className}>
        {ctaText}
      </Link>
    );
  };

  return (
    <section ref={sectionRef} className="hero-section-home">
      <div className="hero-section-home__inner">
        <div className="hero-slider-shell">
        <div className="hero-slider-frame">
          <div aria-hidden className="sr-only">
            {slides.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`preload-img-${i}`}
                src={s.image_url}
                alt=""
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding={i === 0 ? 'sync' : 'async'}
                width={1}
                height={1}
              />
            ))}
          </div>

          <div className="hero-slider-frame__media">
            <motion.div
              className="hero-slider-frame__media-parallax"
              style={{
                y: mediaY,
                height: '115%',
                width: '100%',
                position: 'absolute',
                inset: 0,
                willChange: reducedMotion ? undefined : 'transform',
              }}
            >
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
                className="hero-slider-frame__slide-bg"
                style={{ backgroundImage: `url(${slide.image_url})` }}
              />
            </AnimatePresence>
            </motion.div>
          </div>

          <div
            className="hero-slider-frame__overlay"
            style={{ opacity: displayOpacity }}
            aria-hidden
          />

          <div className="hero-years-watermark" aria-label={`${yearsActive} years of saving lives`}>
            <span className="hero-years-watermark__num">{yearsActive}</span>
            <span className="hero-years-watermark__label">
              years of
              <br />
              saving lives
            </span>
          </div>

          <motion.div
            className="hero-slider-frame__content"
            style={{ y: contentY, opacity: contentOpacity }}
          >
            <AnimatePresence mode="wait" initial={false} custom={slideDir}>
              <motion.div
                key={`slide-content-${currentSlide}`}
                custom={slideDir}
                variants={heroSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={heroSlideTransition}
                className={`hero-slider-frame__copy ${alignmentClass}`}
              >
                {slide.badge_text && (
                  <p className="hero-slider-frame__badge">{slide.badge_text}</p>
                )}

                <h1
                  className="hero-slider-frame__title"
                  style={{ color: displayTextColor }}
                >
                  {slide.heading}
                </h1>

                <ExpandableText
                  text={slide.subheading}
                  lines={2}
                  className="hero-slider-frame__subtitle"
                  style={{ color: displayTextColor }}
                />

                <div className="hero-slider-frame__actions">
                  {slide.cta_url && slide.cta_text && renderCta(slide.cta_url, slide.cta_text, true)}
                  {slide.secondary_cta_text &&
                    renderCta(slide.secondary_cta_url || '#', slide.secondary_cta_text, false)}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous hero slide"
                className="hero-carousel-btn hero-carousel-btn--prev"
              >
                <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next hero slide"
                className="hero-carousel-btn hero-carousel-btn--next"
              >
                <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
              </button>

              <div className="hero-slider-frame__dots">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1} of ${slides.length}`}
                    aria-current={currentSlide === idx ? 'true' : undefined}
                    className={`hero-slider-frame__dot${currentSlide === idx ? ' is-active' : ''}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
