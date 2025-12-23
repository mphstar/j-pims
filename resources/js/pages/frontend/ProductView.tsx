import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Section, type SectionData } from '@/components/organisms/Section';
import { ArrowNav } from '@/components/molecules/ArrowNav';
import { CursorBullet } from '@/components/organisms/CursorBullet';
import { Logo } from '@/components/atoms/Logo';
import { Header } from '@/components/templates/Header';
import { NavDots } from '@/components/molecules/NavDots';
import { ScrollProgress } from '@/components/molecules/ScrollProgress';
import { FancyButton } from '@/components/atoms/FancyButton';
import { calculatePersonalizationScore, getPersonalizationBadge, getPersonalizationDetails } from '@/utils/personalization';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

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

interface ItemType {
    id: number;
    title: string;
    label?: string | null;
    subtitle?: string | null;
    slug: string;
    content?: string | null;
    background_url?: string | null;
    cta_href?: string | null;
    cta_label?: string | null;
    align: 'left' | 'right';
    overlays?: OverlayType[];
    metadata?: MetadataType;
}

interface Props {
    destination: ItemType & { overlays?: OverlayType[] };
    product?: ItemType & { overlays?: OverlayType[] };
    products?: (ItemType & { overlays?: OverlayType[] })[];
}

export default function ProductView({ destination, product, products }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [active, setActive] = useState(0);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const isAnimatingRef = useRef(false);
    const isStabilizingRef = useRef(false);

    // Personalization state (read from localStorage)
    const safeStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
    const [activityLevels, setActivityLevels] = useState<string[]>(() => {
        try {
            const multi = safeStorage?.getItem('jp_activity_levels');
            if (multi) return JSON.parse(multi);
            const single = safeStorage?.getItem('jp_activity_level');
            return single ? [single] : [];
        } catch { return []; }
    });
    const [priceRanges, setPriceRanges] = useState<string[]>(() => {
        try {
            const multi = safeStorage?.getItem('jp_price_ranges');
            if (multi) return JSON.parse(multi);
            const single = safeStorage?.getItem('jp_price_range');
            return single ? [single] : [];
        } catch { return []; }
    });
    const [bestSeasons, setBestSeasons] = useState<string[]>(() => {
        try {
            const multi = safeStorage?.getItem('jp_best_seasons');
            if (multi) return JSON.parse(multi);
            const single = safeStorage?.getItem('jp_best_season');
            return single ? [single] : [];
        } catch { return []; }
    });
    const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
        try { return (safeStorage?.getItem('jp_motion') || 'high') === 'reduced'; } catch { return false; }
    });

    // Preload background + overlays (product first, fallback dest overlays)
    const prods = useMemo(() => (products && products.length ? products : (product ? [product] : [])), [products, product]);

    // Preload backgrounds and overlays for all products and destination overlays for fallback
    useEffect(() => {
        const urls = [
            ...prods.map(p => p.background_url).filter(Boolean) as string[],
            ...prods.flatMap(p => (p.overlays || []).map(o => o.overlay_url)).filter(Boolean) as string[],
            ...((destination.overlays || []).map(o => o.overlay_url))
        ].filter(Boolean) as string[];
        if (urls.length === 0) { setReady(true); setProgress(1); return; }
        let loaded = 0;
        urls.forEach(u => {
            const img = new Image();
            const done = () => { loaded += 1; setProgress(loaded / urls.length); if (loaded === urls.length) setTimeout(() => setReady(true), 200); };
            img.onload = done; img.onerror = done; img.src = u;
        });
    }, [prods, destination]);

    const SECTIONS: SectionData[] = useMemo(() => prods.map((p, index) => {
        const ov = (p.overlays && p.overlays.length > 0 ? p.overlays : destination.overlays) || [];
        const alignVal = p.align;
        const idx = index; // Store index for use in dialog ID

        // Calculate personalization score based on metadata
        const metadata = p.metadata || destination.metadata;
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
            id: p.slug,
            slug: p.slug,
            label: p.label || undefined,
            title: p.title,
            navLabel: p.label || (p.title ? p.title.substring(0, 8) : 'Produk'),
            subtitle: p.subtitle || undefined,
            bg: p.background_url || undefined,
            overlays: ov.map(o => ({
                url: o.overlay_url,
                position_horizontal: o.position_horizontal,
                position_vertical: o.position_vertical,
                object_fit: o.object_fit,
                width: o.width,
                height: o.height
            })),
            align: p.align,
            content: (
                <div className={"max-w-xl space-y-3 " + (alignVal === 'right' ? 'ml-auto text-right' : '')}>
                    {/* Badge "Rekomendasi Untuk Anda" - Tampil paling atas untuk section pertama */}
                    {index === 0 && personalizationScore > 0 && (
                        <div className={"flex gap-1.5 md:gap-2 flex-wrap " + (alignVal === 'right' ? 'justify-end' : '')}>
                            <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500">
                                ✨ Rekomendasi
                            </span>
                        </div>
                    )}

                    {/* Detail badges dan badge cocok/sangat cocok */}
                    {(badge || detailBadges.length > 0) && (
                        <div className={"flex gap-1.5 md:gap-2 flex-wrap " + (alignVal === 'right' ? 'justify-end' : '')}>
                            {badge && (
                                <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-white ${badge.color}`}>
                                    ✨ {badge.label}
                                </span>
                            )}
                            {detailBadges.map((detail, idx) => (
                                <span key={idx} className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-white ${detail.color}`}>
                                    {detail.icon} {detail.label}
                                </span>
                            ))}
                        </div>
                    )}
                    <MarkdownRenderer content={p.content || destination.content || ''} className="text-white/90" />

                    {/* Action Buttons Row - Detail & CTA */}
                    <div className={"flex flex-wrap items-center gap-2 md:gap-3 pt-2 " + (alignVal === 'right' ? 'justify-end' : '')}>
                        {/* View Details Button */}
                        {(metadata?.includes?.length || metadata?.requirements?.length || metadata?.group_size || metadata?.duration_hours) && (
                            <FancyButton
                                onClick={() => {
                                    const detailDialog = document.getElementById(`detail-dialog-${idx}`);
                                    if (detailDialog) {
                                        (detailDialog as HTMLDialogElement).showModal();
                                    }
                                }}
                                variant="secondary"
                                icon={
                                    <svg className="h-4 w-4 transition-colors duration-500 group-hover:stroke-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                            >
                                Detail Paket
                            </FancyButton>
                        )}

                        {/* CTA Button */}
                        {(p.cta_href || "#") && (
                            <FancyButton href={p.cta_href || "#"}>
                                {p.cta_label || 'Pilih Paket'}
                            </FancyButton>
                        )}
                    </div>
                </div>
            ),
            ctaHref: undefined, // Disable default CTA rendering in Section
            ctaLabel: undefined,
            personalizationScore,
            metadata,
        } as SectionData & { personalizationScore: number; metadata?: MetadataType };
    }), [prods, destination, activityLevels, priceRanges, bestSeasons]);

    const scrollToIndex = (idx: number, opts?: { overshoot?: boolean; behavior?: ScrollBehavior }) => {
        if (isStabilizingRef.current && opts?.behavior !== 'auto') return;
        const container = containerRef.current;
        const targetEl = sectionRefs.current[idx];
        if (!container || !targetEl) return;
        // Prefer native smooth scroll for best performance
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || reducedMotion;
        const behavior: ScrollBehavior = opts?.behavior || (prefersReduced ? 'smooth' : 'smooth');
        container.scrollTo({ top: targetEl.offsetTop, behavior });
    };

    // Track active index based on scroll position
    useEffect(() => {
        if (!ready) return;
        const container = containerRef.current;
        if (!container) return;
        const els = sectionRefs.current.filter(Boolean) as HTMLDivElement[];

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        if (isStabilizingRef.current) return;
                        const idx = els.findIndex((el) => el === e.target);
                        if (idx !== -1) setActive(idx);
                    }
                });
            },
            { root: container, threshold: 0.5 }
        );
        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [ready, SECTIONS.length]);





    if (!ready) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-white relative overflow-hidden" aria-busy="true" aria-label="Memuat aset">
                <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)] animate-pulse pointer-events-none bg-[conic-gradient(from_0deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%,rgba(255,255,255,0.08))]" />
                <div className="relative z-10 flex flex-col items-center gap-8 px-6">
                    <div className="flex flex-col text-center items-center gap-4">
                        <Logo />
                        <div className="flex flex-col">
                            <span className="font-semibold tracking-wide text-lg">J-PiMS</span>
                            <span className="text-sm text-white/80 ">Jember Personalized Tourism Information Management System</span>
                        </div>
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
            <Head title={`${(prods[0]?.title ?? 'Produk')} • Produk`} />
            {/* Header consistent with ParwisataView */}
            <Header
                active={active}
                onJump={scrollToIndex}
                sections={SECTIONS}
                brand="J-PiMS"
                actions={(
                    <div className="flex items-center gap-2">
                        {/* Search button */}
                        <Link
                            href={route('search')}
                            className="px-2 sm:px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center gap-2"
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
                            <span className="hidden sm:inline">Cari</span>
                        </Link>
                        <Link
                            href={route('home')}
                            className="px-2 sm:px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center gap-2"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            <span className="hidden sm:inline">Kembali</span>
                        </Link>
                    </div>
                )}
            />
            <NavDots count={SECTIONS.length} active={active} onJump={scrollToIndex} sections={SECTIONS} />
            <div
                ref={containerRef}
                data-scroll-root="true"
                className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-black"
                style={{
                    scrollSnapType: 'y mandatory',
                    overflowY: 'scroll',
                }}
            >
                {SECTIONS.map((s, i) => (
                    <Section key={s.id}
                        ref={(el) => { sectionRefs.current[i] = el; }}
                        data={s}
                        index={i}
                        onCtaClick={() => { }}
                    />
                ))}
                <ScrollProgress targetRef={containerRef} />
                <ArrowNav active={active} onJump={scrollToIndex} total={SECTIONS.length} />
                <CursorBullet />
            </div>

            {/* Package Detail Dialogs */}
            {SECTIONS.map((section, sectionIdx) => {
                const metadata = (section as any).metadata as MetadataType | undefined;
                if (!metadata || (!metadata.includes?.length && !metadata.requirements?.length && !metadata.group_size && !metadata.duration_hours)) {
                    return null;
                }

                const productData = prods?.[sectionIdx];
                const title = productData?.title || destination.title;

                return (
                    <dialog
                        key={`dialog-${sectionIdx}`}
                        id={`detail-dialog-${sectionIdx}`}
                        className="backdrop:bg-black/80 bg-transparent rounded-2xl p-0 max-w-lg w-[calc(100%-2rem)] shadow-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0"
                        onClick={(e) => {
                            // Close when clicking on backdrop
                            if (e.target === e.currentTarget) {
                                (e.currentTarget as HTMLDialogElement).close();
                            }
                        }}
                    >
                        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/10">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{title}</h3>
                                    <p className="text-white/60 text-xs mt-0.5">Detail Informasi Paket</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        const dialog = (e.target as HTMLElement).closest('dialog');
                                        if (dialog) (dialog as HTMLDialogElement).close();
                                    }}
                                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                                {/* Quick Stats */}
                                <div className="flex flex-wrap gap-2">
                                    {metadata.group_size && (metadata.group_size.min || metadata.group_size.max) && (
                                        <div className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                            <div className="text-2xl">👥</div>
                                            <div>
                                                <div className="text-white/60 text-xs">Ukuran Grup</div>
                                                <div className="text-white font-semibold text-sm">
                                                    {metadata.group_size.min && metadata.group_size.max
                                                        ? `${metadata.group_size.min}-${metadata.group_size.max} orang`
                                                        : metadata.group_size.min
                                                            ? `Min ${metadata.group_size.min} orang`
                                                            : `Max ${metadata.group_size.max} orang`}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {metadata.duration_hours && metadata.duration_hours > 0 && (
                                        <div className="flex-1 min-w-[140px] bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                                            <div className="text-2xl">⏱️</div>
                                            <div>
                                                <div className="text-white/60 text-xs">Durasi</div>
                                                <div className="text-white font-semibold text-sm">
                                                    {metadata.duration_hours >= 24
                                                        ? `${Math.floor(metadata.duration_hours / 24)} Hari ${metadata.duration_hours % 24 > 0 ? `${metadata.duration_hours % 24} Jam` : ''}`
                                                        : `${metadata.duration_hours} Jam`}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Package Includes */}
                                {metadata.includes && metadata.includes.length > 0 && (
                                    <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">📦</span>
                                            <h4 className="text-white font-bold text-base">Termasuk dalam Paket</h4>
                                        </div>
                                        <div className="grid gap-2">
                                            {metadata.includes.map((item: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-green-400 text-lg leading-none mt-0.5">✓</span>
                                                    <span className="text-white/90 flex-1">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Requirements */}
                                {metadata.requirements && metadata.requirements.length > 0 && (
                                    <div className="bg-gradient-to-br from-amber-600/10 to-orange-600/10 border border-amber-500/20 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">📋</span>
                                            <h4 className="text-white font-bold text-base">Persyaratan & Persiapan</h4>
                                        </div>
                                        <div className="grid gap-2">
                                            {metadata.requirements.map((item: string, idx: number) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm">
                                                    <span className="text-amber-400 text-base leading-none mt-0.5">•</span>
                                                    <span className="text-white/90 flex-1">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-white/5 border-t border-white/10 p-4 flex justify-end">
                                <button
                                    onClick={(e) => {
                                        const dialog = (e.target as HTMLElement).closest('dialog');
                                        if (dialog) (dialog as HTMLDialogElement).close();
                                    }}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </dialog>
                );
            })}
        </>
    );
}

/** ====== CSS OPTIMIZATIONS ====== */

// Add CSS optimizations for better scroll performance
const styleId = "__product_view_styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
    const el = document.createElement("style");
    el.id = styleId;
    el.textContent = `
/* Optimize background image rendering */
[style*="background-image"] {
  backface-visibility: hidden;
  transform: translateZ(0);
  image-rendering: optimizeQuality;
  image-rendering: -webkit-optimize-contrast;
}

/* Contain momentum to avoid bouncing back to previous snap */
.snap-y {
  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;
}

/* Prevent layout shifts during scroll */
section {
  contain: layout style paint;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

/* Optimize overlay rendering */
.overlay-container {
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Scrollbar styling for content within sections */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Prevent overscroll in section content */
section > div.overflow-y-auto {
  overscroll-behavior-y: contain;
  -webkit-overflow-scrolling: touch;
}
`;
    document.head.appendChild(el);
}
