'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Check,
  Save,
  Loader2,
  X,
  Home,
  Layers,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { MediaPicker } from '@/components/dashboard/MediaPicker';
import { createClient } from '@/lib/supabase/client';
import { SECTION_ICONS, SECTION_LABELS, DEFAULT_SECTION_CONTENT } from '@/lib/constants';
import { FEATURED_CAMPAIGN_SIDEBAR_MAX } from '@/lib/featured-campaign-home-data';
import { 
  saveSection, 
  saveHero, 
  deleteSection, 
  toggleSectionVisibility, 
  reorderSections,
  addSection,
  updatePageStatus,
  updatePageTitle,
  addSlide,
  saveSlide,
  deleteSlide,
  reorderSlides
} from '@/app/actions/sections';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Public Components for Preview
import HeroSection from '@/components/website/sections/HeroSection';
import TextBlock from '@/components/website/sections/TextBlock';
import ImageGrid from '@/components/website/sections/ImageGrid';
import Testimonial from '@/components/website/sections/Testimonial';
import CTA from '@/components/website/sections/CTA';
import type { CtaImpactPanel, CtaSidebarCard } from '@/components/website/sections/CTA';
import PartnersSection from '@/components/website/sections/PartnersSection';
import NewsCards from '@/components/website/sections/NewsCards';
import ContactInfo from '@/components/website/sections/ContactInfo';
import Gallery from '@/components/website/sections/Gallery';
import Divider from '@/components/website/sections/Divider';
import ProgramCards from '@/components/website/sections/ProgramCards';
import OurLocationSection from '@/components/website/sections/OurLocationSection';
import PageHeroSection from '@/components/website/sections/PageHeroSection';
import StatsBannerSection from '@/components/website/sections/StatsBannerSection';
import FeaturedQuoteSection from '@/components/website/sections/FeaturedQuoteSection';
import TimelineSection from '@/components/website/sections/TimelineSection';
import PillarCardsSection from '@/components/website/sections/PillarCardsSection';
import ValuesGridSection from '@/components/website/sections/ValuesGridSection';
import NetworkSection from '@/components/website/sections/NetworkSection';
import LeadershipGridSection from '@/components/website/sections/LeadershipGridSection';
import AboutSection from '@/components/website/sections/AboutSection';
import VideoGallerySection from '@/components/website/sections/VideoGallerySection';
import DioceseMapSection from '@/components/website/sections/DioceseMapSection';
import NewsLandingHero from '@/components/website/news/NewsLandingHero';
import NewsNewsletterFooter from '@/components/website/news/NewsNewsletterFooter';
import NewsFeedSectionPreview from '@/components/dashboard/pages/NewsFeedSectionPreview';
import PublicationsLandingHero from '@/components/website/publications/PublicationsLandingHero';
import PublicationsFeedSectionPreview from '@/components/dashboard/pages/PublicationsFeedSectionPreview';
import FeaturedCampaignSectionPreview from '@/components/dashboard/pages/FeaturedCampaignSectionPreview';
import type { PublishedNewsArticle } from '@/app/(website)/news/get-news-data';
import type { PublicationCategoryRow, PublicationRow } from '@/lib/publications';
import { ImageIcon } from 'lucide-react';

import '@/app/website-cms-section-preview.css';
import '@/app/home-about-section.css';
import '@/app/program-tabs-section.css';
import '@/app/resources-impact-section.css';
import '@/app/about-page-editor-preview.css';
import '@/app/video-gallery-section.css';
import '@/app/(website)/news/news-page.css';
import '@/app/(website)/publications/publications-page.css';
import '@/app/diocese-map-section.css';

/** Default / minimum width for the section list + form sidebar (cannot shrink below). */
const EDITOR_SIDEBAR_WIDTH_MIN = 280;
/** Sidebar cannot extend beyond min(600px, 50% of viewport). */
const EDITOR_SIDEBAR_WIDTH_MAX_CAP = 600;
/** Below this preview canvas width we show the mobile frame. */
const PREVIEW_AUTO_BREAK_MOBILE = 440;
/** Below this width we show tablet frame; wider → desktop preview. */
const PREVIEW_AUTO_BREAK_TABLET = 900;

function getEditorSidebarMaxPx(viewportInnerWidth: number): number {
  return Math.min(EDITOR_SIDEBAR_WIDTH_MAX_CAP, Math.floor(viewportInnerWidth * 0.5));
}

function clampSidebarWidth(px: number, vw: number): number {
  const max = Math.max(EDITOR_SIDEBAR_WIDTH_MIN, getEditorSidebarMaxPx(vw));
  return Math.min(Math.max(px, EDITOR_SIDEBAR_WIDTH_MIN), max);
}

function previewModeFromCanvasWidth(px: number): 'desktop' | 'tablet' | 'mobile' {
  if (px < PREVIEW_AUTO_BREAK_MOBILE) return 'mobile';
  if (px < PREVIEW_AUTO_BREAK_TABLET) return 'tablet';
  return 'desktop';
}

const LS_SIDEBAR_WIDTH = 'pageEditor.sidebarWidth';

function resolveDeepLinkedSection(
  sectionId: string | undefined | null,
  sectionList: unknown[],
): { selectedId: string | null; localState: unknown } {
  if (!sectionId || !sectionList?.length) return { selectedId: null, localState: null };
  const section = sectionList.find((s: unknown) => (s as { id: string }).id === sectionId) as
    | { id: string; content?: unknown }
    | undefined;
  if (!section) return { selectedId: null, localState: null };
  return { selectedId: sectionId, localState: section.content || {} };
}

interface PageEditorProps {
  initialPage: any;
  initialHero: any;
  initialSections: any[];
  initialSlides: any[];
  /** When editing the News CMS page: published articles for Article listing preview. */
  newsFeedPreview?: {
    featuredArticle: PublishedNewsArticle | null;
    gridArticles: PublishedNewsArticle[];
  } | null;
  /** When editing the Publications CMS page: published rows + categories for the library preview. */
  publicationsFeedPreview?: {
    publications: PublicationRow[];
    categories: PublicationCategoryRow[];
  } | null;
  /** Deep-link from Campaigns dashboard: select this section UUID on load (e.g. Featured campaign). */
  initialSelectedSectionId?: string;
}

