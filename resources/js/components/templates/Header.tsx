import { Link } from '@inertiajs/react';
import { Logo } from '../atoms/Logo';
import type { SectionData } from '../organisms/Section';
import React from 'react';

interface HeaderProps {
  active: number;
  onJump: (i: number) => void;
  sections: SectionData[];
  brand?: string;
  backHref?: string;
  actions?: React.ReactNode;
  containerRef?: React.Ref<HTMLDivElement>;
}

export function Header({ active, onJump, sections, brand, backHref, actions, containerRef }: HeaderProps) {
  const label = brand || 'Education';
  return (
    <div ref={containerRef} className="fixed top-0 z-[60] px-3 md:px-8 py-3 border-b border-white/10 w-full">
      {/* Mobile layout */}
      <div className="md:hidden flex items-center justify-between w-full h-auto min-h-[40px] py-1">
        {/* Left: Text Group */}
        <div className="flex flex-col justify-center gap-0.5 max-w-[75%]">
          <span className="text-white font-semibold tracking-wide text-sm leading-tight">{label}</span>
          <span className="text-[10px] text-white/80 leading-tight">Jember Personalized Information Management System</span>
        </div>

        {/* Right: Actions only (Logo hidden on mobile) */}
        <div className="flex items-center gap-2">
          {backHref ? (
            <Link href={backHref} className="p-1.5 text-white/80 hover:text-white transition bg-white/5 rounded-md border border-white/10" aria-label="Kembali">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </Link>
          ) : (
            // Show actions (Search, Personalise, etc)
            actions
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center gap-6">
        {backHref && (
          <Link href={backHref} className="group inline-flex items-center gap-1.5 pl-2 pr-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium tracking-wide transition" aria-label="Kembali ke daftar">
            <svg className="h-4 w-4 -ml-0.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            <span className="hidden sm:inline">Kembali</span>
          </Link>
        )}
        <Link href="/" className="flex items-center gap-3 group">
          <Logo />
          <div className="flex flex-col justify-center">
            <span className="text-white font-semibold tracking-wide text-base group-hover:opacity-90 leading-tight">{label}</span>
            <span className="text-[10px] text-white/70 leading-tight group-hover:text-white/90">Jember Personalized Information Management System</span>
          </div>
        </Link>
        {/* <nav className="flex gap-5 text-sm">
          {sections.map((s,i)=>{
            const lab = s.navLabel || s.title.split(' ')[0];
            return (
              <button key={s.id} onClick={()=>onJump(i)} className={`relative text-white/65 hover:text-white transition font-medium after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white after:rounded-full after:transition-[width,opacity] after:opacity-70 ${i===active?'after:w-full text-white':'after:w-0 hover:after:w-full'}`} aria-current={i===active? 'true':undefined}>
                {lab}
              </button>
            );
          })}
        </nav> */}
        <div className="ml-auto flex items-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
