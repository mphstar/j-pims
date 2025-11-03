<?php

namespace App\Http\Controllers;

use App\Models\PariwisataMetadata;
use App\Models\PariwisataProductMetadata;
use Illuminate\Http\Request;

class MetadataOptionsController extends Controller
{
    /**
     * Get available metadata options from database
     */
    public function index()
    {
        // Get unique values from existing metadata
        $destinationMetadata = PariwisataMetadata::select('activity_level', 'price_range', 'best_season', 'tags')
            ->whereNotNull('activity_level')
            ->orWhereNotNull('price_range')
            ->orWhereNotNull('best_season')
            ->orWhereNotNull('tags')
            ->get();
            
        $productMetadata = PariwisataProductMetadata::select('activity_level', 'price_range', 'best_season', 'tags')
            ->whereNotNull('activity_level')
            ->orWhereNotNull('price_range')
            ->orWhereNotNull('best_season')
            ->orWhereNotNull('tags')
            ->get();

        // Combine and get unique values
        $activityLevels = collect([
            ...$destinationMetadata->pluck('activity_level')->filter(),
            ...$productMetadata->pluck('activity_level')->filter()
        ])->unique()->values();

        $priceRanges = collect([
            ...$destinationMetadata->pluck('price_range')->filter(),
            ...$productMetadata->pluck('price_range')->filter()
        ])->unique()->values();

        $bestSeasons = collect([
            ...$destinationMetadata->pluck('best_season')->filter(),
            ...$productMetadata->pluck('best_season')->filter()
        ])->unique()->values();

        // Extract tags from JSON arrays
        $allTags = collect([
            ...$destinationMetadata->pluck('tags')->filter()->flatten(),
            ...$productMetadata->pluck('tags')->filter()->flatten()
        ])->unique()->values();

        return response()->json([
            'activity_levels' => $activityLevels,
            'price_ranges' => $priceRanges,
            'best_seasons' => $bestSeasons,
            'tags' => $allTags,
            // Also provide enum options as fallback
            'activity_level_options' => ['easy', 'moderate', 'challenging'],
            'price_range_options' => ['budget', 'moderate', 'expensive', 'luxury'],
        ]);
    }
}
