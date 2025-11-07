import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Section, type SectionData } from '@/components/organisms/Section';
import { CursorBullet } from '@/components/organisms/CursorBullet';
import { ArrowNav } from '@/components/molecules/ArrowNav';
import { NavDots } from '@/components/molecules/NavDots';
import { Header } from '@/components/templates/Header';
import { ScrollProgress } from '@/components/molecules/ScrollProgress';
import { Logo } from '@/components/atoms/Logo';

interface DestinationOverlay {
    overlay_url: string;
    position_horizontal: 'left' | 'center' | 'right' | null;
    position_vertical: 'top' | 'center' | 'bottom' | null;
    object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
    width?: number | null;
    height?: number | null;
}

interface StoryProps {
    id: number;
    title: string;
    slug: string;
    label?: string | null;
    subtitle?: string | null;
    content?: string | null;
    background_url?: string | null;
    cta_href?: string | null;
    cta_label?: string | null;
    align: 'left' | 'right';
    overlays?: DestinationOverlay[];
}

interface Props {
    stories: StoryProps[];
    productHref: string;
    setting?: { style: 'column' | 'row' };
}

export default function CeritaView({ stories, productHref }: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sectionRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [active, setActive] = useState(0);
    const [ready, setReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const headerRef = useRef<HTMLDivElement | null>(null);
    const [headerH, setHeaderH] = useState<number>(56);
    const isAnimatingRef = useRef(false);
    // Keep identical scroll behavior with PariwisataView (fixed top padding)

    // Preload background and overlay images for a smooth entry
    useEffect(() => {
        const urls: string[] = [];
        (stories || []).forEach(story => {
            if (story.background_url) urls.push(story.background_url);
            (story.overlays || []).forEach(o => { if (o.overlay_url) urls.push(o.overlay_url); });
        });
        if (urls.length === 0) { setReady(true); setProgress(1); return; }
        let loaded = 0;
        urls.forEach(u => {
            const img = new Image();
            const done = () => {
                loaded += 1;
                setProgress(loaded / urls.length);
                if (loaded === urls.length) setTimeout(() => setReady(true), 150);
            };
            img.onload = done; img.onerror = done; img.src = u;
        });
    }, [stories]);

        const sections: SectionData[] = (stories || []).map((story, idx) => {
            const isLast = idx === (stories?.length || 0) - 1;
            return ({
        id: story.slug + '-' + idx,
        slug: story.slug,
        label: story.label || undefined,
        title: story.title,
        navLabel: story.label || story.title || `Cerita ${idx + 1}`,
        subtitle: story.subtitle || undefined,
        bg: story.background_url || undefined,
        overlays: (story.overlays || []).map(ov => ({
            url: ov.overlay_url,
            position_horizontal: ov.position_horizontal,
            position_vertical: ov.position_vertical,
            object_fit: ov.object_fit,
            width: ov.width,
            height: ov.height,
        })),
        align: story.align,
        content: (
            <div className={"max-w-xl space-y-4 " + (story.align === 'right' ? 'ml-auto text-right' : '')}>
                {story.content && (
                    <p className="text-white/90">{story.content}</p>
                )}
            </div>
        ),
            // Show CTA only on the last section
            ctaHref: isLast ? productHref : undefined,
            ctaLabel: isLast ? 'Lihat Produk' : undefined,
        });
        });

    // Keep header/nav dots in sync (same as PariwisataView)
    useEffect(() => {
        if (!ready) return;
        const container = containerRef.current; if (!container) return;
        const els = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const idx = els.findIndex(el => el === e.target);
                    if (idx !== -1) setActive(idx);
                }
            });
        }, { root: container, threshold: 0.5 });
        els.forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [ready]);

    // Measure actual header height (mobile header is taller ~64px)
    useLayoutEffect(() => {
        const update = () => {
            const h = headerRef.current?.offsetHeight || 56;
            setHeaderH(h);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    const scrollToIndex = (idx: number) => {
        const container = containerRef.current; const targetEl = sectionRefs.current[idx];
        if (!container || !targetEl) return;
        container.scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' });
    };

    // Wheel-based paging like PariwisataView (column layout)
    useEffect(() => {
        if (!ready) return;
        const el = containerRef.current; if (!el) return;
        const lastRef = { current: 0 } as { current: number };
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
            if (isAnimatingRef.current) { e.preventDefault(); return; }
            if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
            const now = performance.now();
            if (now - lastRef.current < cooldown) return;
            if (Math.abs(e.deltaY) < 40) return;
            e.preventDefault();
            lastRef.current = now;
            const current = nearestIndex();
            let next = current + (e.deltaY > 0 ? 1 : -1);
            if (next < 0) next = 0; else if (next >= sections.length) next = sections.length - 1;
            if (next !== active) scrollToIndex(next);
        };
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [active, ready]);

    // Mobile natural snap assist (like PariwisataView)
    useEffect(() => {
        if (!ready) return;
        const el = containerRef.current; if (!el) return;
        const isCoarse = window.matchMedia('(pointer:coarse)').matches; if (!isCoarse) return;
        let idleTimer: number | null = null;
        const IDLE_DELAY = 120;
        const snapToNearest = () => {
            if (isAnimatingRef.current) return; const container = containerRef.current; if (!container) return;
            const scrollTop = container.scrollTop; let best = 0; let bestDist = Infinity;
            sectionRefs.current.forEach((sec, i) => { if (!sec) return; const d = Math.abs(sec.offsetTop - scrollTop); if (d < bestDist) { bestDist = d; best = i; } });
            const target = sectionRefs.current[best]; if (!target) return; const diff = Math.abs(target.offsetTop - scrollTop); if (diff < 14) return;
            container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        };
        const onScroll = () => { if (idleTimer) clearTimeout(idleTimer); idleTimer = window.setTimeout(snapToNearest, IDLE_DELAY); };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => { el.removeEventListener('scroll', onScroll); if (idleTimer) clearTimeout(idleTimer); };
    }, [active, ready]);

    if (!ready) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-white relative overflow-hidden" aria-busy="true" aria-label="Memuat cerita">
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
            <Head title={`${sections[0]?.title ?? 'Cerita'} • Cerita`} />
            <div
                ref={containerRef}
                data-scroll-root="true"
                className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-red-500"
                style={{ scrollPaddingTop: '56px' }}
            >
                <Header
                    active={active}
                    onJump={scrollToIndex}
                    sections={sections}
                    brand="J-PiMS"
                    containerRef={headerRef}
                    actions={(
                        <div className="flex items-center gap-2">
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
                            <Link
                                href={route('home')}
                                className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition flex items-center justify-center"
                            >
                                Kembali
                            </Link>
                        </div>
                    )}
                />
                <NavDots count={sections.length} active={active} onJump={scrollToIndex} sections={sections} />

                {sections.map((s, i) => (
                    
                    <Section
                        key={s.id}
                        ref={(el: HTMLDivElement | null) => { sectionRefs.current[i] = el; }}
                        data={s}
                        index={i}
                    />
                ))}
                <ScrollProgress targetRef={containerRef} />
                <ArrowNav active={active} onJump={scrollToIndex} total={sections.length} />
                <CursorBullet />
            </div>
        </>
    );
}


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
