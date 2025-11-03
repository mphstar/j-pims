import { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Section, type SectionData } from '@/components/organisms/Section';
import { ArrowNav } from '@/components/molecules/ArrowNav';
import { CursorBullet } from '@/components/organisms/CursorBullet';
import { Logo } from '@/components/atoms/Logo';
import { Header } from '@/components/templates/Header';
import { NavDots } from '@/components/molecules/NavDots';

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

    const SECTIONS: SectionData[] = useMemo(() => prods.map((p) => {
        const ov = (p.overlays && p.overlays.length > 0 ? p.overlays : destination.overlays) || [];
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
                <div className={"max-w-xl space-y-4 " + (p.align === 'right' ? 'ml-auto text-right' : '')}>
                    <p className="text-white/90">{p.content || destination.content || ''}</p>
                </div>
            ),
            ctaHref: '#',
            ctaLabel: '',
        } as SectionData;
    }), [prods, destination]);

    const scrollToIndex = (idx: number) => {
        const el = sectionRefs.current[idx]; const container = containerRef.current;
        if (!el || !container) return;
        container.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    };

    // Track active index based on scroll position
    useEffect(() => {
        const container = containerRef.current; if (!container) return;
        const onScroll = () => {
            const st = container.scrollTop; const ch = container.clientHeight;
            let bestIdx = 0; let bestDist = Number.POSITIVE_INFINITY;
            sectionRefs.current.forEach((el, i) => {
                if (!el) return; const top = el.offsetTop; const mid = top + el.offsetHeight / 2; const dist = Math.abs((st + ch / 2) - mid);
                if (dist < bestDist) { bestDist = dist; bestIdx = i; }
            });
            setActive(bestIdx);
        };
        onScroll();
        container.addEventListener('scroll', onScroll, { passive: true } as any);
        return () => container.removeEventListener('scroll', onScroll as any);
    }, [SECTIONS.length]);

    if (!ready) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-black text-white relative overflow-hidden" aria-busy="true" aria-label="Memuat produk">
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
            <Head title={`${(prods[0]?.title ?? 'Produk')} • Produk`} />
            {/* Header consistent with ParwisataView */}
            <Header
                active={active}
                onJump={scrollToIndex}
                sections={SECTIONS}
                brand="J-PiMS"
                actions={(
                    <div className="flex items-center gap-2">
                        <Link href={route('home')} className="px-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium">Kembali</Link>
                    </div>
                )}
            />
            <NavDots count={SECTIONS.length} active={active} onJump={scrollToIndex} sections={SECTIONS} />
            <div ref={containerRef} className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-black">
                {SECTIONS.map((s, i) => (
                    <Section key={s.id}
                        ref={(el) => { sectionRefs.current[i] = el; }}
                        data={s}
                        index={i}
                        onCtaClick={() => { }}
                    />
                ))}
                <ArrowNav active={active} onJump={scrollToIndex} total={SECTIONS.length} />
                <CursorBullet />
            </div>
        </>
    );
}
