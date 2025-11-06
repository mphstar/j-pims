<?php

namespace App\Http\Controllers;

use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q', '');
        $filters = [
            'destination_type_ids' => $request->input('destination_type_ids', []),
        ];

        $results = $this->search($query, $filters);

        // Get recommendations (random mix of destinations and products)
        $randomDestinations = Pariwisata::with(['overlays', 'destinationTypes'])
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($dest) {
                // Map destination preferences to metadata format
                $metadata = (object)[
                    'destination_types' => $dest->destinationTypes->pluck('title')->toArray(),
                ];
                
                return [
                    'id' => $dest->id,
                    'type' => 'destination',
                    'title' => $dest->title,
                    'subtitle' => $dest->subtitle,
                    'label' => $dest->label,
                    'slug' => $dest->slug,
                    'content' => $dest->content,
                    'background_url' => $dest->background_url,
                    'url' => route('home', ['open' => $dest->slug]),
                    'metadata' => $metadata,
                    'overlays' => $dest->overlays,
                ];
            });

        $randomProducts = PariwisataProduct::with(['overlays', 'activityLevels', 'priceRanges', 'visitTimes', 'pariwisata.destinationTypes'])
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($product) {
                // Map product preferences to metadata format
                $metadata = (object)[
                    'activity_levels' => $product->activityLevels->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                    'price_ranges' => $product->priceRanges->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                    'best_seasons' => $product->visitTimes->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                    'destination_types' => $product->pariwisata->destinationTypes->pluck('title')->toArray(),
                ];
                
                return [
                    'id' => $product->id,
                    'type' => 'product',
                    'title' => $product->title,
                    'subtitle' => $product->subtitle,
                    'label' => $product->label,
                    'slug' => $product->slug,
                    'content' => $product->content,
                    'background_url' => $product->background_url,
                    'url' => route('frontend.product.view', [
                        'slug' => $product->pariwisata->slug,
                        'product' => $product->slug
                    ]),
                    'parent_destination' => $product->pariwisata->title,
                    'metadata' => $metadata,
                    'overlays' => $product->overlays,
                ];
            });

        $recommendations = $randomDestinations->merge($randomProducts)->shuffle()->take(12);

        // Get all destination types for filtering
        $allDestinationTypes = \App\Models\PreferenceDestinationType::orderBy('title')
            ->get()
            ->map(function($dt) {
                return [
                    'id' => $dt->id,
                    'icon' => $dt->icon,
                    'title' => $dt->title,
                ];
            })
            ->toArray();

        return Inertia::render('frontend/SearchView', [
            'query' => $query,
            'filters' => $filters,
            'results' => $results,
            'recommendations' => $recommendations,
            'allDestinationTypes' => $allDestinationTypes,
        ]);
    }

    private function search($query, $filters)
    {
        // Search Pariwisata (destinations)
        $destinations = Pariwisata::with(['overlays', 'destinationTypes'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('subtitle', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%")
                      ->orWhere('label', 'like', "%{$query}%");
                });
            })
            ->when(!empty($filters['destination_type_ids']), function ($q) use ($filters) {
                $q->whereHas('destinationTypes', function($q) use ($filters) {
                    $q->whereIn('preference_destination_types.id', $filters['destination_type_ids']);
                });
            })
            ->get()
            ->map(function ($dest) {
                // Map destination preferences to metadata format
                $metadata = (object)[
                    'destination_types' => $dest->destinationTypes->pluck('title')->toArray(),
                ];
                
                return [
                    'id' => $dest->id,
                    'type' => 'destination',
                    'title' => $dest->title,
                    'subtitle' => $dest->subtitle,
                    'label' => $dest->label,
                    'slug' => $dest->slug,
                    'content' => $dest->content,
                    'background_url' => $dest->background_url,
                    'url' => route('home', ['open' => $dest->slug]),
                    'metadata' => $metadata,
                    'overlays' => $dest->overlays,
                ];
            });

        // Search Products
        $products = PariwisataProduct::with(['overlays', 'activityLevels', 'priceRanges', 'visitTimes', 'pariwisata.destinationTypes'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('subtitle', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%")
                      ->orWhere('label', 'like', "%{$query}%");
                });
            })
            ->when(!empty($filters['destination_type_ids']), function ($q) use ($filters) {
                $q->whereHas('pariwisata.destinationTypes', function($q) use ($filters) {
                    $q->whereIn('preference_destination_types.id', $filters['destination_type_ids']);
                });
            })
            ->get()
            ->map(function ($product) {
                // Map product preferences to metadata format
                $metadata = (object)[
                    'activity_levels' => $product->activityLevels->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                    'price_ranges' => $product->priceRanges->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                    'best_seasons' => $product->visitTimes->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                    'destination_types' => $product->pariwisata->destinationTypes->pluck('title')->toArray(),
                ];
                
                return [
                    'id' => $product->id,
                    'type' => 'product',
                    'title' => $product->title,
                    'subtitle' => $product->subtitle,
                    'label' => $product->label,
                    'slug' => $product->slug,
                    'content' => $product->content,
                    'background_url' => $product->background_url,
                    'url' => route('frontend.product.view', [
                        'slug' => $product->pariwisata->slug,
                        'product' => $product->slug
                    ]),
                    'parent_destination' => $product->pariwisata->title,
                    'metadata' => $metadata,
                    'overlays' => $product->overlays,
                ];
            });

        // Merge and return results
        return $destinations->concat($products)->values();
    }
}
