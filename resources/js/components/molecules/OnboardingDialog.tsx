import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { Logo } from '@/components/atoms/Logo';

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: string[];
  initialPrefLabels: string[];
  metadataOptions?: {
    activity_levels: string[];
    price_ranges: string[];
    best_seasons: string[];
    tags: string[];
  };
  metadataDetails?: {
    destination_types?: Array<{ id: number; icon?: string | null; title: string; subtitle?: string | null; key: string }>;
    activity_levels?: Array<{ id: number; icon?: string | null; title: string; subtitle?: string | null; key: string }>;
    price_ranges?: Array<{ id: number; icon?: string | null; title: string; subtitle?: string | null; key: string }>;
    visit_times?: Array<{ id: number; icon?: string | null; title: string; subtitle?: string | null; key: string }>;
  };
  onSave: (data: {
    prefLabels: string[];
    activityLevels?: string[];
    priceRanges?: string[];
    bestSeasons?: string[];
  }) => void;
}

export function OnboardingDialog({
  open,
  onOpenChange,
  labels,
  initialPrefLabels,
  metadataOptions,
  metadataDetails,
  onSave,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const [activityLevelsSel, setActivityLevelsSel] = useState<string[]>([]);
  const [priceRangesSel, setPriceRangesSel] = useState<string[]>([]);
  const [bestSeasonsSel, setBestSeasonsSel] = useState<string[]>([]);
  const [prefLabels, setPrefLabels] = useState<string[]>(initialPrefLabels);

  // Debug: Log metadataDetails only once
  useState(() => {
    // console.log('=== OnboardingDialog metadataDetails ===');
    // console.log('Full metadataDetails:', JSON.stringify(metadataDetails, null, 2));
    // console.log('Activity Levels:', metadataDetails?.activity_levels);
    // console.log('Price Ranges:', metadataDetails?.price_ranges);
    // console.log('Visit Times:', metadataDetails?.visit_times);
  });

  const activityLevels = (metadataOptions?.activity_levels && metadataOptions.activity_levels.length > 0)
    ? metadataOptions.activity_levels
    : ['santai', 'sedang', 'aktif'];
  const priceRanges = (metadataOptions?.price_ranges && metadataOptions.price_ranges.length > 0)
    ? metadataOptions.price_ranges
    : ['hemat', 'sedang', 'premium'];
  const bestSeasons = (metadataOptions?.best_seasons && metadataOptions.best_seasons.length > 0)
    ? metadataOptions.best_seasons
    : ['pagi', 'siang', 'sore', 'malam'];

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handlePrevious = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    handleSave();
  };

  const handleSave = () => {
    onSave({
      prefLabels,
      activityLevels: activityLevelsSel.length ? activityLevelsSel : undefined,
      priceRanges: priceRangesSel.length ? priceRangesSel : undefined,
      bestSeasons: bestSeasonsSel.length ? bestSeasonsSel : undefined,
    });
    onOpenChange(false);
  };

  const toggleStringIn = (value: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const toggleLabel = (label: string) => {
    setPrefLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const getActivityIcon = (level: string) => {
    const detail = metadataDetails?.activity_levels?.find(a => a.key === level);
    if (detail?.icon) return detail.icon;
    // Fallback icons
    if (level === 'santai') return '🛌';
    if (level === 'sedang') return '🚶';
    if (level === 'aktif') return '⛰️';
    return '🎯';
  };

  const getActivityLabel = (level: string) => {
    const detail = metadataDetails?.activity_levels?.find(a => a.key === level);
    if (detail?.title) return detail.title;
    // Fallback - preserve exact case from database
    return level;
  };

  const getActivitySubtitle = (level: string) => {
    const detail = metadataDetails?.activity_levels?.find(a => a.key === level);
    return detail?.subtitle || '';
  };

  const getPriceIcon = (range: string) => {
    const detail = metadataDetails?.price_ranges?.find(p => p.key === range);
    if (detail?.icon) return detail.icon;
    // Fallback icons
    if (range === 'hemat') return '💸';
    if (range === 'sedang') return '💰';
    if (range === 'premium') return '💎';
    return '💳';
  };

  const getPriceLabel = (range: string) => {
    const detail = metadataDetails?.price_ranges?.find(p => p.key === range);
    if (detail?.title) return detail.title;
    // Fallback - preserve exact case from database
    return range;
  };

  const getPriceSubtitle = (range: string) => {
    const detail = metadataDetails?.price_ranges?.find(p => p.key === range);
    return detail?.subtitle || '';
  };

  const getSeasonIcon = (season: string) => {
    const detail = metadataDetails?.visit_times?.find(v => v.key === season);
    if (step === 4) console.log(`Season icon for "${season}":`, detail?.icon, 'Full detail:', detail);
    if (detail?.icon) return detail.icon;
    // Fallback icons
    if (season === 'pagi') return '🌅';
    if (season === 'siang') return '🌤️';
    if (season === 'sore') return '🌇';
    if (season === 'malam') return '🌃';
    return '📅';
  };

  const getSeasonLabel = (season: string) => {
    const detail = metadataDetails?.visit_times?.find(v => v.key === season);
    if (detail?.title) return detail.title;
    // Fallback - preserve exact case from database
    return season;
  };

  const getSeasonSubtitle = (season: string) => {
    const detail = metadataDetails?.visit_times?.find(v => v.key === season);
    if (step === 4) console.log(`Season subtitle for "${season}":`, detail?.subtitle);
    return detail?.subtitle || '';
  };

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('pantai') || l.includes('laut')) return '🏖️';
    if (l.includes('gunung') || l.includes('alam')) return '⛰️';
    if (l.includes('kuliner') || l.includes('makan')) return '🍜';
    if (l.includes('budaya')) return '🎎';
    if (l.includes('sejarah')) return '🏛️';
    if (l.includes('belanja')) return '🛍️';
    return '🎒';
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-[90%] md:max-w-2xl max-h-[85vh] translate-x-[-50%] translate-y-[-50%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="h-1 bg-white/5 w-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
            {/* Step 0: Intro (New) */}
            {step === 0 && (
              <div className="flex flex-col items-center justify-center space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="scale-150 p-4">
                    <Logo />
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      J-PIMS
                    </h1>
                    <h2 className="text-lg md:text-xl font-semibold text-white">
                      Jember Personalized Tourism Information Management System
                    </h2>
                  </div>

                  <p className="text-lg text-white/70 max-w-md mx-auto leading-relaxed">
                    Jelajahi keindahan Jember dengan cara baru. Dapatkan rekomendasi wisata yang dipersonalisasi khusus untuk gaya liburan Anda.
                  </p>
                </div>

                <div className="mt-auto pt-8 border-t border-white/5 w-full">
                  <p className="text-sm text-white/40 uppercase tracking-widest font-medium">
                    Developed by
                  </p>
                  <p className="text-base text-white/80 font-semibold mt-1">
                    Politeknik Negeri Jember
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Welcome (Was 0) */}
            {step === 1 && (
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-6xl mb-4">🗺️</div>
                <Dialog.Title className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Selamat Datang!
                </Dialog.Title>
                <Dialog.Description className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
                  Mari personalisasi pengalaman Anda dalam beberapa langkah sederhana. Kami akan merekomendasikan destinasi yang paling sesuai dengan preferensi Anda.
                </Dialog.Description>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                    <div className="text-3xl mb-2">✨</div>
                    <h3 className="text-white font-semibold mb-1">Rekomendasi Personal</h3>
                    <p className="text-white/60 text-sm">Destinasi yang cocok dengan preferensi Anda</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="text-white font-semibold mb-1">Mudah & Cepat</h3>
                    <p className="text-white/60 text-sm">Hanya butuh beberapa menit untuk setup</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                    <div className="text-3xl mb-2">🔄</div>
                    <h3 className="text-white font-semibold mb-1">Bisa Diubah</h3>
                    <p className="text-white/60 text-sm">Preferensi dapat disesuaikan kapan saja</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Activity Level (Was 1) */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🏃</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Tingkat Aktivitas Favorit
                  </h2>
                  <p className="text-white/60">Pilih satu atau lebih tingkat aktivitas yang Anda sukai</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activityLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleStringIn(level, activityLevelsSel, setActivityLevelsSel)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${activityLevelsSel.includes(level)
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                      <div className="text-4xl mb-3">{getActivityIcon(level)}</div>
                      <div className="text-white font-semibold text-lg mb-1">
                        {getActivityLabel(level)}
                      </div>
                      <div className="text-white/50 text-sm">
                        {getActivitySubtitle(level)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Price Range (Was 2) */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">💰</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Range Harga
                  </h2>
                  <p className="text-white/60">Pilih satu atau lebih kisaran harga yang sesuai</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {priceRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => toggleStringIn(range, priceRangesSel, setPriceRangesSel)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${priceRangesSel.includes(range)
                        ? 'border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                      <div className="text-4xl mb-3">{getPriceIcon(range)}</div>
                      <div className="text-white font-semibold text-lg mb-1">
                        {getPriceLabel(range)}
                      </div>
                      <div className="text-white/50 text-sm">
                        {getPriceSubtitle(range)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Best Season (Was 3) */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">📅</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Waktu Kunjungan Ideal
                  </h2>
                  <p className="text-white/60">Pilih satu atau lebih waktu kunjungan favorit</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bestSeasons.map((season) => (
                    <button
                      key={season}
                      onClick={() => toggleStringIn(season, bestSeasonsSel, setBestSeasonsSel)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${bestSeasonsSel.includes(season)
                        ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/30'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{getSeasonIcon(season)}</div>
                        <div className="text-left flex-1">
                          <div className="text-white font-semibold text-lg">{getSeasonLabel(season)}</div>
                          <div className="text-white/50 text-sm">
                            {getSeasonSubtitle(season)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Label Preferences (Was 4) */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">🏖️</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Jenis Destinasi
                  </h2>
                  <p className="text-white/60">Pilih kategori destinasi favorit Anda (opsional)</p>
                </div>

                {labels.length > 0 ? (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {labels.map((label) => (
                      <button
                        key={label}
                        onClick={() => toggleLabel(label)}
                        className={`px-5 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105 ${prefLabels.includes(label)
                          ? 'border-blue-500 bg-blue-500/20 text-white shadow-lg shadow-blue-500/30'
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30 hover:text-white'
                          }`}
                      >
                        <span className="mr-2">{getLabelIcon(label)}</span>
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/50 py-8">
                    Tidak ada kategori tersedia
                  </div>
                )}
              </div>
            )}


          </div>

          {/* Footer Navigation */}
          <div className="border-t border-white/10 bg-black/20 px-6 py-4 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleSkip}
                className="text-white/60 hover:text-white text-sm font-medium transition"
              >
                {step === 0 ? 'Lewati' : 'Nanti Saja'}
              </button>

              <div className="text-white/40 text-xs font-medium">
                {step + 1} / {totalSteps}
              </div>

              <div className="flex items-center gap-3">
                {step > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition"
                  >
                    Kembali
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-semibold transition shadow-lg hover:shadow-xl"
                >
                  {step === totalSteps - 1 ? 'Selesai' : 'Lanjut'}
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
