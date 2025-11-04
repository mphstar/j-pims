import { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Logo } from '@/components/atoms/Logo';
import { CursorBullet } from '@/components/organisms/CursorBullet';
import { calculatePersonalizationScore, getPersonalizationBadge } from '@/utils/personalization';

interface MetadataType {
    activity_level?: string;
    price_range?: string;
    best_season?: string;
    tags?: string[];
    includes?: string[];
    requirements?: string[];
    group_size?: { min?: number; max?: number };
    duration_hours?: number;
}

interface SearchResult {
    id: number;
    type: 'destination' | 'product';
    title: string;
    subtitle?: string;
    label?: string;
    slug: string;
    content?: string;
    background_url?: string;
    url: string;
    parent_destination?: string;
    metadata?: MetadataType;
}

interface Props {
    query: string;
    filters: {
        labels?: string[];
    };
    results: SearchResult[];
    recommendations: SearchResult[];
    allLabels: string[];
}

// Result Card Component
function ResultCard({ result, personalizationScore }: { result: SearchResult; personalizationScore: number }) {
    const badge = getPersonalizationBadge(personalizationScore);
    
    return (
        <Link
            href={result.url}
            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                {result.background_url ? (
                    <img
                        src={result.background_url}
                        alt={result.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Type Badge & Recommendation Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-white ${
                        result.type === 'destination' 
                            ? 'bg-blue-500/80' 
                            : 'bg-purple-500/80'
                    }`}>
                        {result.type === 'destination' ? '📍 Destinasi' : '🎫 Paket'}
                    </span>
                    
                    {/* Personalization Badge */}
                    {badge && (
                        <span className={`inline-flex items-center gap-1 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold text-white ${badge.color}`}>
                            ✨ {badge.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {result.label && (
                    <div className="text-xs text-blue-400 font-medium mb-1">{result.label}</div>
                )}
                
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {result.title}
                </h3>
                
                {result.subtitle && (
                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{result.subtitle}</p>
                )}

                {result.type === 'product' && result.parent_destination && (
                    <p className="text-xs text-white/50 mb-3">
                        📍 {result.parent_destination}
                    </p>
                )}

                {/* Metadata badges */}
                {result.metadata && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {result.metadata.price_range && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/70">
                                💰 {result.metadata.price_range}
                            </span>
                        )}
                        {result.metadata.duration_hours && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-white/70">
                                ⏱️ {result.metadata.duration_hours >= 24 
                                    ? `${Math.floor(result.metadata.duration_hours / 24)}D`
                                    : `${result.metadata.duration_hours}J`}
                            </span>
                        )}
                    </div>
                )}

                {/* View Details */}
                <div className="flex items-center gap-2 text-sm text-blue-400 group-hover:text-blue-300 font-medium">
                    Lihat Detail
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

export default function SearchView({ 
    query: initialQuery, 
    filters: initialFilters, 
    results: initialResults,
    recommendations,
    allLabels,
}: Props) {
    const [query, setQuery] = useState(initialQuery || '');
    const [showFilters, setShowFilters] = useState(false);
    
    const safeStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
    
    // Load personalization preferences
    const [activityLevel, setActivityLevel] = useState<string>(() => {
        try { return safeStorage?.getItem('jp_activity_level') || ''; } catch { return ''; }
    });
    const [priceRange, setPriceRange] = useState<string>(() => {
        try { return safeStorage?.getItem('jp_price_range') || ''; } catch { return ''; }
    });
    const [bestSeason, setBestSeason] = useState<string>(() => {
        try { return safeStorage?.getItem('jp_best_season') || ''; } catch { return ''; }
    });
    
    const [prefLabels, setPrefLabels] = useState<string[]>(() => {
        try {
            // Check if there are filters from URL first
            if (initialFilters.labels && initialFilters.labels.length > 0) {
                return initialFilters.labels;
            }
            // Otherwise load from localStorage
            const stored = safeStorage?.getItem('jp_pref_labels');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });
    
    useEffect(() => {
        if (safeStorage) {
            if (prefLabels.length > 0) {
                safeStorage.setItem('jp_pref_labels', JSON.stringify(prefLabels));
            } else {
                // Remove from localStorage if empty
                safeStorage.removeItem('jp_pref_labels');
            }
        }
    }, [prefLabels, safeStorage]);
    
    // Calculate personalization scores and sort results
    const sortedResults = useMemo(() => {
        return initialResults.map(result => {
            const score = calculatePersonalizationScore(result.metadata || {}, {
                activityLevel,
                priceRange,
                bestSeason,
            });
            return { ...result, personalizationScore: score };
        }).sort((a, b) => b.personalizationScore - a.personalizationScore);
    }, [initialResults, activityLevel, priceRange, bestSeason]);
    
    // Calculate scores for recommendations too
    const sortedRecommendations = useMemo(() => {
        return recommendations.map(item => {
            const score = calculatePersonalizationScore(item.metadata || {}, {
                activityLevel,
                priceRange,
                bestSeason,
            });
            return { ...item, personalizationScore: score };
        }).sort((a, b) => b.personalizationScore - a.personalizationScore);
    }, [recommendations, activityLevel, priceRange, bestSeason]);
    
    const hasSearched = initialQuery !== '' || (initialFilters.labels && initialFilters.labels.length > 0);
    const destinations = sortedResults.filter(item => item.type === 'destination');
    const products = sortedResults.filter(item => item.type === 'product');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const searchFilters: Record<string, any> = {};
        
        // Only add labels filter if there are selected categories
        if (prefLabels.length > 0) {
            searchFilters.labels = prefLabels;
        }
        
        router.get(route('search'), { q: query, ...searchFilters }, {
            preserveState: false,
        });
    };

    const clearFilters = () => {
        setPrefLabels([]);
        
        // Also remove from localStorage
        if (safeStorage) {
            safeStorage.removeItem('jp_pref_labels');
        }
        
        setShowFilters(false);
        router.get(route('search'), { q: query }, {
            preserveState: false,
        });
    };
    
    const toggleLabel = (label: string) => {
        setPrefLabels(prev => 
            prev.includes(label) 
                ? prev.filter(l => l !== label) 
                : [...prev, label]
        );
    };

    const handlePersonalizationChange = () => {
        const searchFilters: Record<string, any> = {};
        
        // Only add labels filter if there are selected categories
        if (prefLabels.length > 0) {
            searchFilters.labels = prefLabels;
        }
        
        setShowFilters(false);
        router.get(route('search'), { q: query, ...searchFilters }, {
            preserveState: false,
        });
    };

    return (
        <>
            <Head title={query ? `Cari: ${query}` : 'Cari Destinasi & Paket'} />
            
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                        {/* Top Row - Logo & Buttons */}
                        <div className="flex items-center justify-between gap-2">
                            <Link href={route('home')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <Logo />
                                <span className="font-semibold text-white text-sm">J-PiMS</span>
                            </Link>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`px-3 py-1.5 border border-white/20 rounded-full text-white text-xs font-medium transition-all flex items-center gap-1.5 ${
                                        showFilters ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Filter
                                </button>

                                <Link href={route('home')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-xs font-medium transition-all">
                                    Kembali
                                </Link>
                            </div>
                        </div>
                        
                        {/* Bottom Row - Search */}
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari destinasi atau paket..."
                                    className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-full text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href={route('home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <Logo />
                            <span className="font-semibold text-white text-lg">J-PiMS</span>
                        </Link>
                        
                        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Cari destinasi atau paket wisata..."
                                    className="w-full px-4 py-2.5 pl-12 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 border border-white/20 rounded-full text-white text-sm font-medium transition-all flex items-center gap-2 ${
                                showFilters ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/10 hover:bg-white/20'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Kategori
                        </button>

                        <Link href={route('home')} className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium transition-all">
                            Kembali
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filter Dialog */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 border border-white/20 rounded-2xl shadow-2xl">
                        <button
                            onClick={() => setShowFilters(false)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                                    <span className="text-3xl">✨</span> Pilih Kategori
                                </h2>
                                <p className="text-white/60">Pilih kategori destinasi yang Anda minati</p>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm text-white/80 font-medium mb-3">Kategori Wisata</label>
                                <div className="flex flex-wrap gap-2">
                                    {allLabels.map((label) => (
                                        <button
                                            key={label}
                                            onClick={() => toggleLabel(label)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                                prefLabels.includes(label)
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                                <button
                                    onClick={handlePersonalizationChange}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/30"
                                >
                                    Terapkan Filter
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all border border-white/20"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-32 md:pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4">
                    {hasSearched ? (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {query ? `Hasil Pencarian "${query}"` : 'Semua Destinasi & Paket'}
                                </h1>
                                <p className="text-white/60">
                                    Ditemukan {destinations.length} destinasi dan {products.length} paket
                                </p>
                            </div>

                            {destinations.length === 0 && products.length === 0 ? (
                                <div className="text-center py-20">
                                    <svg className="w-20 h-20 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-white mb-2">Tidak ada hasil ditemukan</h3>
                                    <p className="text-white/60 mb-6">Coba ubah kata kunci atau filter pencarian Anda</p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {destinations.length > 0 && (
                                        <div className="mb-12">
                                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                                <span>📍</span> Destinasi Wisata
                                                <span className="text-base font-normal text-white/60">({destinations.length})</span>
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {destinations.map((result) => (
                                                    <ResultCard 
                                                        key={`destination-${result.id}`} 
                                                        result={result}
                                                        personalizationScore={result.personalizationScore || 0}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {products.length > 0 && (
                                        <div className="mb-12">
                                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                                <span>🎫</span> Paket Wisata
                                                <span className="text-base font-normal text-white/60">({products.length})</span>
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {products.map((result) => (
                                                    <ResultCard 
                                                        key={`product-${result.id}`} 
                                                        result={result}
                                                        personalizationScore={result.personalizationScore || 0}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="mb-6">
                                <svg className="w-24 h-24 text-blue-500/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                Cari Destinasi & Paket Wisata
                            </h2>
                            <p className="text-white/60 max-w-md mx-auto">
                                Gunakan kolom pencarian di atas atau filter kategori untuk menemukan destinasi dan paket wisata
                            </p>
                        </div>
                    )}

                    {/* Recommendations */}
                    <div className="mt-20">
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {hasSearched ? 'Rekomendasi Lainnya' : 'Jelajahi Destinasi & Paket'}
                            </h2>
                            <p className="text-white/60">
                                Temukan lebih banyak destinasi dan paket wisata menarik
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sortedRecommendations.map((item) => {
                                const badge = getPersonalizationBadge(item.personalizationScore || 0);
                                
                                return (
                                    <Link
                                        key={`rec-${item.type}-${item.id}`}
                                        href={item.url}
                                        className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="relative h-40 overflow-hidden">
                                            {item.background_url ? (
                                                <img
                                                    src={item.background_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                            
                                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                                                    item.type === 'destination' 
                                                        ? 'bg-blue-500/80' 
                                                        : 'bg-purple-500/80'
                                                }`}>
                                                    {item.type === 'destination' ? '📍' : '🎫'}
                                                </span>
                                                
                                                {/* Personalization Badge */}
                                                {badge && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${badge.color}`}>
                                                        ✨
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-3">
                                            {item.label && (
                                                <div className="text-[10px] text-blue-400 font-medium mb-1">{item.label}</div>
                                            )}
                                            
                                            <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                {item.title}
                                            </h3>
                                            
                                            {item.subtitle && (
                                                <p className="text-xs text-white/70 line-clamp-1 mb-2">{item.subtitle}</p>
                                            )}

                                            {item.metadata && (
                                                <div className="flex flex-wrap gap-1">
                                                    {item.metadata.price_range && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/70">
                                                            💰 {item.metadata.price_range}
                                                        </span>
                                                    )}
                                                    {item.metadata.duration_hours && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/70">
                                                            ⏱️ {item.metadata.duration_hours >= 24 
                                                                ? `${Math.floor(item.metadata.duration_hours / 24)}D`
                                                                : `${item.metadata.duration_hours}J`}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <CursorBullet />
        </>
    );
}