export default function PageEditorClient({
  initialPage,
  initialHero,
  initialSections,
  initialSlides,
  newsFeedPreview = null,
  publicationsFeedPreview = null,
  initialSelectedSectionId,
}: PageEditorProps) {
  const [page, setPage] = useState(initialPage);
  const [hero, setHero] = useState(initialHero);
  const [sections, setSections] = useState(initialSections);
  const [slides, setSlides] = useState(initialSlides);

  const deepLinked = resolveDeepLinkedSection(initialSelectedSectionId, initialSections);

  const [selectedId, setSelectedId] = useState<string | null>(deepLinked.selectedId); // 'hero' or section.id or 'slides'
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [localState, setLocalState] = useState<any>(deepLinked.localState);
  const localStateRef = useRef<any>(deepLinked.localState);

  useEffect(() => {
    localStateRef.current = localState;
  }, [localState]);
  const [slideState, setSlideState] = useState<any>(null); // For editing a specific slide
  
  const [hasChanges, setHasChanges] = useState(false);
  const [slideHasChanges, setSlideHasChanges] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);
  const [showSlideMediaPicker, setShowSlideMediaPicker] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedSlideId) {
      const slide = slides.find((s: any) => s.id === selectedSlideId);
      if (slide) {
        setSlideState(slide);
        setSlideHasChanges(false);
      }
    } else {
      setSlideState(null);
    }
  }, [selectedSlideId, slides]);

  // Slide Handlers
  const handleAddSlide = async () => {
    try {
      const newSlide = await addSlide(page.id, slides.length);
      setSlides([...slides, newSlide]);
      setSelectedSlideId(newSlide.id);
    } catch (err: any) {
      setErrorDetails(`Failed to add slide: ${err.message}`);
    }
  };

  const handleDeleteSlide = async () => {
    if (!slideToDelete) return;
    try {
      await deleteSlide(slideToDelete);
      setSlides(slides.filter((s: any) => s.id !== slideToDelete));
      if (selectedSlideId === slideToDelete) setSelectedSlideId(null);
      setSlideToDelete(null);
    } catch (err: any) {
      setErrorDetails(`Failed to delete slide: ${err.message}`);
    }
  };

  const handleSaveSlide = async () => {
    if (!selectedSlideId || !slideState) return;
    setSaving(true);
    try {
      await saveSlide(selectedSlideId, slideState);
      setSlides(slides.map((s: any) => s.id === selectedSlideId ? { ...s, ...slideState } : s));
      setSlideHasChanges(false);
      setSavedAt(new Date());
    } catch (err: any) {
      setErrorDetails(`Failed to save slide: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'preview' | 'full'>('preview');
  const [isStale, setIsStale] = useState(false);

  const [leftPanelWidth, setLeftPanelWidth] = useState(EDITOR_SIDEBAR_WIDTH_MIN);
  const [previewCanvasWidth, setPreviewCanvasWidth] = useState(1200);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  const previewCanvasRef = useRef<HTMLDivElement | null>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState<string | null>(null); // target id to switch to

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isAboutPage = page.slug === 'about';
  const isNewsPage = page.slug === 'news';
  const isPublicationsPage = page.slug === 'publications';
  const editorWarmChrome = isAboutPage || isNewsPage || isPublicationsPage;

  const autoPreviewMode = useMemo(
    () => previewModeFromCanvasWidth(previewCanvasWidth),
    [previewCanvasWidth]
  );

  /** When set, manual device frame; when null, follow canvas width (auto). */
  const [previewDeviceOverride, setPreviewDeviceOverride] = useState<
    'desktop' | 'tablet' | 'mobile' | null
  >(null);

  const effectivePreviewMode = previewDeviceOverride ?? autoPreviewMode;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(LS_SIDEBAR_WIDTH);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) {
        setLeftPanelWidth(clampSidebarWidth(n, window.innerWidth));
      }
    }
  }, []);

  /** Live viewport inner width — sidebar max clamp, aria-values, key resize. */
  const [viewportInnerWidth, setViewportInnerWidth] = useState(1200);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setViewportInnerWidth(w);
      setLeftPanelWidth((prev) => clampSidebarWidth(prev, w));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Same upper bound used by clampSidebarWidth (may exceed 50vw on narrow viewports to honour the 280px minimum). */
  const sidebarMaxPx = Math.max(EDITOR_SIDEBAR_WIDTH_MIN, getEditorSidebarMaxPx(viewportInnerWidth));

  useEffect(() => {
    const el = previewCanvasRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setPreviewCanvasWidth(Math.round(w));
    };
    measure();
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number' && w > 0) setPreviewCanvasWidth(Math.round(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [leftPanelWidth, activeTab]);

  const beginSidebarResize = useCallback((clientX: number) => {
    resizeStartRef.current = { x: clientX, width: leftPanelWidth };
    setIsResizingSidebar(true);
  }, [leftPanelWidth]);

  const onSidebarResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      beginSidebarResize(e.clientX);
    },
    [beginSidebarResize]
  );

  const onSidebarResizeStartTouch = useCallback(
    (e: React.TouchEvent) => {
      const x = e.touches[0]?.clientX;
      if (x == null) return;
      e.preventDefault();
      beginSidebarResize(x);
    },
    [beginSidebarResize]
  );

  useEffect(() => {
    if (!isResizingSidebar) return;
    const clientXFrom = (e: MouseEvent | TouchEvent): number => {
      if ('touches' in e && e.touches.length) return e.touches[0].clientX;
      return (e as MouseEvent).clientX;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      const start = resizeStartRef.current;
      if (!start) return;
      if ('touches' in e && e.cancelable) e.preventDefault();
      const vw = window.innerWidth;
      const max = Math.max(EDITOR_SIDEBAR_WIDTH_MIN, getEditorSidebarMaxPx(vw));
      const dx = clientXFrom(e) - start.x;
      const next = Math.min(Math.max(start.width + dx, EDITOR_SIDEBAR_WIDTH_MIN), max);
      setLeftPanelWidth(next);
    };
    const onUp = () => {
      resizeStartRef.current = null;
      setIsResizingSidebar(false);
      setViewportInnerWidth(window.innerWidth);
      setLeftPanelWidth((w) => {
        const clamped = clampSidebarWidth(w, window.innerWidth);
        try {
          window.localStorage.setItem(LS_SIDEBAR_WIDTH, String(clamped));
        } catch {
          /* ignore */
        }
        return clamped;
      });
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.documentElement.style.touchAction = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.documentElement.style.touchAction = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [isResizingSidebar]);

  const previewFrameWidthStyle = useMemo(() => {
    const w = previewCanvasWidth;
    if (effectivePreviewMode === 'desktop') return '100%';
    if (effectivePreviewMode === 'tablet') return `${Math.min(768, w)}px`;
    return `${Math.min(375, w)}px`;
  }, [previewCanvasWidth, effectivePreviewMode]);

  // --- Handlers ---

  const handleSelectSection = (id: string | null) => {
    if (hasChanges) {
      setShowUnsavedConfirm(id);
      return;
    }

    setSelectedId(id);
    if (id === 'hero') {
      setLocalState(hero);
    } else if (id) {
      const section = sections.find(s => s.id === id);
      setLocalState(section?.content || {});
    } else {
      setLocalState(null);
    }
    setHasChanges(false);
  };

  const handleUpdateLocal = (key: string, value: any) => {
    setLocalState((prev: any) => ({
      ...prev,
      [key]: typeof value === 'function' ? value(prev[key], prev) : value,
    }));
    setHasChanges(true);
  };

  const handleUpdateOptionsLocal = (key: string, value: any) => {
    setLocalState((prev: any) => ({
      ...prev,
      options: { ...prev.options, [key]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const snapshot = localStateRef.current;
    try {
      if (selectedId === 'hero') {
        await saveHero(page.id, snapshot);
        setHero(snapshot);
      } else if (selectedId) {
        const sectionType = sections.find((s) => s.id === selectedId)?.type || '';
        await saveSection(selectedId, sectionType, snapshot);
        setSections((prev) =>
          prev.map((s) => (s.id === selectedId ? { ...s, content: snapshot } : s)),
        );
      }
      setHasChanges(false);
      setSavedAt(new Date());
      setIsStale(true);
      setTimeout(() => setSavedAt(null), 2000);
    } catch (error: any) {
      console.error('Save failed:', error);
      setErrorDetails(`Failed to save changes: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || selectedId === 'hero') return;
    try {
      await deleteSection(selectedId);
      setSections(sections.filter(s => s.id !== selectedId));
      setSelectedId(null);
      setLocalState(null);
      setShowDeleteConfirm(false);
      setIsStale(true);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await toggleSectionVisibility(id, !current);
      setSections(sections.map(s => s.id === id ? { ...s, visible: !current } : s));
      setIsStale(true);
    } catch (error) {
      console.error('Toggle visibility failed:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections);
      
      const orders = newSections.map((s, idx) => ({ id: s.id, order: (idx + 1) * 10 }));
      await reorderSections(orders);
      setIsStale(true);
    }
  };

  const handleAddSection = async (type: string) => {
    try {
      const lastOrder = sections.length > 0 ? sections[sections.length - 1].order : 0;
      const newSection = await addSection(page.id, type, DEFAULT_SECTION_CONTENT[type] || {}, lastOrder + 10);
      setSections([...sections, newSection]);
      setShowAddModal(false);
      handleSelectSection(newSection.id);
      setIsStale(true);
    } catch (error: any) {
      console.error('Add section failed:', error);
      setErrorDetails(`Failed to add section: ${error.message}`);
    }
  };

  const handlePublishToggle = async () => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      await updatePageStatus(page.id, newStatus);
      setPage({ ...page, status: newStatus });
      setIsStale(true);
    } catch (error: any) {
      console.error('Status update failed:', error);
      setErrorDetails(`Failed to update status: ${error.message}`);
    }
  };

  // --- Render Helpers ---

  const renderPreview = () => {
    if (selectedId === 'hero') {
      if (page.slug === 'about') {
        const o = localState.options || {};
        const qn = Array.isArray(o.quick_nav)
          ? o.quick_nav.map((n: any) => ({
              label: String(n.label || ''),
              href: String(n.href || '#'),
              icon: typeof n.icon === 'string' ? n.icon.replace(/^fa-solid\s+/i, '').trim() : undefined,
            }))
          : [];
        return (
          <PageHeroSection
            eyebrow={(o.badge_text as string) || 'About Caritas Rwanda'}
            heading={localState.heading}
            headingAccent={typeof o.heading_accent === 'string' ? o.heading_accent : ''}
            subheading={localState.subheading}
            imageUrl={localState.image_url}
            breadcrumbLabel="About Us"
            quickNav={qn}
          />
        );
      }
      if (page.slug === 'news') {
        const o = localState.options || {};
        const accent =
          typeof o.heading_accent === 'string' && o.heading_accent.trim()
            ? String(o.heading_accent)
            : 'Updates';
        return (
          <div className="w-full shrink-0">
            <NewsLandingHero
              eyebrow={(typeof o.badge_text === 'string' && o.badge_text.trim())
                ? String(o.badge_text)
                : 'Latest from Caritas Rwanda'}
              headlinePrefix={typeof localState.heading === 'string' ? localState.heading : 'News &'}
              headlineAccent={accent}
              intro={typeof localState.subheading === 'string' ? localState.subheading : ''}
              heroImageUrl={typeof localState.image_url === 'string' ? localState.image_url : null}
            >
              <div className="news-hero-search">
                <input
                  readOnly
                  tabIndex={-1}
                  type="search"
                  placeholder="Search articles…"
                  aria-label="Search (preview)"
                />
                <span className="search-icon" aria-hidden>
                  <i className="fa-solid fa-magnifying-glass" />
                </span>
              </div>
              <nav className="news-breadcrumb mt-3" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>›</span>
                <span>News</span>
              </nav>
            </NewsLandingHero>
          </div>
        );
      }
      if (page.slug === 'publications') {
        const o = localState.options || {};
        const eyebrow =
          typeof o.badge_text === 'string' && o.badge_text.trim()
            ? String(o.badge_text)
            : 'Knowledge & Transparency';
        const headlinePrefix =
          typeof localState.heading === 'string' ? localState.heading : 'Publications &';
        const headlineAccent =
          typeof o.heading_accent === 'string' && o.heading_accent.trim()
            ? String(o.heading_accent)
            : 'Resources';
        const intro = typeof localState.subheading === 'string' ? localState.subheading : '';
        return (
          <div className="w-full shrink-0">
            <PublicationsLandingHero
              eyebrow={eyebrow}
              headlinePrefix={headlinePrefix}
              headlineAccent={headlineAccent}
              intro={intro}
            />
          </div>
        );
      }
      return (
        <HeroSection 
          heading={localState.heading}
          subheading={localState.subheading}
          cta_text={localState.cta_text}
          cta_url={localState.cta_url}
          image_url={localState.image_url}
          options={{
            ...localState.options,
            slides: slides
          }}
        />
      );
    }

    const section = sections.find(s => s.id === selectedId);
    if (!section) {
      return (
        <div className="flex min-h-[22rem] w-full flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center text-stone-400 sm:min-h-[28rem]">
          <Eye size={48} strokeWidth={1.5} className="shrink-0 opacity-80" aria-hidden />
          <p className="text-lg font-medium text-stone-500">Select a section to preview</p>
          <p className="max-w-xs text-xs text-stone-400">
            Choose Hero or a block from the list on the left to see it here.
          </p>
        </div>
      );
    }

    const props = localState;
    switch (section.type) {
      case 'text_block': return <TextBlock {...props} />;
      case 'home_about': return <AboutSection {...props} />;
      case 'image_grid': return <ImageGrid {...props} />;
      case 'testimonial': return <Testimonial {...props} />;
      case 'cta': return <CTA {...props} />;
      case 'featured_campaign': {
        const p = props as Record<string, unknown>;
        return (
          <FeaturedCampaignSectionPreview
            anchor_id={typeof p.anchor_id === 'string' ? p.anchor_id : undefined}
            eyebrow={typeof p.eyebrow === 'string' ? p.eyebrow : undefined}
            heading={typeof p.heading === 'string' ? p.heading : undefined}
            heading_accent={typeof p.heading_accent === 'string' ? p.heading_accent : undefined}
            body={typeof p.body === 'string' ? p.body : undefined}
            impact_panel={
              p.impact_panel && typeof p.impact_panel === 'object' && !Array.isArray(p.impact_panel)
                ? (p.impact_panel as CtaImpactPanel)
                : undefined
            }
            bottom_primary_text={
              typeof p.bottom_primary_text === 'string' ? p.bottom_primary_text : undefined
            }
            bottom_primary_url={
              typeof p.bottom_primary_url === 'string' ? p.bottom_primary_url : undefined
            }
            bottom_secondary_text={
              typeof p.bottom_secondary_text === 'string' ? p.bottom_secondary_text : undefined
            }
            bottom_secondary_url={
              typeof p.bottom_secondary_url === 'string' ? p.bottom_secondary_url : undefined
            }
          />
        );
      }
      case 'partners': return <PartnersSection {...props} />;
      case 'news_cards': return <NewsCards {...props} />;
      case 'contact_info': return <ContactInfo {...props} />;
      case 'gallery': return <Gallery {...props} />;
      case 'divider': return <Divider />;
      case 'program_cards': return <ProgramCards {...props} />;
      case 'map_section': return <OurLocationSection {...props} />;
      case 'stats_banner': return <StatsBannerSection {...props} />;
      case 'featured_quote': return <FeaturedQuoteSection {...props} />;
      case 'timeline': return <TimelineSection {...props} />;
      case 'pillar_cards': return <PillarCardsSection {...props} />;
      case 'values_grid': return <ValuesGridSection {...props} />;
      case 'network_section': return <NetworkSection {...props} />;
      case 'diocese_map_section': return <DioceseMapSection {...props} />;
      case 'leadership_grid': return <LeadershipGridSection {...props} />;
      case 'video_gallery': return <VideoGallerySection {...props} />;
      case 'news_article_feed':
        return (
          <NewsFeedSectionPreview
            featuredArticle={newsFeedPreview?.featuredArticle ?? null}
            gridArticles={newsFeedPreview?.gridArticles ?? []}
          />
        );
      case 'publications_library':
        return (
          <PublicationsFeedSectionPreview
            publications={publicationsFeedPreview?.publications ?? []}
            categories={publicationsFeedPreview?.categories ?? []}
          />
        );
      case 'news_footer':
        return (
          <div className="mt-auto w-full shrink-0 pb-8 pt-4">
            <NewsNewsletterFooter
              title={typeof props.title === 'string' ? props.title : 'Stay connected'}
              body={typeof props.body === 'string' ? props.body : ''}
            />
          </div>
        );
      default: return <div>Unknown section type: {section.type}</div>;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!mounted) return (
    <div className="h-screen w-full flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#7A1515]" size={40} />
        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Loading Editor...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 max-h-[100dvh] w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-page-bg)]">
      {/* Top bar: sticky so it stays visible if the dashboard shell scrolls */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6">
        <div className="flex items-center gap-4">
          <nav className="flex items-center text-[10px] uppercase tracking-widest font-bold text-stone-400">
            <Link href="/dashboard" className="hover:text-[#7A1515] transition-colors flex items-center">
              <Home size={10} className="mr-1" /> Dashboard
            </Link>
            <ChevronLeft size={10} className="mx-1.5 opacity-50 rotate-180" />
            <Link href="/dashboard/pages" className="hover:text-[#7A1515] transition-colors">
              Pages
            </Link>
            <ChevronLeft size={10} className="mx-1.5 opacity-50 rotate-180" />
          </nav>
          <h1 className="text-lg font-bold text-stone-900">{page.title}</h1>
          <Badge variant={page.status === 'published' ? 'success' : 'warning'}>
            {page.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href={page.slug === 'home' ? '/' : `/${page.slug}`} 
            target="_blank" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-1 h-9 px-4 py-2 hover:bg-stone-100 text-stone-600 gap-2"
          >
            <ExternalLink size={16} />
            View layout
          </a>
          <Button 
            variant={page.status === 'published' ? 'secondary' : 'primary'}
            onClick={handlePublishToggle}
          >
            {page.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* Left Panel — fixed min width, draggable max; independent vertical scroll */}
        <aside
          style={{ width: leftPanelWidth }}
          className={`relative z-10 flex min-h-0 shrink-0 flex-col overflow-hidden border-r bg-white ${
            editorWarmChrome ? 'border-[#ece8e2]' : 'border-stone-200 shadow-sm'
          }`}
        >
          {selectedId ? (
            /* Edit Form */
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex shrink-0 items-center gap-3 border-b border-stone-100 p-4">
                <button 
                  onClick={() => handleSelectSection(null)}
                  className="p-1 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-stone-900"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Editing</div>
                  <div className="text-sm font-bold text-stone-900">
                    {selectedId === 'hero' ? 'Hero Section' : SECTION_LABELS[sections.find(s => s.id === selectedId)?.type || ''] || 'Section'}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-6">
                <SectionForm 
                  type={selectedId === 'hero' ? 'hero' : sections.find(s => s.id === selectedId)?.type || ''}
                  state={localState}
                  onChange={handleUpdateLocal}
                  onOptionsChange={handleUpdateOptionsLocal}
                  slides={slides}
                  onAddSlide={handleAddSlide}
                  onDeleteSlide={(id: string) => setSlideToDelete(id)}
                  onSelectSlide={setSelectedSlideId}
                  pageSlug={page.slug}
                />
              </div>

              <div className="shrink-0 space-y-3 border-t border-stone-100 bg-stone-50 p-4">
                {selectedId !== 'hero' && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 justify-start"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete section
                  </Button>
                )}
                <Button 
                  variant="primary" 
                  className="w-full"
                  disabled={!hasChanges || saving}
                  onClick={handleSave}
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : savedAt ? (
                    <span className="flex items-center gap-2">
                      <Check size={18} />
                      Saved ✓
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save size={18} />
                      Save changes
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Section List */
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-stone-100 p-4">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Page Sections</h2>
              </div>
              
              <div className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
                {/* Hero is always first and not sortable in this list */}
                <button
                  onClick={() => handleSelectSection('hero')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-stone-600 transition-all text-sm font-medium"
                >
                  <Layers size={18} className="text-[#7A1515]" />
                  <span>Hero Section</span>
                </button>

                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sections.map((section) => (
                      <SortableItem 
                        key={section.id} 
                        section={section} 
                        isSelected={selectedId === section.id}
                        onSelect={() => handleSelectSection(section.id)}
                        onToggleVisibility={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(section.id, section.visible);
                        }}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 mt-4 border-2 border-dashed border-stone-100 rounded-xl text-stone-400 hover:border-[#7A1515] hover:text-[#7A1515] hover:bg-[#7A1515]/5 transition-all text-sm font-bold"
                >
                  <Plus size={18} />
                  Add section
                </button>
              </div>

              <div className="shrink-0 border-t border-stone-100 p-4 text-center">
                <button 
                  onClick={() => setActiveTab('full')}
                  className="text-xs font-bold text-[#7A1515] hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Eye size={14} />
                  Open full page preview
                </button>
              </div>
            </div>
          )}
        </aside>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sections panel"
          aria-valuenow={Math.round(leftPanelWidth)}
          aria-valuemin={EDITOR_SIDEBAR_WIDTH_MIN}
          aria-valuemax={sidebarMaxPx}
          tabIndex={0}
          className={`group relative z-20 w-px shrink-0 cursor-col-resize select-none border-r border-transparent bg-transparent after:absolute after:inset-y-0 after:-left-2 after:right-[-11px] after:w-3 after:content-[''] hover:after:bg-stone-200/70 ${
            isResizingSidebar ? 'after:bg-[#7A1515]/30' : ''
          }`}
          onMouseDown={onSidebarResizeStart}
          onTouchStart={onSidebarResizeStartTouch}
          onKeyDown={(e) => {
            const step = 12;
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              setLeftPanelWidth((w) => Math.max(EDITOR_SIDEBAR_WIDTH_MIN, w - step));
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              setLeftPanelWidth((w) => Math.min(sidebarMaxPx, w + step));
            }
          }}
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-stone-100 p-0.5 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical size={14} aria-hidden />
          </span>
        </div>

        {/* Right Panel (Preview) */}
        <main
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 ${editorWarmChrome ? 'bg-[#faf8f5]' : 'bg-stone-50'}`}
        >
          {/* Tab Bar */}
          <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <div
              className={`flex bg-white p-1 rounded-xl border ${
                editorWarmChrome ? 'page-editor-toolbar-pill border-[#dcd6cf]' : 'shadow-sm border-stone-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'preview' ? 'bg-[#7A1515] text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Section Preview
              </button>
              <button
                onClick={() => setActiveTab('full')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'full' ? 'bg-[#7A1515] text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Full Page
              </button>
            </div>

            {activeTab === 'preview' && (
              <div
                className={`flex flex-col gap-2 rounded-xl border bg-white p-2 sm:flex-row sm:items-center sm:justify-end ${
                  editorWarmChrome ? 'page-editor-toolbar-pill border-[#dcd6cf]' : 'border-stone-200 shadow-sm'
                }`}
              >
                <div
                  className="flex flex-wrap items-center gap-0.5"
                  role="toolbar"
                  aria-label="Preview device width"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceOverride('desktop')}
                    className={`rounded-lg p-2 transition-colors ${
                      effectivePreviewMode === 'desktop'
                        ? 'bg-stone-100 text-[#7A1515]'
                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                    }`}
                    title="Desktop width"
                    aria-pressed={effectivePreviewMode === 'desktop'}
                  >
                    <Monitor size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceOverride('tablet')}
                    className={`rounded-lg p-2 transition-colors ${
                      effectivePreviewMode === 'tablet'
                        ? 'bg-stone-100 text-[#7A1515]'
                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                    }`}
                    title="Tablet width"
                    aria-pressed={effectivePreviewMode === 'tablet'}
                  >
                    <Tablet size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceOverride('mobile')}
                    className={`rounded-lg p-2 transition-colors ${
                      effectivePreviewMode === 'mobile'
                        ? 'bg-stone-100 text-[#7A1515]'
                        : 'text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                    }`}
                    title="Mobile width"
                    aria-pressed={effectivePreviewMode === 'mobile'}
                  >
                    <Smartphone size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDeviceOverride(null)}
                    className={`ml-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                      previewDeviceOverride === null
                        ? 'bg-[#7A1515]/10 text-[#7A1515]'
                        : 'text-stone-400 hover:bg-stone-100 hover:text-stone-700'
                    }`}
                    title="Match device frame to available preview width"
                  >
                    Auto
                  </button>
                </div>
                <span
                  className="text-[10px] font-medium tabular-nums text-stone-500"
                  aria-live="polite"
                >
                  {previewDeviceOverride === null
                    ? `Auto (${autoPreviewMode}) · ${previewCanvasWidth}px`
                    : `Manual · column ${previewCanvasWidth}px`}
                </span>
              </div>
            )}
          </div>

          <div
            ref={previewCanvasRef}
            className={`relative flex min-h-0 flex-1 flex-col justify-start overflow-hidden ${
              isAboutPage ? 'page-editor-canvas-about' : ''
            }`}
          >
            {activeTab === 'preview' ? (
              <div
                className={`page-editor-preview-viewport mx-auto min-h-0 flex-1 max-w-full overflow-y-auto overflow-x-hidden rounded-xl border ${
                  isAboutPage
                    ? 'border-[#dcd6cf] bg-[#f8f6f3]'
                    : isNewsPage || isPublicationsPage
                      ? 'border-[#dcd8d0] bg-[#eae5de]'
                      : 'border-stone-200 bg-stone-100/70'
                }`}
                style={{
                  width: previewFrameWidthStyle,
                }}
              >
                {/* Constrain width so @media (min-width: …) in section CSS matches a real viewport, not the full editor */}
                <div
                  className={`page-editor-preview-sheet page-editor-section-preview flex min-h-full w-full flex-col p-0 ${
                    isAboutPage
                      ? 'about-page-preview border-x border-[#ece8e2] bg-[#f8f6f3]'
                      : isNewsPage
                        ? 'news-page-root bg-[#f7f5f2]'
                        : isPublicationsPage
                          ? 'pub-page-root bg-[#f7f5f2]'
                          : 'bg-white'
                  }`}
                >
                  {renderPreview()}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-0 w-full flex-col">
                {isStale && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                      <RefreshCw size={16} className="text-amber-500" />
                      Content updated — reload to see changes
                    </div>
                    <Button
                      variant="secondary"
                      className="h-8 bg-white px-3 text-xs"
                      onClick={() => {
                        if (iframeRef.current) {
                          iframeRef.current.src = iframeRef.current.src;
                          setIsStale(false);
                        }
                      }}
                    >
                      Reload
                    </Button>
                  </div>
                )}
                <div
                  className={`relative min-h-0 flex-1 overflow-hidden bg-white ${
                    isAboutPage
                      ? 'page-editor-full-review border border-[#e8e4df] rounded-xl'
                      : isNewsPage || isPublicationsPage
                        ? 'page-editor-full-review border border-[#e2dcd4] rounded-xl'
                        : 'border border-stone-200'
                  }`}
                >
                  <iframe 
                    ref={iframeRef}
                    src={`/${page.slug}`}
                    className="h-full min-h-0 w-full border-none bg-white pointer-events-none"
                    title="Page Preview"
                  />
                  {/* Overlay to prevent interaction in the iframe */}
                  <div className="absolute inset-0 z-10"></div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Add a section"
      >
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(SECTION_LABELS).map(([type, label]) => {
            if (type === 'hero') return null;
            if (
              page.slug !== 'news' &&
              (type === 'news_article_feed' || type === 'news_footer')
            )
              return null;
            if (page.slug !== 'publications' && type === 'publications_library') return null;
            const Icon = SECTION_ICONS[type] || Plus;
            return (
              <button
                key={type}
                onClick={() => handleAddSection(type)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-stone-50 hover:border-[#7A1515] hover:bg-[#7A1515]/5 transition-all group"
              >
                <div className="w-12 h-12 bg-stone-50 group-hover:bg-white rounded-xl flex items-center justify-center text-stone-400 group-hover:text-[#7A1515] transition-colors shadow-sm">
                  <Icon size={24} />
                </div>
                <div className="text-sm font-bold text-stone-600 group-hover:text-stone-900">{label}</div>
              </button>
            );
          })}
        </div>
      </Modal>
      
      {/* Slide Editor Modal */}
      <Modal 
        isOpen={!!selectedSlideId} 
        onClose={() => {
          if (slideHasChanges && !confirm("Unsaved changes will be lost. Continue?")) return;
          setSelectedSlideId(null);
        }}
        title="Edit Carousel Slide"
      >
        {slideState && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Badge Text</label>
                <input 
                  type="text" 
                  value={slideState.badge_text || ''} 
                  onChange={(e) => { setSlideState({...slideState, badge_text: e.target.value}); setSlideHasChanges(true); }}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  placeholder="e.g. WELCOME TO CARITAS RWANDA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Heading</label>
                <input 
                  type="text" 
                  value={slideState.heading || ''} 
                  onChange={(e) => { setSlideState({...slideState, heading: e.target.value}); setSlideHasChanges(true); }}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Subheading</label>
                <textarea 
                  value={slideState.subheading || ''} 
                  onChange={(e) => { setSlideState({...slideState, subheading: e.target.value}); setSlideHasChanges(true); }}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Button Text</label>
                  <input 
                    type="text" 
                    value={slideState.cta_text || ''} 
                    onChange={(e) => { setSlideState({...slideState, cta_text: e.target.value}); setSlideHasChanges(true); }}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Primary Button URL</label>
                  <input 
                    type="text" 
                    value={slideState.cta_url || ''} 
                    onChange={(e) => { setSlideState({...slideState, cta_url: e.target.value}); setSlideHasChanges(true); }}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Background Image</label>
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="w-16 h-16 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                    {slideState.image_url ? <img src={slideState.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-400"><ImageIcon size={24} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-500 truncate">{slideState.image_url || 'No image selected'}</p>
                  </div>
                  <Button
                    variant="secondary"
                    className="h-8 text-[10px] px-3"
                    onClick={() => setShowSlideMediaPicker(true)}
                  >
                    Pick Image
                  </Button>
                </div>
                {showSlideMediaPicker && (
                  <MediaPicker 
                    isOpen={true} 
                    onClose={() => setShowSlideMediaPicker(false)} 
                    onSelect={(m: any) => {
                      setSlideState({...slideState, image_url: m.url}); 
                      setSlideHasChanges(true);
                      setShowSlideMediaPicker(false);
                    }}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
              <Button 
                variant="secondary" 
                onClick={() => setSelectedSlideId(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSlide}
                disabled={!slideHasChanges || saving}
                className="bg-[#7A1515] hover:bg-[#5e1010] text-white min-w-[120px]"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : 'Save Slide'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!slideToDelete}
        onClose={() => setSlideToDelete(null)}
        onConfirm={handleDeleteSlide}
        title="Delete carousel slide?"
        description="This will permanently remove this slide from the hero carousel."
      />

      <Modal 
        isOpen={!!errorDetails} 
        onClose={() => setErrorDetails(null)}
        title="Operation Failed"
      >
        <div className="space-y-4 py-2">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm">
            {errorDetails}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDetails(null)}>Close</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete section?"
        description="This action cannot be undone. All content in this section will be permanently removed."
      />

      <ConfirmDialog
        isOpen={showUnsavedConfirm !== null}
        onClose={() => setShowUnsavedConfirm(null)}
        onConfirm={() => {
          const targetId = showUnsavedConfirm;
          setShowUnsavedConfirm(null);
          setHasChanges(false);
          handleSelectSection(targetId);
        }}
        title="Unsaved changes"
        description="You have unsaved changes. Do you want to discard them and switch?"
      />
    </div>
  );
}

// --- Sub-components ---

function SortableItem({ section, isSelected, onSelect, onToggleVisibility }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = SECTION_ICONS[section.type] || LayoutGrid;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium border-2 ${
        isSelected 
          ? 'bg-[#7A1515]/5 border-[#7A1515]/20 text-[#7A1515]' 
          : 'bg-white border-transparent hover:bg-stone-50 text-stone-600'
      }`}
      onClick={onSelect}
    >
      <button 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-stone-300 hover:text-stone-500"
      >
        <GripVertical size={16} />
      </button>
      
      <Icon size={18} className={isSelected ? 'text-[#7A1515]' : 'text-stone-400'} />
      <span className="flex-1 truncate text-left">
        {(section.name && String(section.name).trim()) || SECTION_LABELS[section.type] || section.type}
      </span>
      
      <button 
        onClick={onToggleVisibility}
        className={`p-1.5 rounded-lg transition-colors ${
          section.visible ? 'text-stone-300 hover:text-stone-900' : 'text-amber-500'
        }`}
      >
        {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </div>
  );
}

function SectionForm({ 
  type, 
  state, 
  onChange, 
  onOptionsChange,
  slides,
  onAddSlide,
  onDeleteSlide,
  onSelectSlide,
  pageSlug
}: any) {
  const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null);
  const [campaignPicklist, setCampaignPicklist] = useState<{ id: string; title: string; status: string }[]>(
    [],
  );

  useEffect(() => {
    if (type !== "cta") return;
    const sb = createClient();
    void sb
      .from("community_campaigns")
      .select("id,title,status")
      .order("title")
      .then(({ data }) =>
        setCampaignPicklist((data ?? []) as { id: string; title: string; status: string }[]),
      );
  }, [type]);

  const handleMediaSelect = (key: string, media: any) => {
    onChange(key, Array.isArray(media) ? media.map(m => ({ url: m.url, id: m.id })) : media.url);
  };

  const renderField = (label: string, key: string, fieldType: 'text' | 'textarea' | 'color' | 'select' | 'image' | 'alignment' | 'slider', options?: any) => {
    const value = state[key];

    switch (fieldType) {
      case 'text':
        return (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
            <input 
              type="text" 
              value={value || ''} 
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515]"
              placeholder={key.includes('url') ? 'e.g. /about or #donate' : ''}
            />
            {key.includes('url') && (
              <p className="text-[9px] text-stone-400 mt-0.5 italic">Type <span className="font-bold text-[#7A1515]">#donate</span> to open donation modal</p>
            )}
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
            <textarea 
              rows={options?.rows || 3}
              value={value || ''} 
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515]"
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="w-16 h-10 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                {value && <img src={value} className="w-full h-full object-cover" />}
              </div>
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                onClick={() => setShowMediaPicker(key)}
              >
                Replace
              </Button>
            </div>
            {showMediaPicker === key && (
              <MediaPicker 
                isOpen={true} 
                onClose={() => setShowMediaPicker(null)} 
                onSelect={(m) => handleMediaSelect(key, m)}
              />
            )}
          </div>
        );
      case 'alignment':
        return (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
            <div className="flex bg-stone-100 p-1 rounded-xl">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() => onChange(key, align)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    value === align ? 'bg-white text-[#7A1515] shadow-sm' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>
        );
      case 'slider':
        return (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
              <span className="text-[10px] font-bold text-stone-600">{Math.round((value ?? 0) * 100)}%</span>
            </div>
            <input 
              type="range" 
              min={options?.min || 0} 
              max={options?.max || 1} 
              step={options?.step || 0.1}
              value={value ?? 0}
              onChange={(e) => onChange(key, parseFloat(e.target.value))}
              className="w-full accent-[#7A1515]"
            />
          </div>
        );
      case 'color':
        return (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={value || '#7A1515'} 
                onChange={(e) => onChange(key, e.target.value)}
                className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-sm font-mono text-stone-600 uppercase">{value || '#7A1515'}</span>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderOptionField = (label: string, key: string, type: 'text' | 'textarea' | 'image' = 'text') => {
    const value = state.options?.[key] || '';
    
    if (type === 'image') {
      return (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
              {value ? <img src={value} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-400"><ImageIcon size={20} /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-stone-500 truncate">{value || 'No image selected'}</p>
            </div>
            <Button
              variant="secondary"
              className="h-8 px-3 text-[10px]"
              onClick={() => setShowMediaPicker(key)}
            >
              Pick
            </Button>
          </div>
          {showMediaPicker === key && (
            <MediaPicker 
              isOpen={true} 
              onClose={() => setShowMediaPicker(null)} 
              onSelect={(m: any) => {
                onOptionsChange(key, m.url);
                setShowMediaPicker(null);
              }}
            />
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onOptionsChange(key, e.target.value)}
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] transition-all min-h-[100px]"
          />
        ) : (
          <>
            <input
              type="text"
              value={value}
              onChange={(e) => onOptionsChange(key, e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] transition-all"
              placeholder={key.includes('url') ? 'e.g. /about or #donate' : ''}
            />
            {key.includes('url') && (
              <p className="text-[9px] text-stone-400 mt-0.5 italic">Type <span className="font-bold text-[#7A1515]">#donate</span> to open donation modal</p>
            )}
          </>
        )}
      </div>
    );
  };

  // Dedicated alignment field that updates options (for Hero)
  const renderOptionAlignment = (label: string) => {
    const value = state.options?.align || 'left';
    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
        <div className="flex bg-stone-100 p-1 rounded-xl">
          {['left', 'center', 'right'].map((alignOption) => (
            <button
              key={alignOption}
              onClick={() => onOptionsChange('align', alignOption)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                value === alignOption ? 'bg-white text-[#7A1515] shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {alignOption}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderOptionColor = (label: string, key: string) => {
    const value = state.options?.[key] || '#ffffff';
    return (
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-3">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onOptionsChange(key, e.target.value)}
            className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer bg-transparent"
          />
          <span className="text-sm font-mono text-stone-600 uppercase">{value}</span>
        </div>
      </div>
    );
  };

  const renderOptionSlider = (label: string, key: string, options?: any) => {
    const value = state.options?.[key] ?? 0.4;
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</label>
          <span className="text-[10px] font-bold text-stone-600">{Math.round(value * 100)}%</span>
        </div>
        <input 
          type="range" 
          min={options?.min || 0} 
          max={options?.max || 1} 
          step={options?.step || 0.05}
          value={value}
          onChange={(e) => onOptionsChange(key, parseFloat(e.target.value))}
          className="w-full accent-[#7A1515]"
        />
      </div>
    );
  };

  switch (type) {
    case 'hero':
      return (
        <div className="space-y-6">
          {renderOptionField('Top Badge Text', 'badge_text', 'text')}
          {renderField('Heading', 'heading', 'text')}
          {renderField('Subheading', 'subheading', 'textarea')}
          <div className="grid grid-cols-2 gap-4">
            {renderField('Primary Button Text', 'cta_text', 'text')}
            {renderField('Primary Button URL', 'cta_url', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderOptionField('Secondary Button Text', 'secondary_cta_text', 'text')}
            {renderOptionField('Secondary Button URL', 'secondary_cta_url', 'text')}
          </div>
          {renderField('Background Image', 'image_url', 'image')}
          {renderOptionAlignment('Text Alignment')}
          <div className="grid grid-cols-2 gap-4">
            {renderOptionSlider('Overlay Opacity', 'overlay_opacity')}
            {renderOptionColor('Text Color', 'text_color')}
          </div>

          {pageSlug && pageSlug !== 'home' ? (
            <div className="pt-6 border-t border-stone-200 space-y-4">
              <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">
                Interior banner
              </p>
              {renderOptionField('Heading accent phrase', 'heading_accent', 'text')}
              <p className="text-[9px] text-stone-400 -mt-2">
                Highlights this exact phrase inside the heading (gradient span).
              </p>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase text-stone-400">Quick anchors</p>
                {(state.options?.quick_nav || []).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 gap-2 rounded-lg border border-stone-100 bg-stone-50 p-3"
                  >
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const list = [...(state.options?.quick_nav || [])].filter((_: unknown, i: number) => i !== idx);
                          onOptionsChange('quick_nav', list);
                        }}
                        className="text-stone-300 hover:text-red-500"
                        aria-label="Remove anchor"
                      >
                        <X size={14} aria-hidden />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.label ?? ''}
                      onChange={(e) => {
                        const list = [...(state.options?.quick_nav || [])];
                        list[idx] = { ...list[idx], label: e.target.value };
                        onOptionsChange('quick_nav', list);
                      }}
                      className="w-full rounded-lg border border-stone-200 bg-white p-2 text-xs"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={item.href ?? ''}
                      onChange={(e) => {
                        const list = [...(state.options?.quick_nav || [])];
                        list[idx] = { ...list[idx], href: e.target.value };
                        onOptionsChange('quick_nav', list);
                      }}
                      className="w-full rounded-lg border border-stone-200 bg-white p-2 text-xs"
                      placeholder="#history or /path"
                    />
                    <input
                      type="text"
                      value={String(item.icon ?? '').replace(/^fa-solid\s+/i, '')}
                      onChange={(e) => {
                        const list = [...(state.options?.quick_nav || [])];
                        list[idx] = { ...list[idx], icon: e.target.value.trim() };
                        onOptionsChange('quick_nav', list);
                      }}
                      className="w-full rounded-lg border border-stone-200 bg-white p-2 text-xs"
                      placeholder="Icon (e.g. fa-clock-rotate-left)"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    onOptionsChange('quick_nav', [
                      ...(state.options?.quick_nav || []),
                      { label: '', href: '#', icon: 'fa-clock-rotate-left' },
                    ])
                  }
                >
                  <Plus size={14} className="mr-2" />
                  Add anchor
                </Button>
              </div>
            </div>
          ) : null}

          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-widest">Carousel Slides</h3>
              <Button
                variant="secondary"
                className="h-8 gap-1.5 px-3 text-[10px]"
                onClick={onAddSlide}
              >
                <Plus size={14} /> Add Slide
              </Button>
            </div>
            
            <div className="space-y-3">
              {(slides || []).map((slide: any, index: number) => (
                <div 
                  key={slide.id}
                  className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-3 hover:border-[#7A1515]/30 transition-all cursor-pointer group"
                  onClick={() => onSelectSlide(slide.id)}
                >
                  <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-100">
                    {slide.image_url ? (
                      <img src={slide.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{slide.heading || `Slide ${index + 1}`}</p>
                    <p className="text-[10px] text-stone-500 truncate">{slide.subheading || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      onClick={(e) => { e.stopPropagation(); onDeleteSlide(slide.id); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {slides.length === 0 && (
                <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  <p className="text-[10px] font-bold text-stone-400 uppercase">No extra slides added</p>
                  <p className="text-[10px] text-stone-400 mt-1">Main hero content will be used alone.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    case 'text_block':
      return (
        <div className="space-y-6">
          {renderField('Heading', 'heading', 'text')}
          {renderField('Body Content', 'body', 'textarea', { rows: 8 })}
          {renderField('Alignment', 'alignment', 'alignment')}
        </div>
      );
    case 'home_about': {
      const ha = DEFAULT_SECTION_CONTENT.home_about as Record<string, unknown>;
      const defParagraphs = (ha.paragraph_html as string[]) || ['', ''];
      const defMilestones = (ha.milestones as string[]) || [];
      const defPillars = (ha.pillars as Record<string, unknown>[]) || [];
      const defStatsItems =
        ((((ha.stats_bar as Record<string, unknown>)?.items as { value?: string; label?: string }[]) ||
          []) as { value: string; label: string }[]) || [];

      const ensureMilestones = (): string[] => {
        const cur = [...(state.milestones || [])];
        for (let i = 0; i < 4; i++) {
          cur[i] = cur[i] ?? defMilestones[i] ?? '';
        }
        return cur.slice(0, 4);
      };

      const ensurePillars = (): Record<string, unknown>[] => {
        const cur = [...(state.pillars || [])];
        for (let i = 0; i < 3; i++) {
          const d = defPillars[i] || {};
          cur[i] = {
            icon: '',
            title: '',
            body: '',
            footer: '',
            chips: [] as string[],
            cta_label: '',
            cta_href: '',
            ...d,
            ...(cur[i] || {}),
          };
        }
        return cur.slice(0, 3);
      };

      const ensureStatsItems = (): { value: string; label: string }[] => {
        const cur = [...((state.stats_bar && state.stats_bar.items) || [])];
        for (let i = 0; i < 4; i++) {
          cur[i] = {
            value: '',
            label: '',
            ...(defStatsItems[i] || {}),
            ...(cur[i] || {}),
          };
        }
        return cur.slice(0, 4);
      };

      const milestones = ensureMilestones();
      const pillars = ensurePillars();
      const statItems = ensureStatsItems();
      const paragraphs: [string, string] = [
        (state.paragraph_html?.[0] as string) ?? defParagraphs[0] ?? '',
        (state.paragraph_html?.[1] as string) ?? defParagraphs[1] ?? '',
      ];
      const storyCta = (state.story_cta || ha.story_cta || {}) as { label?: string; href?: string };
      const statsBarMerged = (state.stats_bar || ha.stats_bar || {}) as {
        items?: { value?: string; label?: string }[];
        cta_label?: string;
        cta_href?: string;
      };

      return (
        <div className="space-y-5">
          <p className="text-[10px] leading-relaxed text-stone-500">
            Homepage about band (burgundy card on beige): matches the live site layout — badges, history copy,
            quote, milestones, Vision/Mission/Values, stats row.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="ha-badge-est">
                Badge — established
              </label>
              <input
                id="ha-badge-est"
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                value={(state.badge_est as string) ?? ''}
                onChange={(e) => onChange('badge_est', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="ha-badge-loc">
                Badge — location
              </label>
              <input
                id="ha-badge-loc"
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                value={(state.badge_location as string) ?? ''}
                onChange={(e) => onChange('badge_location', e.target.value)}
              />
            </div>
          </div>
          {renderField('Headline line 1', 'heading_line1', 'text')}
          {renderField('Headline line 2 (accent)', 'heading_line2_accent', 'text')}
          {renderField('History label', 'history_label', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="ha-p1">
              Paragraph 1 (HTML ok)
            </label>
            <textarea
              id="ha-p1"
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              rows={4}
              value={paragraphs[0]}
              onChange={(e) => onChange('paragraph_html', [e.target.value, paragraphs[1]])}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="ha-p2">
              Paragraph 2 (HTML ok)
            </label>
            <textarea
              id="ha-p2"
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              rows={3}
              value={paragraphs[1]}
              onChange={(e) => onChange('paragraph_html', [paragraphs[0], e.target.value])}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Story button label</label>
              <input
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                value={storyCta.label ?? ''}
                onChange={(e) =>
                  onChange('story_cta', { ...(state.story_cta || {}), label: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Story button URL</label>
              <input
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                value={storyCta.href ?? ''}
                onChange={(e) =>
                  onChange('story_cta', { ...(state.story_cta || {}), href: e.target.value })
                }
              />
            </div>
          </div>
          {renderField('Quote', 'quote_text', 'textarea', { rows: 3 })}
          {renderField('Quote attribution', 'quote_attribution', 'text')}
          <p className="text-[10px] font-bold uppercase text-stone-400">Milestones (4)</p>
          <ul className="space-y-2">
            {milestones.map((line: string, idx: number) => (
              <li key={idx} className="list-none">
                <input
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                  value={line}
                  onChange={(e) => {
                    const list = ensureMilestones();
                    list[idx] = e.target.value;
                    onChange('milestones', list);
                  }}
                  placeholder={`Milestone ${idx + 1}`}
                />
              </li>
            ))}
          </ul>
          <p className="text-[10px] font-bold uppercase text-stone-400">Vision / Mission / Values cards</p>
          <ul className="space-y-4">
            {pillars.map((pillar: Record<string, unknown>, idx: number) => (
              <li key={idx} className="list-none rounded-lg border border-stone-100 bg-stone-50 p-3 space-y-2">
                <p className="text-[10px] font-semibold text-stone-600">
                  Card {idx + 1}
                  {idx === 2 ? ' (values — chips + optional CTA)' : ''}
                </p>
                <input
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  placeholder="Font Awesome icon classes e.g. fa-regular fa-eye"
                  value={(pillar.icon as string) ?? ''}
                  onChange={(e) => {
                    const list = ensurePillars();
                    list[idx] = { ...list[idx], icon: e.target.value };
                    onChange('pillars', list);
                  }}
                />
                <input
                  className="w-full rounded border border-stone-200 p-2 text-xs font-semibold"
                  placeholder="Title"
                  value={(pillar.title as string) ?? ''}
                  onChange={(e) => {
                    const list = ensurePillars();
                    list[idx] = { ...list[idx], title: e.target.value };
                    onChange('pillars', list);
                  }}
                />
                <textarea
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  rows={3}
                  placeholder="Body (HTML ok)"
                  value={(pillar.body as string) ?? ''}
                  onChange={(e) => {
                    const list = ensurePillars();
                    list[idx] = { ...list[idx], body: e.target.value };
                    onChange('pillars', list);
                  }}
                />
                <textarea
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  rows={2}
                  placeholder="Footer (italic line — optional)"
                  value={(pillar.footer as string) ?? ''}
                  onChange={(e) => {
                    const list = ensurePillars();
                    list[idx] = { ...list[idx], footer: e.target.value };
                    onChange('pillars', list);
                  }}
                />
                {idx === 2 ? (
                  <>
                    <input
                      className="w-full rounded border border-stone-200 p-2 text-xs"
                      placeholder="Chips — comma-separated"
                      value={Array.isArray(pillar.chips) ? (pillar.chips as string[]).join(', ') : ''}
                      onChange={(e) => {
                        const chips = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        const list = ensurePillars();
                        list[idx] = { ...list[idx], chips };
                        onChange('pillars', list);
                      }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        placeholder="Read more label"
                        value={(pillar.cta_label as string) ?? ''}
                        onChange={(e) => {
                          const list = ensurePillars();
                          list[idx] = { ...list[idx], cta_label: e.target.value };
                          onChange('pillars', list);
                        }}
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        placeholder="Read more URL"
                        value={(pillar.cta_href as string) ?? ''}
                        onChange={(e) => {
                          const list = ensurePillars();
                          list[idx] = { ...list[idx], cta_href: e.target.value };
                          onChange('pillars', list);
                        }}
                      />
                    </div>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="text-[10px] font-bold uppercase text-stone-400">Stats bar</p>
          <ul className="space-y-3">
            {statItems.map((st: { value: string; label: string }, idx: number) => (
              <li key={idx} className="list-none grid grid-cols-2 gap-2 rounded-lg border border-stone-100 bg-stone-50 p-3">
                <input
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  placeholder="67+"
                  value={st.value ?? ''}
                  onChange={(e) => {
                    const list = ensureStatsItems();
                    list[idx] = { ...list[idx], value: e.target.value };
                    onChange('stats_bar', { ...statsBarMerged, items: list });
                  }}
                />
                <input
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  placeholder="Label"
                  value={st.label ?? ''}
                  onChange={(e) => {
                    const list = ensureStatsItems();
                    list[idx] = { ...list[idx], label: e.target.value };
                    onChange('stats_bar', { ...statsBarMerged, items: list });
                  }}
                />
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Stats bar button label</label>
              <input
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                value={statsBarMerged.cta_label ?? ''}
                onChange={(e) =>
                  onChange('stats_bar', {
                    ...statsBarMerged,
                    items: statItems,
                    cta_label: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Stats bar button URL</label>
              <input
                className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                value={statsBarMerged.cta_href ?? ''}
                onChange={(e) =>
                  onChange('stats_bar', {
                    ...statsBarMerged,
                    items: statItems,
                    cta_href: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      );
    }
    case 'cta': {
      const patchStat = (i: number, key: string, v: string) => {
        const list = [...(state.stats || [])];
        list[i] = { ...list[i], [key]: v };
        onChange('stats', list);
      };
      const featured = state.featured_card || {};
      const patchFeatured = (key: string, v: unknown) => {
        onChange('featured_card', { ...featured, [key]: v });
      };
      const patchFeaturedStat = (i: number, key: string, v: string) => {
        const list = [...(featured.stats || [])];
        list[i] = { ...list[i], [key]: v };
        onChange('featured_card', { ...featured, stats: list });
      };
      const patchSidebar = (i: number, key: string, v: unknown) => {
        const list = [...(state.sidebar_cards || [])];
        list[i] = { ...list[i], [key]: v };
        onChange('sidebar_cards', list);
      };
      const impact = state.impact_panel || {};
      const patchImpact = (key: string, v: unknown) => {
        onChange('impact_panel', { ...impact, [key]: v });
      };
      const patchImpactItem = (i: number, key: string, v: string) => {
        const list = [...(impact.items || [])];
        list[i] = { ...list[i], [key]: v };
        onChange('impact_panel', { ...impact, items: list });
      };

      return (
        <div className="space-y-6">
          <p className="text-[10px] text-stone-500 leading-relaxed">
            Classic mode uses the headline + buttons + optional stat tiles. Enable the grid below for the homepage-style featured story column (solid surfaces;{" "}
            <code className="text-[#7A1515]">#donate</code> opens the donation modal).
          </p>
          {renderField('Eyebrow', 'eyebrow', 'text')}
          {renderField('Heading (first line)', 'heading', 'text')}
          {renderField('Heading (second line, accent)', 'heading_accent', 'text')}
          {renderField('Body', 'body', 'textarea', { rows: 4 })}
          <div className="grid grid-cols-2 gap-3">
            {renderField('Primary button text', 'button_text', 'text')}
            {renderField('Primary button URL', 'button_url', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderField('Secondary button text', 'secondary_text', 'text')}
            {renderField('Secondary button URL', 'secondary_url', 'text')}
          </div>
          {renderField('Section background', 'bg_color', 'color')}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#7A1515]"
              checked={Boolean(state.be_part_grid)}
              onChange={(e) => onChange('be_part_grid', e.target.checked)}
            />
            <span className="text-[11px] leading-snug text-stone-600">
              <span className="font-bold text-stone-800">Featured grid layout</span> — large beneficiary card + sidebar cards + impact panel (matches original homepage structure).
            </span>
          </label>

          {state.be_part_grid ? (
            <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="space-y-2 rounded-xl border border-stone-100 bg-stone-50/90 p-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Featured campaign
                </label>
                <p className="text-[10px] leading-snug text-stone-500">
                  Uses data from Campaigns on the live site. Donate opens the modal for this campaign. Manual fields below remain as fallback if empty or unpublished.
                </p>
                <select
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  value={(featured.featured_campaign_id as string) || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    patchFeatured("featured_campaign_id", v || undefined);
                    if (v) onChange("be_part_grid", true);
                  }}
                >
                  <option value="">Manual fields only</option>
                  {campaignPicklist.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Featured card (manual fallback fields)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={featured.image_url ?? ''}
                    onChange={(e) => patchFeatured('image_url', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Image alt
                  </label>
                  <input
                    type="text"
                    value={featured.image_alt ?? ''}
                    onChange={(e) => patchFeatured('image_alt', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Category label
                  </label>
                  <input
                    type="text"
                    value={featured.category_label ?? ''}
                    onChange={(e) => patchFeatured('category_label', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Category icon (Font Awesome class)
                  </label>
                  <input
                    type="text"
                    value={featured.category_icon ?? ''}
                    onChange={(e) => patchFeatured('category_icon', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Title / name
                </label>
                <input
                  type="text"
                  value={featured.title ?? ''}
                  onChange={(e) => patchFeatured('title', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Location line
                </label>
                <input
                  type="text"
                  value={featured.location ?? ''}
                  onChange={(e) => patchFeatured('location', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Story
                </label>
                <textarea
                  rows={4}
                  value={featured.story ?? ''}
                  onChange={(e) => patchFeatured('story', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Raised label
                  </label>
                  <input
                    type="text"
                    value={featured.raised_label ?? ''}
                    onChange={(e) => patchFeatured('raised_label', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Goal label
                  </label>
                  <input
                    type="text"
                    value={featured.goal_label ?? ''}
                    onChange={(e) => patchFeatured('goal_label', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Progress %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={featured.progress_pct ?? ''}
                    onChange={(e) =>
                      patchFeatured(
                        'progress_pct',
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Primary button text
                  </label>
                  <input
                    type="text"
                    value={featured.primary_button_text ?? ''}
                    onChange={(e) => patchFeatured('primary_button_text', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Primary button URL
                  </label>
                  <input
                    type="text"
                    value={featured.primary_button_url ?? ''}
                    onChange={(e) => patchFeatured('primary_button_url', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Discussion link label
                  </label>
                  <input
                    type="text"
                    value={featured.discussion_label ?? ''}
                    onChange={(e) => patchFeatured('discussion_label', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Discussion URL
                  </label>
                  <input
                    type="text"
                    value={featured.discussion_url ?? ''}
                    onChange={(e) => patchFeatured('discussion_url', e.target.value)}
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Featured stats row (optional)
              </p>
              <ul className="space-y-2">
                {(featured.stats || []).map((st: Record<string, string>, i: number) => (
                  <li key={i} className="relative flex gap-2 rounded-lg border border-stone-100 bg-stone-50 p-2">
                    <button
                      type="button"
                      className="absolute right-1 top-1 text-stone-300 hover:text-red-500"
                      onClick={() => {
                        const next = (featured.stats || []).filter((_: unknown, j: number) => j !== i);
                        patchFeatured('stats', next);
                      }}
                      aria-label={`Remove featured stat ${i + 1}`}
                    >
                      <X size={14} />
                    </button>
                    <input
                      className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs"
                      placeholder="Number"
                      value={st.num || ''}
                      onChange={(e) => patchFeaturedStat(i, 'num', e.target.value)}
                    />
                    <input
                      className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs"
                      placeholder="Label"
                      value={st.label || ''}
                      onChange={(e) => patchFeaturedStat(i, 'label', e.target.value)}
                    />
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() =>
                  patchFeatured('stats', [...(featured.stats || []), { num: '', label: '' }])
                }
              >
                <Plus size={12} className="mr-1" />
                Add featured stat
              </Button>
            </div>
          ) : null}

          {state.be_part_grid ? (
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Sidebar cards
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 text-xs"
                  onClick={() =>
                    onChange('sidebar_cards', [
                      ...(state.sidebar_cards || []),
                      {
                        category_tone: 'rose',
                        button_url: '#donate',
                      },
                    ])
                  }
                >
                  <Plus size={12} className="mr-1" />
                  Add card
                </Button>
              </div>
              <ul className="space-y-4">
                {(state.sidebar_cards || []).map((card: Record<string, unknown>, idx: number) => (
                  <li key={idx} className="relative space-y-3 rounded-xl border border-stone-100 bg-stone-50 p-3 pt-8">
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                      onClick={() => {
                        const next = (state.sidebar_cards || []).filter((_: unknown, j: number) => j !== idx);
                        onChange('sidebar_cards', next);
                      }}
                      aria-label={`Remove sidebar card ${idx + 1}`}
                    >
                      <X size={16} />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Image URL"
                        value={(card.image_url as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'image_url', e.target.value)}
                      />
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Image alt"
                        value={(card.image_alt as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'image_alt', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Category label"
                        value={(card.category_label as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'category_label', e.target.value)}
                      />
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Category icon class"
                        value={(card.category_icon as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'category_icon', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        value={(card.category_tone as string) || 'rose'}
                        onChange={(e) => patchSidebar(idx, 'category_tone', e.target.value)}
                      >
                        <option value="rose">Tag tone: rose</option>
                        <option value="sky">Tag tone: sky</option>
                        <option value="teal">Tag tone: teal</option>
                      </select>
                      <select
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        value={(card.bar_tone as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'bar_tone', e.target.value)}
                      >
                        <option value="">Bar: burgundy</option>
                        <option value="sky">Bar: sky</option>
                        <option value="teal">Bar: teal</option>
                      </select>
                    </div>
                    <input
                      className="w-full rounded border border-stone-200 px-2 py-1.5 text-xs"
                      placeholder="Name"
                      value={(card.name as string) || ''}
                      onChange={(e) => patchSidebar(idx, 'name', e.target.value)}
                    />
                    <textarea
                      rows={2}
                      className="w-full rounded border border-stone-200 px-2 py-1.5 text-xs"
                      placeholder="Short description"
                      value={(card.description as string) || ''}
                      onChange={(e) => patchSidebar(idx, 'description', e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Raised label"
                        value={(card.raised_label as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'raised_label', e.target.value)}
                      />
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="% / goal line"
                        value={(card.goal_pct_label as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'goal_pct_label', e.target.value)}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Progress %"
                        value={card.progress_pct === undefined || card.progress_pct === null ? '' : String(card.progress_pct)}
                        onChange={(e) =>
                          patchSidebar(
                            idx,
                            'progress_pct',
                            e.target.value === '' ? '' : Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Button text"
                        value={(card.button_text as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'button_text', e.target.value)}
                      />
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Button URL"
                        value={(card.button_url as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'button_url', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Discuss label (optional)"
                        value={(card.discuss_label as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'discuss_label', e.target.value)}
                      />
                      <input
                        className="rounded border border-stone-200 px-2 py-1.5 text-xs"
                        placeholder="Discuss URL"
                        value={(card.discuss_url as string) || ''}
                        onChange={(e) => patchSidebar(idx, 'discuss_url', e.target.value)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {state.be_part_grid ? (
            <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Impact panel
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="rounded-lg border border-stone-200 p-2 text-xs"
                  placeholder="Panel title"
                  value={impact.title ?? ''}
                  onChange={(e) => patchImpact('title', e.target.value)}
                />
                <input
                  className="rounded-lg border border-stone-200 p-2 text-xs"
                  placeholder="Panel icon class"
                  value={impact.icon ?? ''}
                  onChange={(e) => patchImpact('icon', e.target.value)}
                />
              </div>
              <ul className="space-y-2">
                {(impact.items || []).map((it: Record<string, string>, i: number) => (
                  <li key={i} className="relative flex gap-2 rounded-lg border border-stone-100 bg-stone-50 p-2">
                    <button
                      type="button"
                      className="absolute right-1 top-1 text-stone-300 hover:text-red-500"
                      onClick={() => {
                        const next = (impact.items || []).filter((_: unknown, j: number) => j !== i);
                        patchImpact('items', next);
                      }}
                      aria-label={`Remove impact item ${i + 1}`}
                    >
                      <X size={14} />
                    </button>
                    <input
                      className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs"
                      placeholder="Number"
                      value={it.num || ''}
                      onChange={(e) => patchImpactItem(i, 'num', e.target.value)}
                    />
                    <input
                      className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs"
                      placeholder="Label"
                      value={it.label || ''}
                      onChange={(e) => patchImpactItem(i, 'label', e.target.value)}
                    />
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() =>
                  patchImpact('items', [...(impact.items || []), { num: '', label: '' }])
                }
              >
                <Plus size={12} className="mr-1" />
                Add impact cell
              </Button>
            </div>
          ) : null}

          {state.be_part_grid ? (
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Bottom primary text
                </label>
                <input
                  type="text"
                  value={state.bottom_primary_text ?? ''}
                  onChange={(e) => onChange('bottom_primary_text', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Bottom primary URL
                </label>
                <input
                  type="text"
                  value={state.bottom_primary_url ?? ''}
                  onChange={(e) => onChange('bottom_primary_url', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Bottom secondary text
                </label>
                <input
                  type="text"
                  value={state.bottom_secondary_text ?? ''}
                  onChange={(e) => onChange('bottom_secondary_text', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Bottom secondary URL
                </label>
                <input
                  type="text"
                  value={state.bottom_secondary_url ?? ''}
                  onChange={(e) => onChange('bottom_secondary_url', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                />
              </div>
            </div>
          ) : null}

          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" id="cta-stats-label">
            Impact numbers — classic layout only (empty hides)
          </p>
          <ul className="space-y-3" aria-labelledby="cta-stats-label">
            {(state.stats || []).map((st: any, i: number) => (
              <li
                key={i}
                className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-2 list-none relative"
              >
                <button
                  type="button"
                  onClick={() => {
                    const next = (state.stats || []).filter((_: unknown, j: number) => j !== i);
                    onChange('stats', next);
                  }}
                  className="absolute top-2 right-2 text-stone-300 hover:text-red-500"
                  aria-label={`Remove stat ${i + 1}`}
                >
                  <X size={16} />
                </button>
                <input
                  className="w-full text-xs border border-stone-200 rounded-md px-2 py-1.5"
                  placeholder="Icon (e.g. fa-users)"
                  value={st.icon || ''}
                  onChange={(e) => patchStat(i, 'icon', e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    className="flex-1 text-xs border border-stone-200 rounded-md px-2 py-1.5"
                    placeholder="Value"
                    value={st.value || ''}
                    onChange={(e) => patchStat(i, 'value', e.target.value)}
                  />
                  <input
                    className="w-20 text-xs border border-stone-200 rounded-md px-2 py-1.5"
                    placeholder="Suffix"
                    value={st.value_suffix || ''}
                    onChange={(e) => patchStat(i, 'value_suffix', e.target.value)}
                  />
                </div>
                <input
                  className="w-full text-xs border border-stone-200 rounded-md px-2 py-1.5"
                  placeholder="Label"
                  value={st.label || ''}
                  onChange={(e) => patchStat(i, 'label', e.target.value)}
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="text-xs h-8"
              onClick={() =>
                onChange('stats', [
                  ...(state.stats || []),
                  { icon: 'fa-users', value: '0', value_suffix: '', label: 'Label' },
                ])
              }
            >
              <Plus size={12} className="mr-1" />
              Add stat
            </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs h-8"
                  onClick={() =>
                    onChange('stats', [
                      { icon: 'fa-users', value: '150', value_suffix: 'K+', label: 'Lives Transformed' },
                      {
                        icon: 'fa-calendar-check',
                        value: '67',
                        value_suffix: '+',
                        label: 'Years of Service',
                      },
                      { icon: 'fa-church', value: '9', value_suffix: '', label: 'Dioceses Covered' },
                      {
                        icon: 'fa-hands-helping',
                        value: '8',
                        value_suffix: 'K',
                        label: 'Active Volunteers',
                      },
                    ])
                  }
                >
                  Load default four
                </Button>
            <Button type="button" variant="secondary" className="text-xs h-8" onClick={() => onChange('stats', [])}>
              Clear all stats
            </Button>
          </div>
        </div>
      );
    }
    case 'featured_campaign': {
      const impact = state.impact_panel || {};
      const patchImpact = (key: string, v: unknown) => {
        onChange('impact_panel', { ...impact, [key]: v });
      };
      const patchImpactItem = (i: number, key: string, v: string) => {
        const list = [...(impact.items || [])];
        list[i] = { ...list[i], [key]: v };
        onChange('impact_panel', { ...impact, items: list });
      };

      return (
        <div className="space-y-6">
          <p className="text-[10px] leading-relaxed text-stone-500">
            The large story card uses the campaign marked{" "}
            <strong>Feature on home page</strong> in{" "}
            <Link
              href="/dashboard/community-campaigns"
              className="font-semibold text-[#7A1515] underline underline-offset-2"
            >
              Dashboard → Campaigns
            </Link>
            . The right column lists up to{" "}
            <strong>{FEATURED_CAMPAIGN_SIDEBAR_MAX}</strong> other <strong>published</strong> campaigns
            (excluding the starred homepage campaign). More fundraisers live on{" "}
            <Link href="/campaigns" className="font-semibold text-[#7A1515] underline underline-offset-2">
              /campaigns
            </Link>
            . Bottom buttons below still use{" "}
            <code className="text-[#7A1515]">#donate</code> for the donation modal where configured.
          </p>
          {renderField('Section anchor ID', 'anchor_id', 'text')}
          {renderField('Eyebrow', 'eyebrow', 'text')}
          {renderField('Heading (first line)', 'heading', 'text')}
          {renderField('Heading (accent line)', 'heading_accent', 'text')}
          {renderField('Subtitle', 'body', 'textarea', { rows: 4 })}
          <div className="grid grid-cols-2 gap-3">
            {renderField('Bottom primary text', 'bottom_primary_text', 'text')}
            {renderField('Bottom primary URL', 'bottom_primary_url', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderField('Bottom secondary text', 'bottom_secondary_text', 'text')}
            {renderField('Bottom secondary URL', 'bottom_secondary_url', 'text')}
          </div>

          <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Our collective impact panel
            </p>
            <p className="text-[10px] leading-snug text-stone-500">
              Title, icon (Font Awesome class), and stat cells shown below the sidebar cards on the homepage.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Panel title</label>
                <input
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  placeholder="Our collective impact"
                  value={(impact.title as string) ?? ''}
                  onChange={(e) => patchImpact('title', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-stone-400">Panel icon class</label>
                <input
                  className="w-full rounded-lg border border-stone-200 p-2 text-xs outline-none focus:border-[#7A1515] focus:ring-2 focus:ring-[#7A1515]/15"
                  placeholder="fa-chart-line"
                  value={(impact.icon as string) ?? ''}
                  onChange={(e) => patchImpact('icon', e.target.value)}
                />
              </div>
            </div>
            <ul className="space-y-2">
              {(impact.items || []).map((it: Record<string, string>, i: number) => (
                <li key={i} className="relative flex gap-2 rounded-lg border border-stone-100 bg-stone-50 p-2">
                  <button
                    type="button"
                    className="absolute right-1 top-1 text-stone-300 hover:text-red-500"
                    onClick={() => {
                      const next = (impact.items || []).filter((_: unknown, j: number) => j !== i);
                      patchImpact('items', next);
                    }}
                    aria-label={`Remove impact stat ${i + 1}`}
                  >
                    <X size={14} />
                  </button>
                  <input
                    className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs"
                    placeholder="Number (e.g. 150K+)"
                    value={it.num || ''}
                    onChange={(e) => patchImpactItem(i, 'num', e.target.value)}
                  />
                  <input
                    className="flex-1 rounded border border-stone-200 px-2 py-1 text-xs"
                    placeholder="Label"
                    value={it.label || ''}
                    onChange={(e) => patchImpactItem(i, 'label', e.target.value)}
                  />
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="secondary"
              className="h-8 text-xs"
              onClick={() =>
                patchImpact('items', [...(impact.items || []), { num: '', label: '' }])
              }
            >
              <Plus size={12} className="mr-1" />
              Add impact cell
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-8 text-xs"
              onClick={() =>
                patchImpact('items', [
                  { num: '150K+', label: 'Lives transformed' },
                  { num: '67+', label: 'Years of service' },
                  { num: '9', label: 'Dioceses covered' },
                  { num: '8K', label: 'Active volunteers' },
                ])
              }
            >
              Load sample four stats
            </Button>
          </div>
        </div>
      );
    }
    case 'testimonial':
      return (
        <div className="space-y-6">
          {renderField('Quote', 'quote', 'textarea', { rows: 5 })}
          {renderField('Author Name', 'author', 'text')}
          {renderField('Author Role', 'role', 'text')}
          {renderField('Avatar Image', 'avatar_url', 'image')}
        </div>
      );
    case 'contact_info':
      return (
        <div className="space-y-6">
          <p className="text-[10px] text-stone-500 leading-relaxed">
            Left column and intro copy. The form submits to your dashboard Contact inbox and sends confirmation emails via SMTP.
          </p>
          {renderField('Eyebrow', 'eyebrow', 'text')}
          {renderField('Heading (line 1)', 'heading_line1', 'text')}
          {renderField('Heading (line 2, accent)', 'heading_line2', 'text')}
          {renderField('Intro paragraph', 'subtext', 'textarea', { rows: 4 })}
          <div className="grid grid-cols-2 gap-3">
            {renderField('Headquarters label', 'headquarters_label', 'text')}
            {renderField('Headquarters (location)', 'headquarters', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderField('Phone label', 'phone_label', 'text')}
            {renderField('Phone number', 'phone', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderField('Email label', 'email_label', 'text')}
            {renderField('Email address', 'email', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderField('Office hours label', 'hours_label', 'text')}
            {renderField('Office hours', 'office_hours', 'text')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {renderField('Form title', 'form_title', 'text')}
            {renderField('Form subtitle', 'form_subtitle', 'text')}
          </div>
        </div>
      );
    case 'partners': {
      const patchPartner = (idx: number, key: string, value: string) => {
        const next = [...(state.items || [])];
        next[idx] = { ...next[idx], [key]: value };
        onChange('items', next);
      };
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="pr-eyebrow">
              Eyebrow
            </label>
            <input
              id="pr-eyebrow"
              type="text"
              value={state.eyebrow ?? ''}
              onChange={(e) => onChange('eyebrow', e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
              placeholder="Collaboration"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="pr-title">
              Title
            </label>
            <input
              id="pr-title"
              type="text"
              value={state.title ?? ''}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
              placeholder="Our Partners"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="pr-subtitle">
              Subtitle
            </label>
            <textarea
              id="pr-subtitle"
              value={state.subtitle ?? ''}
              onChange={(e) => onChange('subtitle', e.target.value)}
              rows={3}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
            />
          </div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" id="pr-list-label">
            Partner logos
          </p>
          <ul className="space-y-3" aria-labelledby="pr-list-label">
            {state.items?.map((item: any, idx: number) => (
              <li key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2 relative list-none">
                <button
                  type="button"
                  onClick={() => {
                    const newItems = state.items.filter((_: any, i: number) => i !== idx);
                    onChange('items', newItems);
                  }}
                  className="absolute top-2 right-2 text-stone-300 hover:text-red-500 rounded-md p-1"
                  aria-label={`Remove partner ${idx + 1}`}
                >
                  <X size={16} />
                </button>
                {item.logo_url ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white border border-stone-100">
                    <img src={item.logo_url} alt="" className="w-full h-full object-contain p-2" />
                    <Button
                      type="button"
                      variant="secondary"
                      className="absolute bottom-2 right-2 text-xs py-1"
                      onClick={() => setShowMediaPicker(`partner_logo_${idx}`)}
                    >
                      Change logo
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full h-20 border-dashed"
                    onClick={() => setShowMediaPicker(`partner_logo_${idx}`)}
                  >
                    Select logo
                  </Button>
                )}
                {showMediaPicker === `partner_logo_${idx}` && (
                  <MediaPicker
                    isOpen
                    onClose={() => setShowMediaPicker(null)}
                    onSelect={(m: any) => {
                      patchPartner(idx, 'logo_url', m.url);
                      setShowMediaPicker(null);
                    }}
                  />
                )}
                <input
                  type="text"
                  value={item.name ?? ''}
                  onChange={(e) => patchPartner(idx, 'name', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2 text-sm font-semibold"
                  placeholder="Organization name"
                />
                <input
                  type="text"
                  value={item.url ?? ''}
                  onChange={(e) => patchPartner(idx, 'url', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2 text-xs"
                  placeholder="Link URL (optional)"
                />
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full py-2 h-auto text-xs"
            onClick={() => setShowMediaPicker('add_partner')}
          >
            <Plus size={14} className="mr-2" />
            Add partner
          </Button>
          {showMediaPicker === 'add_partner' && (
            <MediaPicker
              isOpen
              onClose={() => setShowMediaPicker(null)}
              onSelect={(m: any) => {
                onChange('items', [
                  ...(state.items || []),
                  { name: m.filename.split('.')[0], logo_url: m.url, url: '' }
                ]);
                setShowMediaPicker(null);
              }}
            />
          )}
        </div>
      );
    }
    case 'news_cards': {
      const patchArticle = (idx: number, field: string, value: unknown) => {
        const next = [...(state.articles || [])];
        next[idx] = { ...next[idx], [field]: value };
        onChange('articles', next);
      };
      const addArticle = () => {
        onChange('articles', [
          ...(state.articles || []),
          {
            title: 'New story',
            excerpt: '',
            date: new Date().toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            image_url: '',
            link_url: '/news',
            tag: '',
            open_in_new: false
          }
        ]);
      };
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="nc-eyebrow">
              Eyebrow
            </label>
            <input
              id="nc-eyebrow"
              type="text"
              value={state.eyebrow ?? ''}
              onChange={(e) => onChange('eyebrow', e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="nc-heading">
                Heading (before highlight)
              </label>
              <input
                id="nc-heading"
                type="text"
                value={state.heading ?? ''}
                onChange={(e) => onChange('heading', e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
                placeholder='e.g. News &'
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="nc-highlight">
                Highlight word
              </label>
              <input
                id="nc-highlight"
                type="text"
                value={state.heading_highlight ?? ''}
                onChange={(e) => onChange('heading_highlight', e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
                placeholder="e.g. Stories"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="nc-subtitle">
              Subtitle
            </label>
            <textarea
              id="nc-subtitle"
              value={state.subtitle ?? ''}
              onChange={(e) => onChange('subtitle', e.target.value)}
              rows={2}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="nc-view-label">
                “View all” label
              </label>
              <input
                id="nc-view-label"
                type="text"
                value={state.view_all_label ?? ''}
                onChange={(e) => onChange('view_all_label', e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="nc-view-url">
                “View all” URL
              </label>
              <input
                id="nc-view-url"
                type="text"
                value={state.view_all_url ?? ''}
                onChange={(e) => onChange('view_all_url', e.target.value)}
                className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
                placeholder="e.g. /news"
              />
            </div>
          </div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" id="nc-stories-list-label">
            Stories
          </p>
          <p className="text-[9px] text-stone-400 -mt-2">
            First story drives the featured carousel; 2nd and 3rd appear as side cards. At least 3 items shows the full magazine layout.
          </p>
          <ul className="space-y-4" aria-labelledby="nc-stories-list-label">
            {state.articles?.map((item: any, idx: number) => (
              <li key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3 relative list-none">
                <button
                  type="button"
                  onClick={() => {
                    const newItems = state.articles.filter((_: any, i: number) => i !== idx);
                    onChange('articles', newItems);
                  }}
                  className="absolute top-2 right-2 text-stone-300 hover:text-red-500 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-[#7A1515] focus:ring-offset-1"
                  aria-label={`Remove story ${idx + 1}`}
                >
                  <X size={16} aria-hidden />
                </button>
                {item.image_url || item.thumbnail ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-stone-200">
                    <img
                      src={item.image_url || item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      className="absolute bottom-2 right-2 text-xs py-1"
                      onClick={() => setShowMediaPicker(`news_img_${idx}`)}
                    >
                      Change image
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full h-24 border-dashed"
                    onClick={() => setShowMediaPicker(`news_img_${idx}`)}
                  >
                    Select image
                  </Button>
                )}
                {showMediaPicker === `news_img_${idx}` && (
                  <MediaPicker
                    isOpen
                    onClose={() => setShowMediaPicker(null)}
                    onSelect={(m: any) => {
                      patchArticle(idx, 'image_url', m.url);
                      setShowMediaPicker(null);
                    }}
                  />
                )}
                <input
                  type="text"
                  value={item.title ?? ''}
                  onChange={(e) => patchArticle(idx, 'title', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
                  placeholder="Title"
                />
                <textarea
                  value={item.excerpt ?? ''}
                  onChange={(e) => patchArticle(idx, 'excerpt', e.target.value)}
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
                  placeholder="Short description (shown on card)"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={item.date ?? ''}
                    onChange={(e) => patchArticle(idx, 'date', e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 text-xs"
                    placeholder="Date"
                  />
                  <input
                    type="text"
                    value={item.tag ?? ''}
                    onChange={(e) => patchArticle(idx, 'tag', e.target.value)}
                    className="w-full border border-stone-200 rounded-lg p-2 text-xs"
                    placeholder="Tag (e.g. News)"
                  />
                </div>
                <input
                  type="text"
                  value={item.link_url ?? ''}
                  onChange={(e) => patchArticle(idx, 'link_url', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg p-2 text-xs"
                  placeholder="Link URL (article or external)"
                />
                <label className="flex items-center gap-2 text-xs text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(item.open_in_new)}
                    onChange={(e) => patchArticle(idx, 'open_in_new', e.target.checked)}
                    className="rounded border-stone-300 text-[#7A1515] focus:ring-[#7A1515]"
                  />
                  Open link in new tab
                </label>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" className="w-full" onClick={addArticle}>
            <Plus size={14} className="mr-2" />
            Add story
          </Button>
        </div>
      );
    }
    case 'program_cards':
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="pc-eyebrow">
              Eyebrow
            </label>
            <input
              id="pc-eyebrow"
              type="text"
              value={state.eyebrow ?? ''}
              onChange={(e) => onChange('eyebrow', e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="pc-heading">
              Heading
            </label>
            <input
              id="pc-heading"
              type="text"
              value={state.heading ?? ''}
              onChange={(e) => onChange('heading', e.target.value)}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" htmlFor="pc-subtitle">
              Subtitle
            </label>
            <textarea
              id="pc-subtitle"
              value={state.subtitle ?? ''}
              onChange={(e) => onChange('subtitle', e.target.value)}
              rows={2}
              className="w-full border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515] outline-none"
            />
          </div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider" id="pc-programs-list-label">
            Program items
          </p>
          <ul className="space-y-4" aria-labelledby="pc-programs-list-label">
            {state.programs?.map((item: any, idx: number) => (
              <li key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3 relative list-none">
                <button
                  type="button"
                  onClick={() => {
                    const newItems = state.programs.filter((_: any, i: number) => i !== idx);
                    onChange('programs', newItems);
                  }}
                  className="absolute top-2 right-2 text-stone-300 hover:text-red-500 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-[#7A1515] focus:ring-offset-1"
                  aria-label={`Remove program ${item.title || idx + 1}`}
                >
                  <X size={16} aria-hidden />
                </button>
                {item.image_url ? (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-stone-200">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      className="absolute bottom-2 right-2 text-xs py-1"
                      onClick={() => {
                        setShowMediaPicker(`program_img_${idx}`);
                      }}
                    >
                      Change image
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => setShowMediaPicker(`program_img_${idx}`)}
                  >
                    Add image
                  </Button>
                )}
                {showMediaPicker === `program_img_${idx}` && (
                  <MediaPicker
                    isOpen
                    onClose={() => setShowMediaPicker(null)}
                    onSelect={(m: any) => {
                      const newItems = [...(state.programs || [])];
                      newItems[idx] = { ...newItems[idx], image_url: m.url };
                      onChange('programs', newItems);
                      setShowMediaPicker(null);
                    }}
                  />
                )}
                <input
                  type="text"
                  value={item.title ?? ''}
                  onChange={(e) => {
                    const newItems = [...state.programs];
                    newItems[idx] = { ...newItems[idx], title: e.target.value };
                    onChange('programs', newItems);
                  }}
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-sm font-bold focus:ring-0"
                  placeholder="Title"
                />
                <div className="space-y-1">
                  <label className="sr-only" htmlFor={`pc-prog-desc-${idx}`}>
                    Description
                  </label>
                  <textarea
                    id={`pc-prog-desc-${idx}`}
                    value={item.description ?? ''}
                    onChange={(e) => {
                      const newItems = [...state.programs];
                      newItems[idx] = { ...newItems[idx], description: e.target.value };
                      onChange('programs', newItems);
                    }}
                    className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-0"
                    placeholder="Description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500" htmlFor={`pc-icon-${idx}`}>
                      Font Awesome icon (e.g. building-columns)
                    </label>
                    <input
                      id={`pc-icon-${idx}`}
                      type="text"
                      value={String(item.icon ?? '').replace(/^fa-solid /, '')}
                      onChange={(e) => {
                        const v = e.target.value.trim();
                        const icon = v.startsWith('fa-') ? v : v ? `fa-${v}` : 'fa-circle';
                        const newItems = [...state.programs];
                        newItems[idx] = { ...newItems[idx], icon };
                        onChange('programs', newItems);
                      }}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs"
                      placeholder="building-columns"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-500" htmlFor={`pc-link-${idx}`}>
                      Link URL
                    </label>
                    <input
                      id={`pc-link-${idx}`}
                      type="text"
                      value={item.link_url ?? ''}
                      onChange={(e) => {
                        const newItems = [...state.programs];
                        newItems[idx] = { ...newItems[idx], link_url: e.target.value };
                        onChange('programs', newItems);
                      }}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs"
                      placeholder="/programs#social-welfare · #health · #development · #finance-administration"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            className="w-full"
            type="button"
            onClick={() => setShowMediaPicker('add_program')}
          >
            Add program
          </Button>
          {showMediaPicker === 'add_program' && (
            <MediaPicker
              isOpen
              onClose={() => setShowMediaPicker(null)}
              onSelect={(m: any) => {
                const newItems = [
                  ...(state.programs || []),
                  {
                    title: 'New program',
                    description: '',
                    icon: 'fa-seedling',
                    image_url: m.url,
                    link_url: '/programs#development',
                  },
                ];
                onChange('programs', newItems);
                setShowMediaPicker(null);
              }}
            />
          )}
        </div>
      );
    case 'map_section':
      return (
        <div className="space-y-6">
          <p className="text-[10px] text-stone-500">
            Paste the full <code className="text-[#7A1515]">src</code> URL from each Google Maps embed (Share → Embed a map).
          </p>
          {renderField('Eyebrow', 'eyebrow', 'text')}
          {renderField('Title (before accent)', 'heading', 'text')}
          {renderField('Title accent (e.g. G-Map)', 'heading_accent', 'text')}
          {renderField('Intro line', 'subtext', 'textarea', { rows: 3 })}
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Left map (street view)</p>
          {renderField('Card title', 'map_a_title', 'text')}
          {renderField('Card subtitle', 'map_a_subtitle', 'text')}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Embed URL</label>
            <textarea
              value={state.map_a_embed_url || ''}
              onChange={(e) => onChange('map_a_embed_url', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515]"
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Right map (HQ / directions)</p>
          {renderField('Card title', 'map_b_title', 'text')}
          {renderField('Card subtitle', 'map_b_subtitle', 'text')}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Embed URL</label>
            <textarea
              value={state.map_b_embed_url || ''}
              onChange={(e) => onChange('map_b_embed_url', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7A1515]/20 focus:border-[#7A1515]"
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>
        </div>
      );
    case 'gallery':
      return (
        <div className="space-y-4">
          {renderField('Caption', 'caption', 'text')}
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Images</label>
          <div className="grid grid-cols-3 gap-2">
            {state.images?.map((img: any, idx: number) => (
              <div key={idx} className="aspect-square bg-stone-100 rounded-lg overflow-hidden relative group">
                <img src={img.url} className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                    const newImages = state.images.filter((_: any, i: number) => i !== idx);
                    onChange('images', newImages);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setShowMediaPicker('gallery')}
              className="aspect-square bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 hover:text-[#7A1515] hover:border-[#7A1515] transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
          {showMediaPicker === 'gallery' && (
            <MediaPicker 
              isOpen={true} 
              onClose={() => setShowMediaPicker(null)} 
              multi={true}
              onSelect={(m: any) => {
                const newImages = [...(state.images || []), ...(Array.isArray(m) ? m.map(item => ({ url: item.url })) : [{ url: m.url }])];
                onChange('images', newImages);
              }}
            />
          )}
        </div>
      );
    case 'image_grid':
      return (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Columns</label>
            <div className="flex bg-stone-100 p-1 rounded-xl">
              {[2, 3, 4].map((col) => (
                <button
                  key={col}
                  onClick={() => onChange('columns', col)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    state.columns === col ? 'bg-white text-[#7A1515] shadow-sm' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {col} Columns
                </button>
              ))}
            </div>
          </div>
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Images</label>
          <div className="space-y-2">
            {state.images?.map((img: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-white border border-stone-200 rounded-xl">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <img src={img.url} className="w-full h-full object-cover" />
                </div>
                <input 
                  type="text" 
                  value={img.alt || ''} 
                  onChange={(e) => {
                    const newImages = [...state.images];
                    newImages[idx].alt = e.target.value;
                    onChange('images', newImages);
                  }}
                  className="flex-1 bg-transparent border-0 p-0 text-xs focus:ring-0"
                  placeholder="Alt text"
                />
                <button 
                  onClick={() => {
                    const newImages = state.images.filter((_: any, i: number) => i !== idx);
                    onChange('images', newImages);
                  }}
                  className="text-stone-300 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <Button variant="secondary" className="w-full" onClick={() => setShowMediaPicker('image_grid')}>
              Add Image
            </Button>
          </div>
          {showMediaPicker === 'image_grid' && (
            <MediaPicker 
              isOpen={true} 
              onClose={() => setShowMediaPicker(null)} 
              onSelect={(m: any) => {
                const newImages = [...(state.images || []), { url: m.url, alt: m.filename.split('.')[0] }];
                onChange('images', newImages);
              }}
            />
          )}
        </div>
      );
    case 'stats_banner':
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-layout">
              Layout
            </label>
            <select
              id="sb-layout"
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={(state.layout as string) === 'impact' ? 'impact' : 'strip'}
              onChange={(e) => onChange('layout', e.target.value)}
            >
              <option value="strip">About — white infographic card (icons + stats)</option>
              <option value="impact">Dark card grid (badge, title, trends)</option>
            </select>
          </div>
          {(state.layout as string) === 'impact' ? (
            <>
              <p className="text-[10px] leading-relaxed text-stone-500">
                Full-width impact block with badge, title, and cards. Leave <strong>items</strong> empty to hide the section on save.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-badge">
                    Badge
                  </label>
                  <input
                    id="sb-badge"
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                    value={state.badge ?? ''}
                    onChange={(e) => onChange('badge', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-subtitle">
                    Subtitle line
                  </label>
                  <input
                    id="sb-subtitle"
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                    value={state.subtitle ?? ''}
                    onChange={(e) => onChange('subtitle', e.target.value)}
                    placeholder="Program Impacts"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-title-lead">
                    Title (first word)
                  </label>
                  <input
                    id="sb-title-lead"
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                    value={state.title_lead ?? ''}
                    onChange={(e) => onChange('title_lead', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-title-accent">
                    Title accent word
                  </label>
                  <input
                    id="sb-title-accent"
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                    value={state.title_accent ?? ''}
                    onChange={(e) => onChange('title_accent', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-cta-label">
                    Bottom button label
                  </label>
                  <input
                    id="sb-cta-label"
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                    value={state.cta_label ?? ''}
                    onChange={(e) => onChange('cta_label', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="sb-cta-href">
                    Bottom button URL
                  </label>
                  <input
                    id="sb-cta-href"
                    className="w-full rounded-lg border border-stone-200 p-2 text-xs"
                    value={state.cta_href ?? ''}
                    onChange={(e) => onChange('cta_href', e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-[10px] leading-relaxed text-stone-500">
              White shadow card row — optional <strong>icon</strong> per stat. Use{' '}
              <strong>number</strong>, <strong>suffix</strong>, and label (shown uppercase). Leave{' '}
              <strong>items</strong> empty to hide the section.
            </p>
          )}
          <p className="text-[10px] font-bold uppercase text-stone-400">Stats</p>
          <ul className="space-y-3">
            {(state.items || []).map((it: any, idx: number) => (
              <li key={idx} className="relative list-none rounded-lg border border-stone-100 bg-stone-50 p-3">
                <button
                  type="button"
                  className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'items',
                      state.items.filter((_: any, i: number) => i !== idx),
                    )
                  }
                  aria-label={`Remove stat ${idx + 1}`}
                >
                  <X size={14} aria-hidden />
                </button>
                <div className="grid gap-2 pr-8">
                  {(state.layout as string) === 'impact' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={it.number_core ?? ''}
                        onChange={(e) => {
                          const list = [...(state.items || [])];
                          list[idx] = { ...list[idx], number_core: e.target.value };
                          onChange('items', list);
                        }}
                        placeholder="327,435"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={it.number_suffix ?? ''}
                        onChange={(e) => {
                          const list = [...(state.items || [])];
                          list[idx] = { ...list[idx], number_suffix: e.target.value };
                          onChange('items', list);
                        }}
                        placeholder="Suffix"
                      />
                      <select
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(it.variant as string) || 'red'}
                        onChange={(e) => {
                          const list = [...(state.items || [])];
                          list[idx] = { ...list[idx], variant: e.target.value };
                          onChange('items', list);
                        }}
                      >
                        <option value="red">Icon — people / reach</option>
                        <option value="blue">Icon — health facility</option>
                        <option value="teal">Icon — globe / communities</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="w-full rounded border border-stone-200 p-2 text-xs"
                          value={it.number_core ?? ''}
                          onChange={(e) => {
                            const list = [...(state.items || [])];
                            list[idx] = { ...list[idx], number_core: e.target.value };
                            onChange('items', list);
                          }}
                          placeholder="66 (accent part)"
                        />
                        <input
                          className="w-full rounded border border-stone-200 p-2 text-xs"
                          value={it.number_suffix ?? ''}
                          onChange={(e) => {
                            const list = [...(state.items || [])];
                            list[idx] = { ...list[idx], number_suffix: e.target.value };
                            onChange('items', list);
                          }}
                          placeholder="+ or M+"
                        />
                      </div>
                      <label className="text-[10px] font-bold uppercase text-stone-400">
                        Icon
                      </label>
                      <select
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(it.strip_icon as string) || 'clock'}
                        onChange={(e) => {
                          const list = [...(state.items || [])];
                          list[idx] = { ...list[idx], strip_icon: e.target.value };
                          onChange('items', list);
                        }}
                      >
                        <option value="clock">Clock — years / history</option>
                        <option value="people">People — reach</option>
                        <option value="church">Church — dioceses</option>
                        <option value="hands-heart">Hands & heart — volunteers</option>
                        <option value="heart-pulse">Heart pulse — health</option>
                        <option value="money">Money — budget</option>
                      </select>
                    </>
                  )}
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={it.label ?? ''}
                    onChange={(e) => {
                      const list = [...(state.items || [])];
                      list[idx] = { ...list[idx], label: e.target.value };
                      onChange('items', list);
                    }}
                    placeholder="Label"
                  />
                  {(state.layout as string) === 'impact' ? (
                    <input
                      className="w-full rounded border border-stone-200 p-2 text-xs"
                      value={it.trend ?? ''}
                      onChange={(e) => {
                        const list = [...(state.items || [])];
                        list[idx] = { ...list[idx], trend: e.target.value };
                        onChange('items', list);
                      }}
                      placeholder="Trend line (optional), e.g. +14% from FY 2024"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('items', [
                ...(state.items || []),
                {
                  number_core: '',
                  number_suffix: '',
                  label: '',
                  trend: '',
                  variant: 'red',
                  strip_icon: 'clock',
                },
              ])
            }
          >
            <Plus size={14} className="mr-2" />
            Add stat
          </Button>
        </div>
      );
    case 'featured_quote':
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400" htmlFor="fq-tone">
              Background
            </label>
            <select
              id="fq-tone"
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={(state.tone as string) === 'warm' ? 'warm' : 'dark'}
              onChange={(e) => onChange('tone', e.target.value)}
            >
              <option value="dark">Dark gradient (about page)</option>
              <option value="warm">Warm cream</option>
            </select>
          </div>
          {renderField('Name', 'name', 'text')}
          {renderField('Subtitle', 'subtitle', 'textarea', { rows: 3 })}
          {renderField('Quote — blank line splits paragraphs; use **phrase** for bold', 'quote', 'textarea', { rows: 12 })}
          {renderField('Meta line', 'meta', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Photo</label>
            <div className="flex items-center gap-2">
              {state.photo_url ? (
                <img src={state.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="text-[10px] text-stone-400">Placeholder icon shows if empty.</div>
              )}
              <Button
                type="button"
                variant="secondary"
                className="h-8 text-xs"
                onClick={() => setShowMediaPicker('featured_quote_photo')}
              >
                Pick image
              </Button>
              {showMediaPicker === 'featured_quote_photo' && (
                <MediaPicker
                  isOpen
                  onClose={() => setShowMediaPicker(null)}
                  onSelect={(m: any) => {
                    onChange('photo_url', m.url);
                    setShowMediaPicker(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div className="space-y-4">
          {renderField('Eyebrow', 'eyebrow', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Eyebrow icon class</label>
            <input
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={state.eyebrow_icon ?? ''}
              onChange={(e) => onChange('eyebrow_icon', e.target.value)}
              placeholder="fa-clock-rotate-left"
            />
          </div>
          {renderField('Title', 'title', 'text')}
          {renderField('Subtitle', 'subtitle', 'textarea', { rows: 3 })}
          {renderField('Section ID (anchors)', 'anchor_id', 'text')}
          <p className="text-[10px] leading-relaxed text-stone-500">
            Mosaic layout: optional <strong>badge</strong> (shown before year in the pill), <strong>card tone</strong>, and{' '}
            <strong>icon</strong> (<code className="text-stone-600">fa-seedling</code>). Leave tone on Auto for the default rhythm.
          </p>
          <p className="text-[10px] font-bold uppercase text-stone-400">Timeline items</p>
          <ul className="space-y-3">
            {(state.items || []).map((row: any, idx: number) => (
              <li key={idx} className="relative list-none rounded-lg border border-stone-100 bg-stone-50 p-3">
                <button
                  type="button"
                  className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'items',
                      state.items.filter((_: any, i: number) => i !== idx),
                    )
                  }
                  aria-label={`Remove milestone ${idx + 1}`}
                >
                  <X size={14} aria-hidden />
                </button>
                <div className="grid gap-2 pr-8">
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={row.year ?? ''}
                    onChange={(e) => {
                      const list = [...(state.items || [])];
                      list[idx] = { ...list[idx], year: e.target.value };
                      onChange('items', list);
                    }}
                    placeholder="Year"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={row.badge ?? ''}
                    onChange={(e) => {
                      const list = [...(state.items || [])];
                      list[idx] = { ...list[idx], badge: e.target.value };
                      onChange('items', list);
                    }}
                    placeholder="Badge (optional), e.g. Founding"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-stone-400">Card tone</label>
                      <select
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(row.tone as string) || ''}
                        onChange={(e) => {
                          const list = [...(state.items || [])];
                          const v = e.target.value;
                          list[idx] = {
                            ...list[idx],
                            tone: v === '' ? undefined : v,
                          };
                          onChange('items', list);
                        }}
                      >
                        <option value="">Auto (recommended)</option>
                        <option value="accent">Accent (terracotta)</option>
                        <option value="navy">Navy</option>
                        <option value="neutral">Neutral (white)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-stone-400">Icon</label>
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={row.icon ?? ''}
                        onChange={(e) => {
                          const list = [...(state.items || [])];
                          list[idx] = { ...list[idx], icon: e.target.value };
                          onChange('items', list);
                        }}
                        placeholder="fa-seedling"
                      />
                    </div>
                  </div>
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs font-semibold"
                    value={row.title ?? ''}
                    onChange={(e) => {
                      const list = [...(state.items || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      onChange('items', list);
                    }}
                    placeholder="Title"
                  />
                  <textarea
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    rows={3}
                    value={row.body ?? ''}
                    onChange={(e) => {
                      const list = [...(state.items || [])];
                      list[idx] = { ...list[idx], body: e.target.value };
                      onChange('items', list);
                    }}
                    placeholder="Description (**bold** ok)"
                  />
                </div>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('items', [
                ...(state.items || []),
                { year: '', badge: '', title: '', body: '', tone: '', icon: '' },
              ])
            }
          >
            <Plus size={14} className="mr-2" /> Add milestone
          </Button>
        </div>
      );
    case 'pillar_cards':
      return (
        <div className="space-y-4">
          {renderField('Eyebrow', 'eyebrow', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Eyebrow icon class</label>
            <input
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={state.eyebrow_icon ?? ''}
              onChange={(e) => onChange('eyebrow_icon', e.target.value)}
              placeholder="fa-bullseye"
            />
          </div>
          {renderField('Title', 'title', 'text')}
          {renderField('Subtitle', 'subtitle', 'textarea', { rows: 3 })}
          {renderField('Anchor id', 'anchor_id', 'text')}
          <p className="text-[10px] font-bold uppercase text-stone-400">Pillars</p>
          <ul className="space-y-3">
            {(state.pillars || []).map((p: any, idx: number) => (
              <li key={idx} className="relative list-none rounded-lg border border-stone-100 bg-stone-50 p-3">
                <button
                  type="button"
                  className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'pillars',
                      state.pillars.filter((_: any, i: number) => i !== idx),
                    )
                  }
                  aria-label={`Remove pillar ${idx + 1}`}
                >
                  <X size={14} aria-hidden />
                </button>
                <div className="grid gap-2 pr-8">
                  <select
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={p.variant ?? 'mission'}
                    onChange={(e) => {
                      const list = [...(state.pillars || [])];
                      list[idx] = { ...list[idx], variant: e.target.value };
                      onChange('pillars', list);
                    }}
                  >
                    <option value="mission">Mission</option>
                    <option value="vision">Vision</option>
                    <option value="values">Values</option>
                  </select>
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={p.label ?? ''}
                    onChange={(e) => {
                      const list = [...(state.pillars || [])];
                      list[idx] = { ...list[idx], label: e.target.value };
                      onChange('pillars', list);
                    }}
                    placeholder="Label"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs font-semibold"
                    value={p.title ?? ''}
                    onChange={(e) => {
                      const list = [...(state.pillars || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      onChange('pillars', list);
                    }}
                    placeholder="Card title"
                  />
                  <textarea
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    rows={4}
                    value={p.body ?? ''}
                    onChange={(e) => {
                      const list = [...(state.pillars || [])];
                      list[idx] = { ...list[idx], body: e.target.value };
                      onChange('pillars', list);
                    }}
                    placeholder="Body"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={p.icon ?? ''}
                    onChange={(e) => {
                      const list = [...(state.pillars || [])];
                      list[idx] = { ...list[idx], icon: e.target.value };
                      onChange('pillars', list);
                    }}
                    placeholder="Optional icon (fa-eye)"
                  />
                </div>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('pillars', [
                ...(state.pillars || []),
                { variant: 'mission', label: '', title: '', body: '', icon: '' },
              ])
            }
          >
            <Plus size={14} className="mr-2" /> Add pillar
          </Button>
        </div>
      );
    case 'values_grid':
      return (
        <div className="space-y-4">
          {renderField('Eyebrow', 'eyebrow', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Eyebrow icon class</label>
            <input
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={state.eyebrow_icon ?? ''}
              onChange={(e) => onChange('eyebrow_icon', e.target.value)}
            />
          </div>
          {renderField('Title', 'title', 'text')}
          {renderField('Subtitle', 'subtitle', 'textarea', { rows: 3 })}
          {renderField('Anchor id', 'anchor_id', 'text')}
          <p className="text-[10px] font-bold uppercase text-stone-400">Values</p>
          <ul className="space-y-2">
            {(state.items || []).map((v: any, idx: number) => (
              <li key={idx} className="flex items-center gap-2">
                <input
                  className="flex-1 rounded border border-stone-200 p-2 text-xs"
                  value={v.icon ?? ''}
                  onChange={(e) => {
                    const list = [...(state.items || [])];
                    list[idx] = { ...list[idx], icon: e.target.value };
                    onChange('items', list);
                  }}
                  placeholder="fa-heart"
                />
                <input
                  className="flex-[2] rounded border border-stone-200 p-2 text-xs"
                  value={v.name ?? ''}
                  onChange={(e) => {
                    const list = [...(state.items || [])];
                    list[idx] = { ...list[idx], name: e.target.value };
                    onChange('items', list);
                  }}
                  placeholder="Name"
                />
                <button
                  type="button"
                  className="text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'items',
                      state.items.filter((_: any, i: number) => i !== idx),
                    )
                  }
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('items', [...(state.items || []), { icon: '', name: '' }])
            }
          >
            <Plus size={14} className="mr-2" /> Add value
          </Button>
        </div>
      );
    case 'network_section': {
      const patchDioceseModal = (idx: number, field: string, value: string) => {
        const list = [...(state.dioceses || [])];
        const row = { ...list[idx] };
        row.modal = { ...(row.modal || {}), [field]: value };
        list[idx] = row;
        onChange('dioceses', list);
      };
      return (
        <div className="space-y-6">
          {renderField('Eyebrow', 'eyebrow', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Eyebrow icon class</label>
            <input
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={state.eyebrow_icon ?? ''}
              onChange={(e) => onChange('eyebrow_icon', e.target.value)}
            />
          </div>
          {renderField('Title', 'title', 'text')}
          {renderField('Subtitle', 'subtitle', 'textarea', { rows: 3 })}
          {renderField('Anchor id', 'anchor_id', 'text')}
          <p className="text-[10px] font-bold uppercase text-stone-400">Network stats</p>
          <ul className="space-y-2">
            {(state.stats || []).map((s: any, idx: number) => (
              <li key={idx} className="flex gap-2">
                <input
                  className="w-1/3 rounded border border-stone-200 p-2 text-xs"
                  value={s.number ?? ''}
                  onChange={(e) => {
                    const list = [...(state.stats || [])];
                    list[idx] = { ...list[idx], number: e.target.value };
                    onChange('stats', list);
                  }}
                />
                <input
                  className="flex-1 rounded border border-stone-200 p-2 text-xs"
                  value={s.label ?? ''}
                  onChange={(e) => {
                    const list = [...(state.stats || [])];
                    list[idx] = { ...list[idx], label: e.target.value };
                    onChange('stats', list);
                  }}
                />
                <button
                  type="button"
                  className="text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'stats',
                      state.stats.filter((_: any, i: number) => i !== idx),
                    )
                  }
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('stats', [...(state.stats || []), { number: '', label: '' }])
            }
          >
            <Plus size={14} className="mr-2" /> Add stat
          </Button>
          <p className="text-[10px] font-bold uppercase text-stone-400">Dioceses</p>
          <ul className="space-y-3">
            {(state.dioceses || []).map((d: any, idx: number) => (
              <li key={idx} className="relative list-none rounded-lg border border-stone-100 bg-stone-50 p-3">
                <button
                  type="button"
                  className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'dioceses',
                      state.dioceses.filter((_: any, i: number) => i !== idx),
                    )
                  }
                >
                  <X size={14} aria-hidden />
                </button>
                <div className="grid gap-2 pr-8">
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.name ?? ''}
                    onChange={(e) => {
                      const list = [...(state.dioceses || [])];
                      list[idx] = { ...list[idx], name: e.target.value };
                      onChange('dioceses', list);
                    }}
                    placeholder="Name"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.date_line ?? ''}
                    onChange={(e) => {
                      const list = [...(state.dioceses || [])];
                      list[idx] = { ...list[idx], date_line: e.target.value };
                      onChange('dioceses', list);
                    }}
                    placeholder="Est. … or location line for zones card"
                  />
                  {d.special ? (
                    <p className="text-[10px] leading-relaxed text-stone-400">
                      Photo not used for pastoral zones layout.
                    </p>
                  ) : (
                    <>
                      <label className="text-[10px] font-bold uppercase text-stone-400">
                        Diocese photo
                      </label>
                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-3">
                        {d.image ? (
                          <img
                            src={d.image}
                            alt=""
                            className="h-14 w-[4.5rem] shrink-0 rounded-lg object-cover ring-1 ring-stone-200"
                          />
                        ) : (
                          <div className="flex h-14 w-[4.5rem] shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-400">
                            <ImageIcon size={22} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] text-stone-500">
                            {d.image ? d.image : 'No image selected'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8 shrink-0 text-[10px]"
                          onClick={() => setShowMediaPicker(`network_diocese_${idx}`)}
                        >
                          Pick image
                        </Button>
                        {d.image ? (
                          <button
                            type="button"
                            className="shrink-0 text-[10px] font-semibold text-stone-400 hover:text-red-600"
                            onClick={() => {
                              const list = [...(state.dioceses || [])];
                              list[idx] = { ...list[idx], image: '' };
                              onChange('dioceses', list);
                            }}
                          >
                            Clear
                          </button>
                        ) : null}
                      </div>
                      {showMediaPicker === `network_diocese_${idx}` ? (
                        <MediaPicker
                          isOpen
                          onClose={() => setShowMediaPicker(null)}
                          onSelect={(media: any) => {
                            const url =
                              media && typeof media === 'object' && typeof media.url === 'string'
                                ? media.url
                                : '';
                            setShowMediaPicker(null);
                            if (!url) return;
                            const list = [...(state.dioceses || [])];
                            list[idx] = { ...list[idx], image: url };
                            onChange('dioceses', list);
                          }}
                        />
                      ) : null}
                    </>
                  )}
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.details_href ?? ''}
                    onChange={(e) => {
                      const list = [...(state.dioceses || [])];
                      list[idx] = { ...list[idx], details_href: e.target.value };
                      onChange('dioceses', list);
                    }}
                    placeholder="Fallback URL when no modal fields are set (whole-card opens this link)"
                  />
                  {!d.special ? (
                    <div className="space-y-2 rounded-lg border border-stone-200 bg-white p-3">
                      <p className="text-[10px] font-bold uppercase text-stone-400">
                        Detail modal
                      </p>
                      <p className="text-[10px] leading-relaxed text-stone-500">
                        When any field below has text, Details opens this dialog (aligned with the public About
                        page). Leave all empty to use the fallback link only.
                      </p>
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.founded) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'founded', e.target.value)}
                        placeholder="Date founded"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.bishop) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'bishop', e.target.value)}
                        placeholder="Bishop / Archbishop"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.address) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'address', e.target.value)}
                        placeholder="Address"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.phone) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'phone', e.target.value)}
                        placeholder="Telephone"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.email) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'email', e.target.value)}
                        placeholder="Email (optional)"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.website) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'website', e.target.value)}
                        placeholder="Website URL"
                      />
                      <input
                        className="w-full rounded border border-stone-200 p-2 text-xs"
                        value={(d.modal && d.modal.website_label) ?? ''}
                        onChange={(e) => patchDioceseModal(idx, 'website_label', e.target.value)}
                        placeholder="Website label (short text)"
                      />
                    </div>
                  ) : null}
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.number ?? ''}
                    onChange={(e) => {
                      const list = [...(state.dioceses || [])];
                      list[idx] = { ...list[idx], number: e.target.value };
                      onChange('dioceses', list);
                    }}
                    placeholder="Order number (01–99, optional)"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.icon ?? ''}
                    onChange={(e) => {
                      const list = [...(state.dioceses || [])];
                      list[idx] = { ...list[idx], icon: e.target.value };
                      onChange('dioceses', list);
                    }}
                    placeholder="Icon token (photo fallback / zones star)"
                  />
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(d.accent_wash)}
                      disabled={Boolean(d.special)}
                      onChange={(e) => {
                        const list = [...(state.dioceses || [])];
                        list[idx] = { ...list[idx], accent_wash: e.target.checked };
                        onChange('dioceses', list);
                      }}
                      className="rounded border-stone-300 text-[#7A1515] focus:ring-[#7A1515] disabled:opacity-40"
                    />
                    Terracotta overlay on photo (e.g. featured diocese)
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(d.special)}
                      onChange={(e) => {
                        const list = [...(state.dioceses || [])];
                        const on = e.target.checked;
                        list[idx] = {
                          ...list[idx],
                          special: on,
                          highlight: on,
                          ...(on ? { accent_wash: false } : {}),
                        };
                        onChange('dioceses', list);
                      }}
                      className="rounded border-stone-300 text-[#7A1515] focus:ring-[#7A1515]"
                    />
                    Pastoral zones card (gradient, no photo)
                  </label>
                </div>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('dioceses', [
                ...(state.dioceses || []),
                {
                  name: '',
                  date_line: '',
                  image: '',
                  details_href: '',
                  modal: {},
                  number: '',
                  icon: 'fa-church',
                  special: false,
                  highlight: false,
                  accent_wash: false,
                },
              ])
            }
          >
            <Plus size={14} className="mr-2" /> Add diocese
          </Button>
        </div>
      );
    }
    case 'leadership_grid': {
      const patchGroups = (mutate: (list: any[]) => void) => {
        onChange('groups', (prev: any[]) => {
          const list = (prev || []).map((g: any) => ({
            ...g,
            members: [...(g.members || [])].map((m: any) => ({ ...m })),
          }));
          mutate(list);
          return list;
        });
      };
      return (
        <div className="space-y-6">
          <p className="text-[10px] leading-relaxed text-stone-500">
            Horizontal leadership chronicle. Use <strong>Pick image</strong> for portraits (Media Library), or paste a URL. Add <strong>era markers</strong> between people if needed.
          </p>
          {renderField('Eyebrow', 'eyebrow', 'text')}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400">Eyebrow icon class</label>
            <input
              className="w-full rounded-lg border border-stone-200 p-2 text-xs"
              value={state.eyebrow_icon ?? ''}
              onChange={(e) => onChange('eyebrow_icon', e.target.value)}
              placeholder="fa-scroll"
            />
          </div>
          {renderField('Title', 'title', 'text')}
          {renderField('Subtitle', 'subtitle', 'textarea', { rows: 4 })}
          {renderField('Anchor id', 'anchor_id', 'text')}
          {renderField('Background watermark text', 'watermark_text', 'text')}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('groups', (prev: any[]) => [
                ...(prev || []),
                { subgroup_label: '', subgroup_icon: '', era_span: '', members: [] },
              ])
            }
          >
            <Plus size={14} className="mr-2" /> Add row (Chairpersons / Secretary Generals…)
          </Button>
          {(state.groups || []).map((g: any, gi: number) => (
            <div key={gi} className="space-y-3 rounded-xl border border-stone-100 bg-white p-3">
              <div className="flex justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-stone-400">Timeline row {gi + 1}</span>
                <button
                  type="button"
                  className="text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange('groups', (prev: any[]) => (prev || []).filter((_: any, i: number) => i !== gi))
                  }
                >
                  <X size={14} />
                </button>
              </div>
              <input
                className="w-full rounded border border-stone-200 p-2 text-xs"
                value={g.subgroup_label ?? ''}
                onChange={(e) => {
                  patchGroups((list) => {
                    list[gi] = { ...list[gi], subgroup_label: e.target.value };
                  });
                }}
                placeholder="Row title — e.g. Chairpersons"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  value={g.subgroup_icon ?? ''}
                  onChange={(e) => {
                    patchGroups((list) => {
                      list[gi] = { ...list[gi], subgroup_icon: e.target.value };
                    });
                  }}
                  placeholder="Icon — fa-crown"
                />
                <input
                  className="w-full rounded border border-stone-200 p-2 text-xs"
                  value={g.era_span ?? ''}
                  onChange={(e) => {
                    patchGroups((list) => {
                      list[gi] = { ...list[gi], era_span: e.target.value };
                    });
                  }}
                  placeholder="Date pill — e.g. 1959 — Present"
                />
              </div>
              <div className="space-y-2 border-t border-stone-100 pt-2">
                {(g.members || []).map((m: any, mi: number) =>
                  m.era_gap ? (
                    <div
                      key={mi}
                      className="relative grid gap-2 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-2"
                    >
                      <span className="text-[10px] font-bold uppercase text-stone-400">Era marker</span>
                      <textarea
                        className="w-full rounded border border-stone-200 p-2 text-[10px]"
                        rows={2}
                        value={m.era_label ?? ''}
                        onChange={(e) => {
                          patchGroups((list) => {
                            const mem = [...(list[gi].members || [])];
                            mem[mi] = { era_gap: true, era_label: e.target.value };
                            list[gi] = { ...list[gi], members: mem };
                          });
                        }}
                        placeholder={"Line 1, then Enter, then line 2 (e.g. Founding / Era)"}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                        onClick={() => {
                          patchGroups((list) => {
                            const mem = (list[gi].members || []).filter((_: any, i: number) => i !== mi);
                            list[gi] = { ...list[gi], members: mem };
                          });
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div key={mi} className="relative grid gap-2 rounded-lg border border-stone-100 bg-stone-50/80 p-2 pr-8">
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                        onClick={() => {
                          patchGroups((list) => {
                            const mem = (list[gi].members || []).filter((_: any, i: number) => i !== mi);
                            list[gi] = { ...list[gi], members: mem };
                          });
                        }}
                      >
                        <X size={12} />
                      </button>
                      <div className="grid grid-cols-4 gap-1">
                        <input
                          className="rounded border border-stone-200 p-1 text-[10px]"
                          value={m.year ?? ''}
                          onChange={(e) => {
                            patchGroups((list) => {
                              const mem = [...(list[gi].members || [])];
                              mem[mi] = { ...mem[mi], era_gap: false, year: e.target.value };
                              list[gi] = { ...list[gi], members: mem };
                            });
                          }}
                          placeholder="Year"
                        />
                        <input
                          className="col-span-3 rounded border border-stone-200 p-1 text-[10px]"
                          value={m.name ?? ''}
                          onChange={(e) => {
                            patchGroups((list) => {
                              const mem = [...(list[gi].members || [])];
                              mem[mi] = { ...mem[mi], era_gap: false, name: e.target.value };
                              list[gi] = { ...list[gi], members: mem };
                            });
                          }}
                          placeholder="Name"
                        />
                      </div>
                      <input
                        className="w-full rounded border border-stone-200 p-1 text-[10px]"
                        value={m.role ?? ''}
                        onChange={(e) => {
                          patchGroups((list) => {
                            const mem = [...(list[gi].members || [])];
                            mem[mi] = { ...mem[mi], era_gap: false, role: e.target.value };
                            list[gi] = { ...list[gi], members: mem };
                          });
                        }}
                        placeholder="Role"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-stone-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[9px] text-stone-400">
                            —
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8 text-[10px]"
                          onClick={() => setShowMediaPicker(`leadership_photo_${gi}_${mi}`)}
                        >
                          Pick image
                        </Button>
                        {m.photo_url ? (
                          <button
                            type="button"
                            className="text-[10px] font-semibold text-stone-400 hover:text-red-600"
                            onClick={() => {
                              patchGroups((list) => {
                                const mem = [...(list[gi].members || [])];
                                mem[mi] = { ...mem[mi], era_gap: false, photo_url: '' };
                                list[gi] = { ...list[gi], members: mem };
                              });
                            }}
                          >
                            Clear
                          </button>
                        ) : null}
                        {showMediaPicker === `leadership_photo_${gi}_${mi}` && (
                          <MediaPicker
                            isOpen
                            onClose={() => setShowMediaPicker(null)}
                            onSelect={(media: any) => {
                              const url =
                                media && typeof media === 'object' && typeof media.url === 'string'
                                  ? media.url
                                  : '';
                              setShowMediaPicker(null);
                              if (!url) return;
                              patchGroups((list) => {
                                const mem = [...(list[gi].members || [])];
                                mem[mi] = { ...mem[mi], era_gap: false, photo_url: url };
                                list[gi] = { ...list[gi], members: mem };
                              });
                            }}
                          />
                        )}
                      </div>
                      <label className="text-[10px] font-bold uppercase text-stone-400">Photo URL (optional)</label>
                      <input
                        className="w-full rounded border border-stone-200 p-1 text-[10px]"
                        value={m.photo_url ?? ''}
                        onChange={(e) => {
                          patchGroups((list) => {
                            const mem = [...(list[gi].members || [])];
                            mem[mi] = { ...mem[mi], era_gap: false, photo_url: e.target.value };
                            list[gi] = { ...list[gi], members: mem };
                          });
                        }}
                        placeholder="Paste URL if not using Media Library"
                      />
                      <label className="flex items-center gap-1 text-[9px] text-stone-500">
                        <input
                          type="checkbox"
                          checked={Boolean(m.featured)}
                          onChange={(e) => {
                            patchGroups((list) => {
                              const mem = [...(list[gi].members || [])];
                              mem[mi] = { ...mem[mi], era_gap: false, featured: e.target.checked };
                              list[gi] = { ...list[gi], members: mem };
                            });
                          }}
                          className="rounded border-stone-300 text-[#7A1515] focus:ring-[#7A1515]"
                        />
                        Current (badge + emphasis ring)
                      </label>
                    </div>
                  ),
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 flex-1 text-[10px]"
                    onClick={() => {
                      patchGroups((list) => {
                        const mem = [...(list[gi].members || [])];
                        mem.push({
                          year: '',
                          name: '',
                          role: '',
                          photo_url: '',
                          featured: false,
                        });
                        list[gi] = { ...list[gi], members: mem };
                      });
                    }}
                  >
                    <Plus size={12} /> Person
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 flex-1 text-[10px]"
                    onClick={() => {
                      patchGroups((list) => {
                        const mem = [...(list[gi].members || [])];
                        mem.push({ era_gap: true, era_label: 'Founding\nEra' });
                        list[gi] = { ...list[gi], members: mem };
                      });
                    }}
                  >
                    <Plus size={12} /> Era marker
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'news_article_feed':
      return (
        <div className="space-y-4">
          <p className="text-[10px] leading-relaxed text-stone-500">
            This slot shows filters, featured story, and the story grid on the live site — powered by Dashboard → News.
          </p>
          <Link
            href="/dashboard/news"
            className="inline-flex items-center gap-2 text-[11px] font-bold text-[#7A1515] hover:underline"
          >
            Open News stories →
          </Link>
        </div>
      );
    case 'publications_library':
      return (
        <div className="space-y-4">
          <p className="text-[10px] leading-relaxed text-stone-500">
            Annual reports (PDF), newsletters, strategic plan, success stories and recent updates — powered by Dashboard → Publications.
          </p>
          <Link
            href="/dashboard/publications"
            className="inline-flex items-center gap-2 text-[11px] font-bold text-[#7A1515] hover:underline"
          >
            Open Publications →
          </Link>
        </div>
      );
    case 'news_footer':
      return (
        <div className="space-y-6">
          {renderField('Title', 'title', 'text')}
          {renderField('Paragraph', 'body', 'textarea', { rows: 6 })}
          <p className="text-[10px] text-stone-400">
            Shown as the shaded strip at the bottom of the News page.
          </p>
        </div>
      );
    case 'video_gallery': {
      const layout: 'spotlight' | 'grid' | 'carousel' =
        state.layout === 'grid' || state.layout === 'carousel' ? state.layout : 'spotlight';

      const layoutOptions: {
        id: 'spotlight' | 'grid' | 'carousel';
        title: string;
        blurb: string;
        preview: React.ReactNode;
      }[] = [
        {
          id: 'spotlight',
          title: 'Spotlight',
          blurb: 'Big featured player on the left, scrollable up-next list on the right.',
          preview: (
            <div className="grid grid-cols-3 gap-1">
              <div className="col-span-2 h-12 rounded bg-stone-300" />
              <div className="space-y-1">
                <div className="h-3 rounded bg-stone-200" />
                <div className="h-3 rounded bg-stone-200" />
                <div className="h-3 rounded bg-stone-200" />
              </div>
            </div>
          ),
        },
        {
          id: 'grid',
          title: 'Grid',
          blurb: 'Equal-weight cards in a 3-column grid (2 on tablet, 1 on mobile).',
          preview: (
            <div className="grid grid-cols-3 gap-1">
              <div className="h-10 rounded bg-stone-300" />
              <div className="h-10 rounded bg-stone-300" />
              <div className="h-10 rounded bg-stone-300" />
            </div>
          ),
        },
        {
          id: 'carousel',
          title: 'Carousel',
          blurb: 'Horizontal swipe row with snap-to-card scrolling and side arrows.',
          preview: (
            <div className="grid grid-cols-4 gap-1 overflow-hidden">
              <div className="h-12 rounded bg-stone-300" />
              <div className="h-12 rounded bg-stone-300" />
              <div className="h-12 rounded bg-stone-300" />
              <div className="h-12 rounded bg-stone-200" />
            </div>
          ),
        },
      ];

      const videos = (state.videos as Array<Record<string, unknown>>) || [];
      const patchVideo = (idx: number, key: string, value: unknown) => {
        const next = [...videos];
        next[idx] = { ...next[idx], [key]: value };
        onChange('videos', next);
      };

      const moveVideo = (idx: number, dir: -1 | 1) => {
        const target = idx + dir;
        if (target < 0 || target >= videos.length) return;
        const next = [...videos];
        const [item] = next.splice(idx, 1);
        next.splice(target, 0, item);
        onChange('videos', next);
      };

      const removeVideo = (idx: number) => {
        const next = videos.filter((_, i) => i !== idx);
        onChange('videos', next);
      };

      const addVideo = () => {
        onChange('videos', [
          ...videos,
          {
            id: `v-${Date.now()}`,
            title: 'New video',
            description: '',
            youtube_url: '',
            category: '',
            duration: '',
            published_label: '',
          },
        ]);
      };

      return (
        <div className="space-y-7">
          <p className="text-[10px] leading-relaxed text-stone-500">
            Curate YouTube videos for this section. Paste any YouTube URL — watch, share, embed,
            or shorts links all work.
          </p>

          {/* Layout picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {layoutOptions.map((opt) => {
                const active = layout === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange('layout', opt.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      active
                        ? 'border-[#7A1515] bg-[#7A1515]/5 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="mb-2">{opt.preview}</div>
                    <div className="text-xs font-bold text-stone-800">{opt.title}</div>
                    <div className="text-[10px] text-stone-500 leading-snug mt-0.5">{opt.blurb}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header copy */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            {renderField('Eyebrow', 'eyebrow', 'text')}
            <div className="grid grid-cols-2 gap-3">
              {renderField('Heading (lead)', 'heading_lead', 'text')}
              {renderField('Heading (accent)', 'heading_accent', 'text')}
            </div>
            {renderField('Subtitle', 'subtitle', 'textarea', { rows: 2 })}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Show category filter
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-600 select-none p-2 bg-stone-50 rounded-lg border border-stone-100">
                  <input
                    type="checkbox"
                    checked={state.show_categories !== false}
                    onChange={(e) => onChange('show_categories', e.target.checked)}
                    className="rounded border-stone-300 text-[#7A1515] focus:ring-[#7A1515]"
                  />
                  Display chips above the videos
                </label>
              </div>
              {renderField('“All” chip label', 'all_label', 'text')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {renderField('CTA label (optional)', 'cta_label', 'text')}
              {renderField('CTA URL (optional)', 'cta_url', 'text')}
            </div>
          </div>

          {/* Videos list */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Videos ({videos.length})
              </p>
              <Button type="button" variant="secondary" className="text-xs h-8" onClick={addVideo}>
                <Plus size={14} className="mr-1.5" />
                Add video
              </Button>
            </div>

            <ul className="space-y-3">
              {videos.map((item, idx) => {
                const url = String(item.youtube_url || '');
                const idMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
                  url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
                  url.match(/(?:embed|shorts|v|live)\/([A-Za-z0-9_-]{11})/);
                const ytId = idMatch ? idMatch[1] : '';
                return (
                  <li
                    key={String(item.id || idx)}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-2 relative"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-24 h-14 shrink-0 rounded-md overflow-hidden bg-stone-200 border border-stone-100">
                        {ytId ? (
                          <img
                            src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">
                            No URL
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <input
                          type="text"
                          value={String(item.title ?? '')}
                          onChange={(e) => patchVideo(idx, 'title', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-2 text-sm font-semibold focus:ring-0"
                          placeholder="Video title"
                        />
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => patchVideo(idx, 'youtube_url', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs font-mono focus:ring-0"
                          placeholder="https://www.youtube.com/watch?v=…"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => moveVideo(idx, -1)}
                          disabled={idx === 0}
                          className="text-stone-400 hover:text-[#7A1515] rounded p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move up"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveVideo(idx, 1)}
                          disabled={idx === videos.length - 1}
                          className="text-stone-400 hover:text-[#7A1515] rounded p-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Move down"
                          title="Move down"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="text-stone-300 hover:text-red-500 rounded p-0.5"
                          aria-label={`Remove video ${idx + 1}`}
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={String(item.description ?? '')}
                      onChange={(e) => patchVideo(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:ring-0"
                      placeholder="Short description (shown next to the video)"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={String(item.category ?? '')}
                        onChange={(e) => patchVideo(idx, 'category', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-[11px]"
                        placeholder="Category (e.g. Events)"
                      />
                      <input
                        type="text"
                        value={String(item.duration ?? '')}
                        onChange={(e) => patchVideo(idx, 'duration', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-[11px]"
                        placeholder="Duration (e.g. 4:21)"
                      />
                      <input
                        type="text"
                        value={String(item.published_label ?? '')}
                        onChange={(e) => patchVideo(idx, 'published_label', e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2 text-[11px]"
                        placeholder="Badge (e.g. Featured)"
                      />
                    </div>
                  </li>
                );
              })}
              {videos.length === 0 && (
                <li className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  No videos yet. Click <span className="font-semibold">Add video</span> to begin.
                </li>
              )}
            </ul>
          </div>
        </div>
      );
    }
    case 'diocese_map_section': {
      const patchMarker = (idx: number, field: string, value: unknown) => {
        const list = [...(state.dioceses || [])];
        list[idx] = { ...list[idx], [field]: value };
        onChange('dioceses', list);
      };
      return (
        <div className="space-y-6">
          {renderField('Eyebrow', 'eyebrow', 'text')}
          {renderField('Title — first word(s)', 'title_prefix', 'text')}
          {renderField('Title — highlighted phrase', 'title_highlight', 'text')}
          {renderField('Title — remainder line', 'title_suffix', 'text')}
          {renderField('Intro paragraph', 'description', 'textarea', { rows: 4 })}
          {renderField('Anchor id', 'anchor_id', 'text')}
          {renderField('Empty selection hint', 'empty_hint', 'text')}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Map center lat</label>
              <input
                type="number"
                step="any"
                className="w-full rounded border border-stone-200 p-2 text-xs"
                value={state.map_center_lat ?? ''}
                onChange={(e) => onChange('map_center_lat', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Map center lng</label>
              <input
                type="number"
                step="any"
                className="w-full rounded border border-stone-200 p-2 text-xs"
                value={state.map_center_lng ?? ''}
                onChange={(e) => onChange('map_center_lng', parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-stone-400">Zoom</label>
              <input
                type="number"
                step="1"
                min={1}
                max={18}
                className="w-full rounded border border-stone-200 p-2 text-xs"
                value={state.map_zoom ?? ''}
                onChange={(e) => onChange('map_zoom', parseInt(e.target.value, 10))}
              />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase text-stone-400">Diocese markers</p>
          <ul className="space-y-3">
            {(state.dioceses || []).map((d: any, idx: number) => (
              <li key={idx} className="relative list-none rounded-lg border border-stone-100 bg-stone-50 p-3">
                <button
                  type="button"
                  className="absolute right-2 top-2 text-stone-300 hover:text-red-500"
                  onClick={() =>
                    onChange(
                      'dioceses',
                      (state.dioceses || []).filter((_: unknown, i: number) => i !== idx),
                    )
                  }
                >
                  <X size={14} aria-hidden />
                </button>
                <div className="grid gap-2 pr-8">
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs font-mono"
                    value={d.id ?? ''}
                    onChange={(e) => patchMarker(idx, 'id', e.target.value)}
                    placeholder="Stable id (e.g. kigali)"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.name ?? ''}
                    onChange={(e) => patchMarker(idx, 'name', e.target.value)}
                    placeholder="Display name"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.city ?? ''}
                    onChange={(e) => patchMarker(idx, 'city', e.target.value)}
                    placeholder="City / locality label"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      className="rounded border border-stone-200 p-2 text-xs"
                      value={d.lat ?? ''}
                      onChange={(e) => patchMarker(idx, 'lat', parseFloat(e.target.value))}
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      step="any"
                      className="rounded border border-stone-200 p-2 text-xs"
                      value={d.lng ?? ''}
                      onChange={(e) => patchMarker(idx, 'lng', parseFloat(e.target.value))}
                      placeholder="Longitude"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={Boolean(d.archdiocese)}
                      onChange={(e) => patchMarker(idx, 'archdiocese', e.target.checked)}
                      className="rounded border-stone-300 text-[#7A1515]"
                    />
                    Archdiocese (larger map marker)
                  </label>
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.bishop ?? ''}
                    onChange={(e) => patchMarker(idx, 'bishop', e.target.value || null)}
                    placeholder="Bishop (optional)"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.founded ?? ''}
                    onChange={(e) => patchMarker(idx, 'founded', e.target.value)}
                    placeholder="Founded line (optional)"
                  />
                  <textarea
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    rows={2}
                    value={d.description ?? ''}
                    onChange={(e) => patchMarker(idx, 'description', e.target.value)}
                    placeholder="Short description"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    {d.image ? (
                      <img src={d.image} alt="" className="h-12 w-16 rounded object-cover ring-1 ring-stone-200" />
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-8 text-[10px]"
                      onClick={() => setShowMediaPicker(`diocese_map_pin_${idx}`)}
                    >
                      Pick photo
                    </Button>
                    {showMediaPicker === `diocese_map_pin_${idx}` ? (
                      <MediaPicker
                        isOpen
                        onClose={() => setShowMediaPicker(null)}
                        onSelect={(media: any) => {
                          const url =
                            media && typeof media === 'object' && typeof media.url === 'string'
                              ? media.url
                              : '';
                          setShowMediaPicker(null);
                          if (!url) return;
                          patchMarker(idx, 'image', url);
                        }}
                      />
                    ) : null}
                  </div>
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.phone ?? ''}
                    onChange={(e) => patchMarker(idx, 'phone', e.target.value)}
                    placeholder="Phone"
                  />
                  <input
                    className="w-full rounded border border-stone-200 p-2 text-xs"
                    value={d.website ?? ''}
                    onChange={(e) => patchMarker(idx, 'website', e.target.value)}
                    placeholder="Website URL"
                  />
                </div>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              onChange('dioceses', [
                ...(state.dioceses || []),
                {
                  id: `diocese-${(state.dioceses || []).length + 1}`,
                  name: '',
                  city: '',
                  lat: -1.94,
                  lng: 29.87,
                  archdiocese: false,
                  bishop: '',
                  founded: '',
                  description: '',
                  image: '',
                  phone: '',
                  website: '',
                },
              ])
            }
          >
            <Plus size={14} className="mr-2" /> Add diocese marker
          </Button>
        </div>
      );
    }
    default:
      return <div className="py-8 text-center text-stone-400 text-xs italic">Fields for this type not yet implemented.</div>;
  }
}
