/**
 * Calculate personalization score for a destination/product based on metadata
 * and user preferences. Higher score = better match.
 */

interface Metadata {
  activity_level?: string;
  activity_levels?: string[];
  price_range?: string;
  price_ranges?: string[];
  best_season?: string;
  best_seasons?: string[];
  tags?: string[];
  target_age_group?: string[];
  facilities?: string[];
  includes?: string[];
  duration_hours?: number;
  accessibility?: string;
  requirements?: string[];
  group_size?: { min?: number; max?: number };
}

interface UserPreferences {
  activityLevel?: string | string[];
  priceRange?: string | string[];
  bestSeason?: string | string[];
}

export function calculatePersonalizationScore(
  metadata: Metadata | null | undefined,
  preferences: UserPreferences
): number {
  if (!metadata) return 0;
  
  // Normalize both metadata and preferences to canonical values
  // Build meta sets (support single + arrays)
  const activityMetaSet = new Set<ReturnType<typeof normalizeActivityLevel>>();
  const aSingle = normalizeActivityLevel(metadata.activity_level);
  if (aSingle) activityMetaSet.add(aSingle);
  (metadata.activity_levels || []).forEach(v => { const n = normalizeActivityLevel(v); if (n) activityMetaSet.add(n); });
  const normActivityPrefSet = normalizePreferenceSet(preferences.activityLevel, normalizeActivityLevel);
  const priceMetaSet = new Set<ReturnType<typeof normalizePriceRange>>();
  const pSingle = normalizePriceRange(metadata.price_range);
  if (pSingle) priceMetaSet.add(pSingle);
  (metadata.price_ranges || []).forEach(v => { const n = normalizePriceRange(v); if (n) priceMetaSet.add(n); });
  const normPricePrefSet = normalizePreferenceSet(preferences.priceRange, normalizePriceRange);
  const seasonMetaSet = new Set<ReturnType<typeof normalizeBestSeason>>();
  const sSingle = normalizeBestSeason(metadata.best_season);
  if (sSingle) seasonMetaSet.add(sSingle);
  (metadata.best_seasons || []).forEach(v => { const n = normalizeBestSeason(v); if (n) seasonMetaSet.add(n); });
  const normSeasonPrefSet = normalizePreferenceSet(preferences.bestSeason, normalizeBestSeason);

  let score = 0;

  // Activity level match (exact canonical match = +10 points)
  if ([...activityMetaSet].some(v => v && normActivityPrefSet.has(v))) {
    score += 10;
  }

  // Price range match (exact canonical match = +10 points)
  if ([...priceMetaSet].some(v => v && normPricePrefSet.has(v))) {
    score += 10;
  }

  // Best season match (exact canonical match = +8 points, all-year = +5 points)
  if (normSeasonPrefSet.size > 0) {
    const seasonExact = [...seasonMetaSet].some(v => v && normSeasonPrefSet.has(v));
    if (seasonExact) {
      score += 8;
    } else if (seasonMetaSet.has('all-year')) {
      score += 5;
    }
  }

  return score;
}

/**
 * Get personalization badge for a score
 */
export function getPersonalizationBadge(score: number): { label: string; color: string } | null {
  if (score >= 20) {
    return { label: 'Sangat Cocok', color: 'bg-green-500' };
  } else if (score >= 8) {
    return { label: 'Cocok', color: 'bg-blue-500' };
  }
  return null;
}

/**
 * Get detailed personalization badges showing what matches
 */
