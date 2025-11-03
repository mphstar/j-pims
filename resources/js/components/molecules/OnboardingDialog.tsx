import * as Dialog from '@radix-ui/react-dialog';
import React, { useState } from 'react';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  labels: string[];
  initialPrefLabels: string[];
  initialMotion: 'high' | 'reduced';
  onSave: (next: { prefLabels: string[]; motion: 'high' | 'reduced' }) => void;
};

export function OnboardingDialog({ open, onOpenChange, labels, initialPrefLabels, initialMotion, onSave }: Props) {
  const [prefLabels, setPrefLabels] = useState<string[]>(initialPrefLabels);
  const [motion, setMotion] = useState<'high' | 'reduced'>(initialMotion);

  const toggleLabel = (lab: string) => {
    setPrefLabels(prev => prev.includes(lab) ? prev.filter(l => l !== lab) : [...prev, lab]);
  };

  const save = () => {
    onSave({ prefLabels, motion });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl rounded-xl border border-white/15 bg-gradient-to-b from-[#0b0f14]/95 via-[#0b0f14]/90 to-black/90 text-white shadow-[0_20px_80px_rgba(0,0,0,0.6)] z-[91] overflow-hidden">
          {/* Tourism-styled hero header */}
          <div className="relative h-32 md:h-40 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" />
            <div className="absolute -top-12 -right-10 w-64 h-64 rounded-full bg-[conic-gradient(from_120deg,rgba(0,155,255,0.25),transparent_40%)] blur-2xl opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="text-2xl md:text-3xl font-semibold tracking-wide">Mari Personalisasi Liburanmu</div>
              <div className="text-white/70 text-sm md:text-base">Pilih minat dan gaya animasi — biar jelajahnya makin berasa 🏝️🗻🍜</div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {labels.length > 0 && (
              <section>
                <h3 className="text-sm font-medium mb-2 text-white/85">Pilih minat destinasi</h3>
                <div className="flex flex-wrap gap-2">
                  {labels.map(lab => (
                    <button
                      key={lab}
                      onClick={() => toggleLabel(lab)}
                      className={`group relative px-3 h-10 rounded-full border text-xs backdrop-blur-sm transition-all ${prefLabels.includes(lab) ? 'border-white text-white bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset]' : 'border-white/20 text-white/85 hover:text-white hover:bg-white/10'}`}
                    >
                      <span className="mr-1">
                        {(() => {
                          const l = lab.toLowerCase();
                          if (l.includes('pantai') || l.includes('laut')) return '🏖️';
                          if (l.includes('gunung') || l.includes('alam')) return '⛰️';
                          if (l.includes('kuliner') || l.includes('makan')) return '🍜';
                          if (l.includes('budaya')) return '🎎';
                          if (l.includes('sejarah')) return '🏛️';
                          if (l.includes('belanja')) return '🛍️';
                          return '🎒';
                        })()}
                      </span>
                      {lab}
                      {prefLabels.includes(lab) && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/15">dipilih</span>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-white/60 mt-2">Kamu bisa memilih lebih dari satu. Destinasi dengan minatmu akan tampil lebih dulu.</p>
              </section>
            )}

            <section>
              <h3 className="text-sm font-medium mb-2 text-white/85">Tingkat animasi</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setMotion('high')}
                  className={`px-3 py-2 rounded-md border text-sm transition ${motion==='high' ? 'border-white text-white bg-white/10' : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  Tinggi (lebih dinamis)
                </button>
                <button
                  onClick={() => setMotion('reduced')}
                  className={`px-3 py-2 rounded-md border text-sm transition ${motion==='reduced' ? 'border-white text-white bg-white/10' : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  Ringan (lebih tenang)
                </button>
              </div>
              <p className="text-[11px] text-white/60 mt-2">Kamu selalu bisa mengubah ini lewat tombol “Personalisasi”.</p>
            </section>
          </div>

          <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3">
            <Dialog.Close asChild>
              <button className="px-3 h-9 rounded-md border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-sm">Nanti saja</button>
            </Dialog.Close>
            <button onClick={save} className="px-3 h-9 rounded-md border border-white text-black bg-white hover:opacity-90 text-sm font-medium">Mulai jelajah</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
