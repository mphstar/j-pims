import { Head, Link } from '@inertiajs/react';
import React, { useMemo } from 'react';

// Shared types (aligned with API resources)
interface OverlayType {
  id: number;
  overlay_url: string;
  position_horizontal: 'left' | 'center' | 'right' | null;
  position_vertical: 'top' | 'center' | 'bottom' | null;
  object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
}

interface BaseItem {
  id: number;
  title: string;
  label: string | null;
  subtitle: string | null;
  slug: string;
  content: string | null;
  background_url: string | null;
  cta_href: string | null;
  cta_label: string | null;
  align: 'left' | 'right';
  overlays: OverlayType[];
}

interface ProductType extends BaseItem {}

interface DestinationType extends BaseItem {
  products?: ProductType[];
}

interface Props {
  destination: DestinationType;
}

export default function DestinationProducts({ destination }: Props) {
  const products = useMemo(() => destination.products && destination.products.length > 0 ? destination.products : [destination], [destination]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Head title={`Produk — ${destination.title}`} />

      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link href={route('home')} className="group inline-flex items-center gap-2 text-white/80 hover:text-white transition">
            <svg className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            <span className="text-sm">Kembali</span>
          </Link>
          <div className="ml-auto text-sm text-white/70">
            {destination.label && (<span className="px-2 py-0.5 rounded-full border border-white/15 bg-white/5">{destination.label}</span>)}
          </div>
        </div>
      </header>

      {/* Hero destination */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${destination.background_url || ''})` }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-wide">{destination.title}</h1>
          {destination.subtitle && <p className="text-white/80 mt-2 max-w-3xl">{destination.subtitle}</p>}
          {destination.content && <p className="text-white/70 mt-4 max-w-3xl text-sm leading-relaxed">{destination.content}</p>}
        </div>
      </section>

      {/* Products grid */}
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-lg font-medium">Pilih Produk</h2>
          <div className="text-xs text-white/60">{products.length} produk tersedia</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p, idx) => (
            <article key={p.id} className="group relative border border-white/10 rounded-lg overflow-hidden bg-white/5">
              <div className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url(${p.background_url || destination.background_url || ''})` }} />
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'radial-gradient(circle at 60% 30%, rgba(255,255,255,0.08), transparent 45%)'}} />
              <div className="p-4">
                <h3 className="font-semibold tracking-wide">{p.title}</h3>
                {p.subtitle && <p className="text-white/70 text-sm mt-1 line-clamp-2">{p.subtitle}</p>}
                <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                  <span>{(p.overlays?.length ?? 0)} overlay</span>
                  {p.label && <span>• {p.label}</span>}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={route('home', { open: destination.slug, product: idx })}
                    className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xs"
                  >
                    Lihat
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  {p.cta_href && (
                    <a
                      href={p.cta_href}
                      className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md border border-white/20 hover:bg-white/10 text-white/80 hover:text-white text-xs"
                    >
                      {p.cta_label || 'Kunjungi'}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