export function getPersonalizationDetails(
  metadata: Metadata | null | undefined,
  preferences: UserPreferences
): Array<{ label: string; color: string; icon: string }> {
  if (!metadata) return [];
  
  const details: Array<{ label: string; color: string; icon: string }> = [];
  
  const normActivityPrefSet = normalizePreferenceSet(preferences.activityLevel, normalizeActivityLevel);
  const normPricePrefSet = normalizePreferenceSet(preferences.priceRange, normalizePriceRange);
  const normSeasonPrefSet = normalizePreferenceSet(preferences.bestSeason, normalizeBestSeason);

  // Activity level match (using normalized values)
  {
    const metaSet = new Set<string>();
    const a = normalizeActivityLevel(metadata.activity_level); if (a) metaSet.add(a);
    (metadata.activity_levels || []).forEach(v => { const n = normalizeActivityLevel(v); if (n) metaSet.add(n); });
    const match = [...metaSet].some(v => normActivityPrefSet.has(v as any));
    if (match) {
    const activityMap: Record<string, { label: string; icon: string }> = {
      'easy': { label: 'Santai & Mudah', icon: '😌' },
      'moderate': { label: 'Aktivitas Sedang', icon: '🚶' },
      'challenging': { label: 'Menantang', icon: '🏃' },
    };
      const firstKey = ([...metaSet][0] as keyof typeof activityMap | undefined);
      const activity = firstKey ? activityMap[firstKey] : undefined;
      if (activity) {
        details.push({ label: activity.label, color: 'bg-purple-500', icon: activity.icon });
      }
    }
  }

  // Price range match (using normalized values)
  {
    const metaSet = new Set<string>();
    const p = normalizePriceRange(metadata.price_range); if (p) metaSet.add(p);
    (metadata.price_ranges || []).forEach(v => { const n = normalizePriceRange(v); if (n) metaSet.add(n); });
    const match = [...metaSet].some(v => normPricePrefSet.has(v as any));
    if (match) {
    const priceMap: Record<string, { label: string; icon: string }> = {
      'budget': { label: 'Hemat Budget', icon: '💰' },
      'moderate': { label: 'Budget Pas', icon: '💵' },
      'expensive': { label: 'Budget Tinggi', icon: '💎' },
      'luxury': { label: 'Premium', icon: '👑' },
    };
      const firstKey = ([...metaSet][0] as keyof typeof priceMap | undefined);
      const price = firstKey ? priceMap[firstKey] : undefined;
      if (price) {
        details.push({ label: price.label, color: 'bg-amber-500', icon: price.icon });
      }
    }
  }

  // Best season match (using normalized values)
  if (normSeasonPrefSet.size > 0) {
    const metaSet = new Set<string>();
    const s = normalizeBestSeason(metadata.best_season); if (s) metaSet.add(s);
    (metadata.best_seasons || []).forEach(v => { const n = normalizeBestSeason(v); if (n) metaSet.add(n); });
    const exact = [...metaSet].some(v => normSeasonPrefSet.has(v as any));
    if (exact) {
      const labelText = metadata.best_season || (metadata.best_seasons && metadata.best_seasons[0]) || 'Musim yang direkomendasikan';
      details.push({ label: `Cocok di ${labelText}`, color: 'bg-cyan-500', icon: '📅' });
    } else if (metaSet.has('all-year')) {
      details.push({ label: 'Sepanjang Tahun', color: 'bg-emerald-500', icon: '🌍' });
    }
  }
  
  return details;
}

/**
 * Check if destination is personalized (score > 0)
 */
export function isPersonalized(score: number): boolean {
  return score > 0;
}

// ===== Normalization helpers =====

function normalizeString(input?: string | null): string {
  return (input || '').toString().trim().toLowerCase();
}

export function normalizeActivityLevel(input?: string | null): 'easy' | 'moderate' | 'challenging' | null {
  const v = normalizeString(input);
  if (!v) return null;
  // Common synonyms (EN/ID)
  if (['easy','low','ringan','mudah','santai','leisure','relaxed'].includes(v)) return 'easy';
  if (['moderate','medium','sedang','menengah','standar','standard','balanced'].includes(v)) return 'moderate';
  if (['hard','challenging','tinggi','berat','sulit','mellantang','menantang','intense','intens','aktif','aktifitas','aktifitas tinggi','aktif-tinggi'].includes(v)) return 'challenging';
  // Heuristics
  if (v.includes('santai') || v.includes('ringan') || v.includes('mudah')) return 'easy';
  if (v.includes('sedang') || v.includes('menengah')) return 'moderate';
  if (v.includes('berat') || v.includes('tinggi') || v.includes('tantang') || v.includes('ekstrim') || v.includes('extreme') || v.includes('aktif')) return 'challenging';
  return null;
}

