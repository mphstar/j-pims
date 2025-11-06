import { useRef, useEffect, useState } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { Head, Link } from '@inertiajs/react';
import { CursorBullet } from "@/components/organisms/CursorBullet";
import { Section, SectionData } from "@/components/organisms/Section";
import { CarouselSection } from "@/components/organisms/CarouselSection";
import { Logo } from "@/components/atoms/Logo";
import { ScrollProgress } from "@/components/molecules/ScrollProgress";
import { ArrowNav } from "@/components/molecules/ArrowNav";
import { NavDots } from "@/components/molecules/NavDots";
import { Header } from "@/components/templates/Header";
import { OnboardingDialog } from "@/components/molecules/OnboardingDialog";
import { calculatePersonalizationScore, getPersonalizationBadge, getPersonalizationDetails, isPersonalized } from "@/utils/personalization";

// Database interfaces
interface MetadataType {
  activity_level?: string;
  price_range?: string;
  best_season?: string;
  tags?: string[];
  target_age_group?: string[];
  facilities?: string[];
  includes?: string[];
  duration_hours?: number;
  view_count?: number;
  visit_count?: number;
  accessibility?: string;
  requirements?: string[];
  group_size?: { min?: number; max?: number };
}

interface OverlayType {
  id: number;
  overlay_url: string;
  position_horizontal: 'left' | 'center' | 'right' | null;
  position_vertical: 'top' | 'center' | 'bottom' | null;
  object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
  width?: number | null;
  height?: number | null;
}

interface PariwisataType {
  id: number;
  title: string;
  label: string | null;
  subtitle: string;
  slug: string;
  content: string;
  background_url: string;
  cta_href: string;
  cta_label: string;
  align: 'left' | 'right';
  overlays: OverlayType[];
  metadata?: MetadataType;
}

interface ProductType extends PariwisataType {}

interface DestinationType extends PariwisataType {
  products?: ProductType[];
}

interface SettingType {
  style: 'column' | 'row';
}

interface MetadataOptions {
  activity_levels: string[];
  price_ranges: string[];
  best_seasons: string[];
  tags: string[];
}

interface Props {
  pariwisata?: PariwisataType[];
  destinations?: DestinationType[];
  setting: SettingType;
  metadataOptions?: MetadataOptions;
}

// Function to convert database data to SectionData format
// no-op: conversion moved inline to allow injecting product switcher UI



