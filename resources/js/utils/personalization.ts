/**
 * Calculate personalization score for a destination/product based on metadata
 * and user preferences. Higher score = better match.
 */

interface Metadata {
  activity_level?: string;
  price_range?: string;
  best_season?: string;
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
  activityLevel?: string;
  priceRange?: string;
  bestSeason?: string;
}

export function calculatePersonalizationScore(
  metadata: Metadata | null | undefined,
  preferences: UserPreferences
): number {
  if (!metadata) return 0;
  
  let score = 0;
  
  // Activity level match (exact match = +10 points)
  if (preferences.activityLevel && metadata.activity_level === preferences.activityLevel) {
    score += 10;
  }
  
  // Price range match (exact match = +10 points)
  if (preferences.priceRange && metadata.price_range === preferences.priceRange) {
    score += 10;
  }
  
  // Best season match (exact match = +8 points, all-year = +5 points)
  if (preferences.bestSeason) {
    if (metadata.best_season === preferences.bestSeason) {
      score += 8;
    } else if (metadata.best_season === 'all-year' || metadata.best_season?.toLowerCase().includes('sepanjang')) {
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
  } else if (score >= 10) {
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
  
  // Activity level match
  if (preferences.activityLevel && metadata.activity_level === preferences.activityLevel) {
    const activityMap: Record<string, { label: string; icon: string }> = {
      'easy': { label: 'Santai & Mudah', icon: '😌' },
      'moderate': { label: 'Aktivitas Sedang', icon: '🚶' },
      'challenging': { label: 'Menantang', icon: '🏃' },
    };
    const activity = activityMap[metadata.activity_level];
    if (activity) {
      details.push({
        label: activity.label,
        color: 'bg-purple-500',
        icon: activity.icon
      });
    }
  }
  
  // Price range match
  if (preferences.priceRange && metadata.price_range === preferences.priceRange) {
    const priceMap: Record<string, { label: string; icon: string }> = {
      'budget': { label: 'Hemat Budget', icon: '💰' },
      'moderate': { label: 'Budget Pas', icon: '💵' },
      'expensive': { label: 'Budget Tinggi', icon: '💎' },
      'luxury': { label: 'Premium', icon: '👑' },
    };
    const price = priceMap[metadata.price_range];
    if (price) {
      details.push({
        label: price.label,
        color: 'bg-amber-500',
        icon: price.icon
      });
    }
  }
  
  // Best season match
  if (preferences.bestSeason && metadata.best_season) {
    if (metadata.best_season === preferences.bestSeason) {
      details.push({
        label: `Cocok di ${metadata.best_season}`,
        color: 'bg-cyan-500',
        icon: '📅'
      });
    } else if (metadata.best_season.toLowerCase().includes('sepanjang') || metadata.best_season.toLowerCase().includes('all')) {
      details.push({
        label: 'Sepanjang Tahun',
        color: 'bg-emerald-500',
        icon: '🌍'
      });
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