export function normalizePriceRange(input?: string | null): 'budget' | 'moderate' | 'expensive' | 'luxury' | null {
  const v = normalizeString(input);
  if (!v) return null;
  if (['budget','cheap','murah','hemat','low-cost','low cost','economy'].includes(v)) return 'budget';
  if (['moderate','medium','sedang','menengah','standar','standard','normal'].includes(v)) return 'moderate';
  if (['expensive','mahal','premium','high','tinggi','atas'].includes(v)) return 'expensive';
  if (['luxury','mewah','eksklusif','exclusive','vip','5-star','5 star'].includes(v)) return 'luxury';
  // Ranges like Rp, try rough heuristics if needed later
  return null;
}

export function normalizeBestSeason(input?: string | null): 'jan-apr' | 'mei-okt' | 'all-year' | 'morning' | 'afternoon' | 'evening' | 'night' | null {
  const v = normalizeString(input);
  if (!v) return null;
  // Time of day (visit time) synonyms
  if (['pagi','morning','subuh','dawn','sunrise'].some(k=>v.includes(k))) return 'morning';
  if (['siang','noon','afternoon','midday'].some(k=>v.includes(k))) return 'afternoon';
  if (['sore','senja','evening','sunset','dusk'].some(k=>v.includes(k))) return 'evening';
  if (['malam','night','late'].some(k=>v.includes(k))) return 'night';
  // All year synonyms
  if (v.includes('sepanjang') || v.includes('all') || v.includes('all-year') || v.includes('allyear') || v.includes('全年')) {
    return 'all-year';
  }
  // Dry season (roughly May-Oct)
  if (
    v.includes('mei') || v.includes('may') || v.includes('jun') || v.includes('juni') || v.includes('jul') || v.includes('juli') || v.includes('aug') || v.includes('agus') || v.includes('agustus') || v.includes('sep') || v.includes('sept') || v.includes('september') || v.includes('okt') || v.includes('oct') || v.includes('oktober') || v.includes('kemarau') || v.includes('dry')
  ) {
    return 'mei-okt';
  }
  // Wet season (roughly Jan-Apr)
  if (
    v.includes('jan') || v.includes('januari') || v.includes('feb') || v.includes('februari') || v.includes('mar') || v.includes('maret') || v.includes('apr') || v.includes('april') || v.includes('nov') || v.includes('november') || v.includes('des') || v.includes('dec') || v.includes('desember') || v.includes('december') || v.includes('hujan') || v.includes('rain')
  ) {
    return 'jan-apr';
  }
  // Direct known patterns
  if (['januari-april','jan-apr','jan to apr','jan–apr','jan — apr','jan apr'].includes(v)) return 'jan-apr';
  if (['mei-oktober','mei-okt','may-oct','may to oct','mei – okt','mei okt','mei s.d. oktober','mei sd oktober','mei sampai oktober'].includes(v)) return 'mei-okt';
  return null;
}

function normalizePreferenceSet<T extends string | null>(
  pref: string | string[] | undefined,
  normalizer: (v?: string | null) => T
): Set<Exclude<T, null>> {
  const set = new Set<Exclude<T, null>>();
  if (!pref) return set;
  const arr = Array.isArray(pref) ? pref : [pref];
  for (const item of arr) {
    const norm = normalizer(item);
    if (norm) set.add(norm as Exclude<T, null>);
  }
  return set;
}