export default function PariwisataView({ pariwisata, destinations, setting, metadataOptions }: Props) {
  // Check if we have 'open' query parameter for direct link mode
  const [isDirectLink, setIsDirectLink] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setIsDirectLink(!!params.get('open'));
    } catch {}
  }, []);

  // ===== Personalization State (localStorage backed) =====
  const safeStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
  // Layout: fixed to column for snap scroll experience
  const layout: 'row' | 'column' = 'column';

  // Label preferences and recent views
  type RecentItem = { slug: string; title: string; bg?: string };
  const [recent, setRecent] = useState<RecentItem[]>(() => {
    try { return JSON.parse(safeStorage?.getItem('jp_recent') || '[]') as RecentItem[]; } catch { return []; }
  });
  useEffect(() => { try { safeStorage?.setItem('jp_recent', JSON.stringify(recent.slice(0, 6))); } catch {} }, [recent]);

  const [labelCounts, setLabelCounts] = useState<Record<string, number>>(() => {
    try { return JSON.parse(safeStorage?.getItem('jp_label_counts') || '{}') as Record<string, number>; } catch { return {}; }
  });
  useEffect(() => { try { safeStorage?.setItem('jp_label_counts', JSON.stringify(labelCounts)); } catch {} }, [labelCounts]);

  // Normalize data: prefer destinations; fallback to pariwisata -> destinations with single product
  const normalizedDestinations: DestinationType[] = (destinations && destinations.length > 0)
    ? destinations
    : (pariwisata || []).map(p => ({ ...p, products: [{ ...p }] }));

  const allLabels = Array.from(new Set(normalizedDestinations.map(p => p.label).filter(Boolean))) as string[];
  const [prefLabels, setPrefLabels] = useState<string[]>(() => {
    try { return JSON.parse(safeStorage?.getItem('jp_pref_labels') || '[]') as string[]; } catch { return []; }
  });
  useEffect(() => { try { safeStorage?.setItem('jp_pref_labels', JSON.stringify(prefLabels)); } catch {} }, [prefLabels]);

  // Metadata preferences for personalization
  const [activityLevels, setActivityLevels] = useState<string[]>(() => {
    try {
      const multi = safeStorage?.getItem('jp_activity_levels');
      if (multi) return JSON.parse(multi);
      const single = safeStorage?.getItem('jp_activity_level');
      return single ? [single] : [];
    } catch { return []; }
  });
  useEffect(() => {
    try {
      safeStorage?.setItem('jp_activity_levels', JSON.stringify(activityLevels));
      // Keep legacy key updated with first choice for backward compat (optional)
      if (activityLevels[0]) safeStorage?.setItem('jp_activity_level', activityLevels[0]);
    } catch {}
  }, [activityLevels]);

  const [priceRanges, setPriceRanges] = useState<string[]>(() => {
    try {
      const multi = safeStorage?.getItem('jp_price_ranges');
      if (multi) return JSON.parse(multi);
      const single = safeStorage?.getItem('jp_price_range');
      return single ? [single] : [];
    } catch { return []; }
  });
  useEffect(() => {
    try {
      safeStorage?.setItem('jp_price_ranges', JSON.stringify(priceRanges));
      if (priceRanges[0]) safeStorage?.setItem('jp_price_range', priceRanges[0]);
    } catch {}
  }, [priceRanges]);

  const [bestSeasons, setBestSeasons] = useState<string[]>(() => {
    try {
      const multi = safeStorage?.getItem('jp_best_seasons');
      if (multi) return JSON.parse(multi);
      const single = safeStorage?.getItem('jp_best_season');
      return single ? [single] : [];
    } catch { return []; }
  });
  useEffect(() => {
    try {
      safeStorage?.setItem('jp_best_seasons', JSON.stringify(bestSeasons));
      if (bestSeasons[0]) safeStorage?.setItem('jp_best_season', bestSeasons[0]);
    } catch {}
  }, [bestSeasons]);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try { return (safeStorage?.getItem('jp_motion') || 'high') === 'reduced'; } catch { return false; }
  });
  useEffect(() => { try { safeStorage?.setItem('jp_motion', reducedMotion ? 'reduced' : 'high'); } catch {} }, [reducedMotion]);

  // Only show onboarding if not a direct link
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => !isDirectLink);
  
  // Update onboarding state when isDirectLink changes
  useEffect(() => {
    if (isDirectLink) {
      setOnboardingOpen(false);
    }
  }, [isDirectLink]);

  const recordClick = (sec: SectionData) => {
    // recent
    if (sec.slug) {
      setRecent(prev => {
        const filtered = prev.filter(r => r.slug !== sec.slug);
        return [{ slug: sec.slug!, title: sec.title, bg: sec.bg }, ...filtered].slice(0, 6);
      });
    }
    // label weights
    if (sec.label) {
      setLabelCounts(prev => ({ ...prev, [sec.label!]: (prev[sec.label!] || 0) + 1 }));
    }
  };

  // Selected product index per destination (persist per slug)
  const [selectedProductIdx, setSelectedProductIdx] = useState<Record<string, number>>(() => {
    try { return JSON.parse(safeStorage?.getItem('jp_selected_product_idx') || '{}') as Record<string, number>; } catch { return {}; }
  });
  useEffect(() => { try { safeStorage?.setItem('jp_selected_product_idx', JSON.stringify(selectedProductIdx)); } catch {} }, [selectedProductIdx]);

  const setProductForSlug = (slug: string, idx: number) => setSelectedProductIdx(prev => ({ ...prev, [slug]: idx }));

  // Deep-linking will be placed after preloader state is available

  // Convert destinations (with selected product) to SectionData[]
  const baseSections: SectionData[] = normalizedDestinations.map((dest, index) => {
    const products = dest.products && dest.products.length > 0 ? dest.products : [{ ...dest } as ProductType];
    const activeIdx = Math.min(Math.max(0, selectedProductIdx[dest.slug] ?? 0), products.length - 1);
    const active = products[activeIdx];
    const overlays = (active.overlays && active.overlays.length > 0 ? active.overlays : dest.overlays) || [];
    const alignVal = (active.align || dest.align) as 'left' | 'right';
    
    // Calculate personalization score based on metadata
    const metadata = active.metadata || dest.metadata;
    const personalizationScore = calculatePersonalizationScore(metadata, {
      activityLevel: activityLevels,
      priceRange: priceRanges,
      bestSeason: bestSeasons,
    });
    const badge = getPersonalizationBadge(personalizationScore);
    const detailBadges = getPersonalizationDetails(metadata, {
      activityLevel: activityLevels,
      priceRange: priceRanges,
      bestSeason: bestSeasons,
    });
    
    return {
      id: dest.slug || `section-${index}`,
      slug: dest.slug,
      label: dest.label ?? undefined,
      title: active.title || dest.title,
  navLabel: dest.label || (dest.title ? dest.title.substring(0, 8) : 'Destinasi'),
      subtitle: active.subtitle || dest.subtitle,
      bg: active.background_url || dest.background_url,
      overlays: overlays.map(overlay => ({
        url: overlay.overlay_url,
        position_horizontal: overlay.position_horizontal,
        position_vertical: overlay.position_vertical,
        object_fit: overlay.object_fit,
        width: overlay.width,
        height: overlay.height
      })),
      align: active.align || dest.align,
      content: (
        <div className={"max-w-xl space-y-4 " + (alignVal === 'right' ? 'ml-auto text-right' : '')}>
          {/* Badge "Rekomendasi Untuk Anda" - Tampil paling atas untuk section pertama */}
          {index === 0 && personalizationScore > 0 && (
            <div className={"flex gap-2 flex-wrap " + (alignVal === 'right' ? 'justify-end' : '')}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500">
                <span>✨</span>
                Rekomendasi Untuk Anda
              </span>
            </div>
          )}
          
          {/* Detail badges dan badge cocok/sangat cocok */}
          {(badge || detailBadges.length > 0) && (
            <div className={"flex gap-2 flex-wrap " + (alignVal === 'right' ? 'justify-end' : '')}>
              {badge && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
                  <span>✨</span>
                  {badge.label}
                </span>
              )}
              {detailBadges.map((detail, idx) => (
                <span key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${detail.color}`}>
                  <span>{detail.icon}</span>
                  {detail.label}
                </span>
              ))}
            </div>
          )}
          <p className="text-white/90">{active.content || dest.content}</p>
          {products.length > 1 && (
            <div className="pt-4">
              <div className={"text-xs text-white/70 mb-2 " + (alignVal === 'right' ? 'text-right' : '')}>Pilih varian produk:</div>
              <div className={"flex gap-2 overflow-x-auto no-scrollbar py-1 pr-1 " + (alignVal === 'right' ? 'justify-end' : '')}>
                {products.map((p, pi) => (
                  <button
                    key={p.id}
                    onClick={() => setProductForSlug(dest.slug, pi)}
                    className={`px-3 h-9 rounded-full border text-xs whitespace-nowrap ${pi===activeIdx ? 'border-white text-white bg-white/10' : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'}`}
                    aria-current={pi===activeIdx ? 'true' : undefined}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
  ctaHref: dest.slug ? `/${dest.slug}/product` : (active.cta_href || dest.cta_href || '#'),
      ctaLabel: active.cta_label || dest.cta_label || 'Lihat',
      personalizationScore, // Store score for sorting
    } as SectionData & { personalizationScore: number };
  });
  
  // Personalized ordering: sort by personalization score + label preferences + click history
  const SECTIONS = [...baseSections].sort((a, b) => {
    // Personalization score (metadata match) - highest priority
    const scoreA = (a as any).personalizationScore || 0;
    const scoreB = (b as any).personalizationScore || 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    
    // Label preferences - second priority
    const wa = (a.label ? (labelCounts[a.label] || 0) : 0) + (a.label && prefLabels.includes(a.label) ? 100 : 0);
    const wb = (b.label ? (labelCounts[b.label] || 0) : 0) + (b.label && prefLabels.includes(b.label) ? 100 : 0);
    return wb - wa;
  });
  const isRowLayout = false;
  
  // ==== Asset Preloader (background & overlays) ====
  const [progress, setProgress] = useState(0); // 0..1
  const [ready, setReady] = useState(false);
  const preloadStarted = useRef(false);
  useEffect(() => {
    if (preloadStarted.current) return; // only once
    preloadStarted.current = true;
    // Preload ALL backgrounds and overlay images from props (not only filtered sections)
    const urls = Array.from(new Set([
      // destination backgrounds
      ...normalizedDestinations.map(d => d.background_url).filter((u): u is string => Boolean(u)),
      // product backgrounds
      ...normalizedDestinations.flatMap(d => (d.products || [{ ...d } as ProductType]).map(p => p.background_url)).filter((u): u is string => Boolean(u)),
      // destination overlays
      ...normalizedDestinations.flatMap(d => (d.overlays || []).map(o => o.overlay_url)).filter((u): u is string => Boolean(u)),
      // product overlays
      ...normalizedDestinations.flatMap(d => (d.products || [{ ...d } as ProductType]).flatMap(p => (p.overlays || []).map(o => o.overlay_url))).filter((u): u is string => Boolean(u))
    ]));
    if (urls.length === 0) { setProgress(1); setReady(true); return; }
    let loaded = 0;
    const start = performance.now();
    
    // Preload with higher priority and proper caching
    const loadPromises = urls.map(u => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        // Set proper cache headers and loading priority
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.loading = 'eager';
        
        const done = () => {
          loaded += 1;
          setProgress(loaded / urls.length);
          if (loaded === urls.length) {
            const elapsed = performance.now() - start;
            const minDelay = 550; // ms for nicer fade
            const wait = Math.max(0, minDelay - elapsed);
            setTimeout(() => setReady(true), wait);
          }
          resolve();
        };
        img.onload = done; 
        img.onerror = done; 
        img.src = u;
      });
    });
    
    // Force browser to cache these images immediately
    Promise.all(loadPromises).then(() => {
      // Additional caching optimization
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          urls.forEach(url => {
            // Preload for high priority display
            const preload = document.createElement('link');
            preload.rel = 'preload';
            (preload as any).as = 'image';
            preload.href = url;
            document.head.appendChild(preload);
            // Prefetch for subsequent navigations
            const prefetch = document.createElement('link');
            prefetch.rel = 'prefetch';
            prefetch.href = url;
            document.head.appendChild(prefetch);
          });
        });
      }
    });
  }, []);

  // Deep-linking: support open=<slug>&product=<index>
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetSlug = params.get('open');
      const prodIdxRaw = params.get('product');
      if (targetSlug) {
        const destIndex = normalizedDestinations.findIndex(d => d.slug === targetSlug);
        if (destIndex >= 0) {
          // apply product index if present
          if (prodIdxRaw) {
            const pi = Math.max(0, Math.min(Number(prodIdxRaw) || 0, (normalizedDestinations[destIndex].products?.length || 1) - 1));
            setProductForSlug(targetSlug, pi);
          }
          if (ready) {
            const id = setTimeout(() => scrollToIndex(destIndex, { overshoot: false }), 50);
            return () => clearTimeout(id);
          }
        }
      }
    } catch {}
  }, [ready, normalizedDestinations]);

  // Konfigurasi kecepatan animasi (mudah diubah)
  const SCROLL_CONF = {
    overshootRatio: 0.08,      // semula 0.12 (lebih kecil => lebih tenang)
    overshootMin: 36,          // px (semula 48)
    overshootMax: 100,         // px (semula 140)
    phase1Duration: 0.38,      // semula 0.27
    directDuration: 0.55,      // semula 0.42
    springStiffness: 150,      // semula 210
    springDamping: 30,         // semula 28 (lebih tinggi => cepat settle tanpa bounce liar)
  } as const;
  // gunakan union | null eksplisit agar konsisten dengan prop ScrollProgress
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const scrollAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const isAnimatingRef = useRef(false);
  const isStabilizingRef = useRef(false);
  const lastSlugRef = useRef<string | null>(null);

  // Carousel-specific state
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Observe section masuk viewport untuk highlight nav (re-init setelah ready)
  useEffect(() => {
    if (!ready || isRowLayout) return; // skip for carousel mode
    const rootEl = containerRef.current;
    if (!rootEl) return;
    const els = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // Don't update active state during stabilization to prevent race condition
            if (isStabilizingRef.current) return;
            const idx = els.findIndex((el) => el === e.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { root: rootEl, threshold: 0.5 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ready, isRowLayout, SECTIONS.length]);

  // Track last visible slug for stabilization across filter/sort changes
  useEffect(() => {
    lastSlugRef.current = SECTIONS[active]?.id || null;
  }, [active, SECTIONS]);

  // When personalization filters/sorting change, keep the same section in view if possible
  useEffect(() => {
    if (!ready) return;
    const slug = lastSlugRef.current;
    if (!slug) return;
    
    // Trim stale refs immediately to match new SECTIONS
    sectionRefs.current.length = SECTIONS.length;
    
    // Find new index for the last visible slug
    const idx = SECTIONS.findIndex(s => s.id === slug);
    const targetIdx = idx >= 0 ? idx : 0;
    
    // Defer to next frame so DOM updates
    const id = requestAnimationFrame(() => {
      // If we're in carousel mode, update currentSlide directly without scroll
      if (isRowLayout) {
        isStabilizingRef.current = true;
        setCurrentSlide(targetIdx);
        setActive(targetIdx);
        setTimeout(() => { isStabilizingRef.current = false; }, 80);
        return;
      }

      // Column layout: temporarily disable snap and scroll without animation
      const container = containerRef.current;
      const targetEl = sectionRefs.current[targetIdx];
      if (!container || !targetEl) {
        // Fallback: just update active state
        setActive(targetIdx);
        return;
      }
      
      isStabilizingRef.current = true;
      const prevSnap = container.style.scrollSnapType;
      container.style.scrollSnapType = 'none';
      
      // Instant scroll to prevent NavDots from jumping
      container.scrollTop = targetEl.offsetTop;
      setActive(targetIdx);

      // Restore snap after a longer delay to ensure IntersectionObserver doesn't override
      setTimeout(() => {
        if (container) container.style.scrollSnapType = prevSnap || '';
        isStabilizingRef.current = false;
      }, 250);
    });
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefLabels, labelCounts, activityLevels, priceRanges, bestSeasons]);

  const scrollToIndex = (idx: number, opts?: { overshoot?: boolean; behavior?: ScrollBehavior }) => {
    if (isStabilizingRef.current && opts?.behavior !== 'auto') return; // ignore user nav while stabilizing
    if (isRowLayout) {
      // Carousel navigation
      const carousel = carouselRef.current;
      if (!carousel) return;
      
      if (idx < 0) idx = 0;
      if (idx >= SECTIONS.length) idx = SECTIONS.length - 1;
      
      setCurrentSlide(idx);
      setActive(idx);
      
      return;
    }
    
    // Original column layout logic (simplified for smooth and light scrolling)
  const container = containerRef.current;
    const targetEl = sectionRefs.current[idx];
    if (!container || !targetEl) return;
    // Prefer native smooth scroll for best performance across devices
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || reducedMotion;
    const behavior: ScrollBehavior = opts?.behavior || (prefersReduced ? 'smooth' : 'smooth');
    container.scrollTo({ top: targetEl.offsetTop, behavior });
  };

  // Event listeners for both layouts
  useEffect(() => {
    if (!ready) return;
    
    if (isRowLayout) {
      // Carousel navigation - simplified
      const handleKeyDown = (e: KeyboardEvent) => {
        if (isAnimatingRef.current) return;
        
        let nextSlide = currentSlide;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextSlide = Math.max(0, currentSlide - 1);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextSlide = Math.min(SECTIONS.length - 1, currentSlide + 1);
        }
        
        if (nextSlide !== currentSlide) {
          scrollToIndex(nextSlide);
        }
      };
      
      const handleWheel = (e: WheelEvent) => {
        if (isAnimatingRef.current) return;
        
        e.preventDefault();
        const direction = Math.sign(e.deltaY);
        const nextSlide = Math.max(0, Math.min(SECTIONS.length - 1, currentSlide + direction));
        
        if (nextSlide !== currentSlide) {
          scrollToIndex(nextSlide);
        }
      };
      
      // Touch/swipe support - simplified
      let touchStartX = 0;
      let touchStartTime = 0;
      
      const handleTouchStart = (e: TouchEvent) => {
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
      };
      
      const handleTouchEnd = (e: TouchEvent) => {
        if (isAnimatingRef.current) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndTime = Date.now();
        const deltaX = touchEndX - touchStartX;
        const deltaTime = touchEndTime - touchStartTime;
        
        // Only trigger if it's a quick swipe with sufficient distance
        if (deltaTime < 300 && Math.abs(deltaX) > 80) {
          const direction = deltaX > 0 ? -1 : 1; // Swipe right = previous, swipe left = next
          const nextSlide = Math.max(0, Math.min(SECTIONS.length - 1, currentSlide + direction));
          
          if (nextSlide !== currentSlide) {
            scrollToIndex(nextSlide);
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      const carousel = carouselRef.current;
      if (carousel) {
        carousel.addEventListener('wheel', handleWheel, { passive: false });
        carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
        carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
      }
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (carousel) {
          carousel.removeEventListener('wheel', handleWheel);
          carousel.removeEventListener('touchstart', handleTouchStart);
          carousel.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
    
    // Original column layout listeners
    const el = containerRef.current;
    if (!el) return;
    const lastRef = { current: 0 };
    const cooldown = 420;
    const nearestIndex = () => {
      const container = containerRef.current; if (!container) return active;
      const st = container.scrollTop; const ch = container.clientHeight;
      let best = 0; let bestDist = Number.POSITIVE_INFINITY;
      sectionRefs.current.forEach((sec, i) => {
        if (!sec) return; const mid = sec.offsetTop + sec.offsetHeight / 2;
        const dist = Math.abs((st + ch / 2) - mid); if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    };
    const onWheel = (e: WheelEvent) => {
      if (isStabilizingRef.current) { e.preventDefault(); return; }
      if (isAnimatingRef.current) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = performance.now();
      if (now - lastRef.current < cooldown) return; // biarkan native mikro-geser di antara cooldown
      if (Math.abs(e.deltaY) < 40) return;
      e.preventDefault();
      lastRef.current = now;
      const current = nearestIndex();
      let next = current + (e.deltaY > 0 ? 1 : -1);
      if (next < 0) next = 0; else if (next >= SECTIONS.length) next = SECTIONS.length - 1;
      if (next !== active) scrollToIndex(next);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [active, ready]);

  // ===== Mobile natural snap assist (sederhana anti-glitch) =====
  useEffect(() => {
    if (!ready || isRowLayout) return; // skip for carousel mode
    const el = containerRef.current; 
    if (!el) return;
    const isCoarse = window.matchMedia('(pointer:coarse)').matches; if (!isCoarse) return;
    let idleTimer: number | null = null;
    const IDLE_DELAY = 120; // ms setelah momentum berhenti
    const snapToNearest = () => {
      if (isAnimatingRef.current) return; const container = containerRef.current; if (!container) return;
      const scrollTop = container.scrollTop; let best = 0; let bestDist = Infinity;
      sectionRefs.current.forEach((sec, i) => { if (!sec) return; const d = Math.abs(sec.offsetTop - scrollTop); if (d < bestDist) { bestDist = d; best = i; } });
      const target = sectionRefs.current[best]; if (!target) return; const diff = Math.abs(target.offsetTop - scrollTop); if (diff < 14) return;
      // Gunakan native smooth agar tidak jitter (tanpa overshoot)
      container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    };
    const onScroll = () => { if (idleTimer) clearTimeout(idleTimer); idleTimer = window.setTimeout(snapToNearest, IDLE_DELAY); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (idleTimer) clearTimeout(idleTimer); };
  }, [active, ready, isRowLayout]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white relative overflow-hidden" aria-busy="true" aria-label="Memuat aset">
        <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)] animate-pulse pointer-events-none bg-[conic-gradient(from_0deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%,rgba(255,255,255,0.08))]" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="font-semibold tracking-wide text-lg">J-PiMS</span>
          </div>
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-[width] duration-300 ease-out" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="text-xs font-mono tracking-wider text-white/70">{Math.round(progress * 100)}%</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Onboarding dialog (first visit or when reopened) - Hide for direct links */}
      {!isDirectLink && (
        <OnboardingDialog
          open={onboardingOpen}
          onOpenChange={(v) => {
            setOnboardingOpen(v);
          }}
          labels={allLabels}
          initialPrefLabels={prefLabels}
          initialMotion={reducedMotion ? 'reduced' : 'high'}
          metadataOptions={metadataOptions}
          onSave={({ prefLabels: pl, motion, activityLevels: als, priceRanges: prs, bestSeasons: bss }) => {
            setPrefLabels(pl);
            setReducedMotion(motion === 'reduced');
            if (als) setActivityLevels(als);
            if (prs) setPriceRanges(prs);
            if (bss) setBestSeasons(bss);
          }}
        />
      )}
      <Head title="Destinasi Pariwisata" />
      {isRowLayout ? (
        // Carousel Layout
        <div className="h-screen w-screen overflow-hidden relative">
          <Header 
            active={currentSlide} 
            onJump={scrollToIndex} 
            sections={SECTIONS} 
            brand="J-PiMS"
            actions={(
              <div className="flex items-center gap-2">
                {isDirectLink ? (
                  // Direct link mode - only show back button
                  <Link
                    href={route('home')}
                    className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center"
                  >
                    Kembali
                  </Link>
                ) : (
                  <>
                    {/* Search button */}
                    <Link
                      href={route('search')}
                      className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center gap-2"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-4 h-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Cari
                    </Link>
                    {/* Re-open onboarding */}
                    <button
                      onClick={() => {
                        setOnboardingOpen(true);
                      }}
                      className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center"
                    >
                      Personalisasi
                    </button>
                  </>
                )}
                {/* Personalized ordering only; filter UI removed intentionally */}
                {/* Removed 'Lanjutkan' quick link per request */}
              </div>
            )}
          />
          <NavDots 
            count={SECTIONS.length} 
            active={currentSlide} 
            onJump={scrollToIndex}
            sections={SECTIONS}
          />
          
          <div
            ref={carouselRef}
            className="flex h-full w-full carousel-container"
            style={{ 
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: isAnimatingRef.current ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.85, 0.35, 1)'
            }}
          >
            {SECTIONS.map((s, i) => (
              <div key={s.id} className="carousel-slide">
                <CarouselSection
                  ref={(el: HTMLDivElement | null) => { sectionRefs.current[i] = el; }}
                  data={s}
                  index={i}
                  isActive={i === currentSlide}
                  onCtaClick={recordClick}
                />
              </div>
            ))}
          </div>
          <ArrowNav 
            active={currentSlide} 
            onJump={scrollToIndex} 
            total={SECTIONS.length} 
          />
          <CursorBullet />
        </div>
      ) : (
        // Column Layout (Original)
        <div
          ref={containerRef}
          data-scroll-root="true"
          className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-black"
          style={{ scrollPaddingTop: '56px' }}
        >
          <Header 
            active={active} 
            onJump={scrollToIndex} 
            sections={SECTIONS} 
            brand="J-PiMS"
            actions={(
              <div className="flex items-center gap-2">
                {isDirectLink ? (
                  // Direct link mode - only show back button
                  <Link
                    href={route('home')}
                    className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center"
                  >
                    Kembali
                  </Link>
                ) : (
                  <>
                    {/* Search button */}
                    <Link
                      href={route('search')}
                      className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center gap-2"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-4 h-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                      Cari
                    </Link>
                    <button
                      onClick={() => {
                        setOnboardingOpen(true);
                      }}
                      className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center"
                    >
                      Personalisasi
                    </button>
                  </>
                )}
                {/* Personalized ordering only; filter UI removed intentionally */}
                {/* Removed 'Lanjutkan' quick link per request */}
              </div>
            )}
          />
          <NavDots count={SECTIONS.length} active={active} onJump={scrollToIndex} sections={SECTIONS} />
          
          {SECTIONS.map((s, i) => (
            <Section
              key={s.id}
              ref={(el: HTMLDivElement | null) => { sectionRefs.current[i] = el; }}
              data={s}
              index={i}
              onCtaClick={recordClick}
            />
          ))}
          <ScrollProgress targetRef={containerRef} />
          <ArrowNav active={active} onJump={scrollToIndex} total={SECTIONS.length} />
          <CursorBullet />
        </div>
      )}
    </>
  );
}

/** ====== UI PARTS ====== */

// Tambahkan keyframes global via injection (sekali)
// (Pendekatan sederhana tanpa file CSS terpisah)
const styleId = "__shine_keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const el = document.createElement("style");
  el.id = styleId;
  el.textContent = `
@keyframes shine {
  0% {opacity:0; transform:translateX(0);} 
  40% {opacity:0.85;} 
  100% {opacity:0; transform:translateX(220%);} 
}
@keyframes overlayZoomIn {
  0% {opacity:0; transform:scale(1.15);} 
  60% {opacity:.85;} 
  100% {opacity:1; transform:scale(1);} 
}

/* Optimize background image rendering */
[style*="background-image"] {
  backface-visibility: hidden;
  transform: translateZ(0);
  image-rendering: optimizeQuality;
  image-rendering: -webkit-optimize-contrast;
}

/* Smooth scroll performance */
/* Let JS/native smooth scrolling control the behavior (no override here) */

/* Contain momentum to avoid bouncing back to previous snap */
.snap-y {
  overscroll-behavior-y: contain;
}

/* Prevent layout shifts during image transitions */
section {
  contain: layout style paint;
}

/* Optimize overlay rendering */
.overlay-container {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Carousel specific optimizations */
.carousel-container {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Prevent layout shifts in carousel */
.carousel-slide {
  min-width: 100vw;
  max-width: 100vw;
  contain: layout style paint;
}
`;
  document.head.appendChild(el);
}
