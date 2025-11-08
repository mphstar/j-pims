<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SearchController extends Controller
{
    /**
     * Search destinations and products
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $filters = [
            'destination_type_ids' => $request->input('destination_type_ids', []),
            'activity_level_ids' => $request->input('activity_level_ids', []),
            'price_range_ids' => $request->input('price_range_ids', []),
            'visit_time_ids' => $request->input('visit_time_ids', []),
        ];

        // Convert comma-separated string to array if needed
        if (is_string($filters['destination_type_ids'])) {
            $filters['destination_type_ids'] = array_filter(explode(',', $filters['destination_type_ids']));
        }
        if (is_string($filters['activity_level_ids'])) {
            $filters['activity_level_ids'] = array_filter(explode(',', $filters['activity_level_ids']));
        }
        if (is_string($filters['price_range_ids'])) {
            $filters['price_range_ids'] = array_filter(explode(',', $filters['price_range_ids']));
        }
        if (is_string($filters['visit_time_ids'])) {
            $filters['visit_time_ids'] = array_filter(explode(',', $filters['visit_time_ids']));
        }

        $results = $this->performSearch($query, $filters);

        return response()->json([
            'success' => true,
            'data' => [
                'query' => $query,
                'filters' => $filters,
                'results' => $results,
                'total' => count($results),
            ]
        ]);
    }

    /**
     * Get search recommendations (random destinations and products)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function recommendations(Request $request)
    {
        $limit = $request->input('limit', 12);

        // Get random destinations
        $randomDestinations = Pariwisata::with(['overlays', 'destinationTypes'])
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($dest) {
                return [
                    'id' => $dest->id,
                    'type' => 'destination',
                    'title' => $dest->title,
                    'subtitle' => $dest->subtitle,
                    'label' => $dest->label,
                    'slug' => $dest->slug,
                    'content' => Str::limit(strip_tags($dest->content), 200),
                    'background_url' => $dest->background_url,
                    'overlays' => $dest->overlays,
                    'destination_types' => $dest->destinationTypes->map(function($dt) {
                        return [
                            'id' => $dt->id,
                            'icon' => $dt->icon,
                            'title' => $dt->title,
                        ];
                    }),
                ];
            });

        // Get random products
        $randomProducts = PariwisataProduct::with([
            'overlays', 
            'activityLevels', 
            'priceRanges', 
            'visitTimes', 
            'pariwisata.destinationTypes'
        ])
            ->inRandomOrder()
            ->limit(6)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'type' => 'product',
                    'title' => $product->title,
                    'subtitle' => $product->subtitle,
                    'label' => $product->label,
                    'slug' => $product->slug,
                    'content' => Str::limit(strip_tags($product->content), 200),
                    'background_url' => $product->background_url,
                    'parent_destination' => [
                        'id' => $product->pariwisata->id,
                        'title' => $product->pariwisata->title,
                        'slug' => $product->pariwisata->slug,
                    ],
                    'overlays' => $product->overlays,
                    'activity_levels' => $product->activityLevels->map(function($al) {
                        return [
                            'id' => $al->id,
                            'icon' => $al->icon,
                            'title' => $al->title,
                            'subtitle' => $al->subtitle,
                        ];
                    }),
                    'price_ranges' => $product->priceRanges->map(function($pr) {
                        return [
                            'id' => $pr->id,
                            'icon' => $pr->icon,
                            'title' => $pr->title,
                            'subtitle' => $pr->subtitle,
                        ];
                    }),
                    'visit_times' => $product->visitTimes->map(function($vt) {
                        return [
                            'id' => $vt->id,
                            'icon' => $vt->icon,
                            'title' => $vt->title,
                            'subtitle' => $vt->subtitle,
                        ];
                    }),
                    'destination_types' => $product->pariwisata->destinationTypes->map(function($dt) {
                        return [
                            'id' => $dt->id,
                            'icon' => $dt->icon,
                            'title' => $dt->title,
                        ];
                    }),
                ];
            });

        $recommendations = $randomDestinations->merge($randomProducts)
            ->shuffle()
            ->take($limit)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    /**
     * Perform search on destinations and products
     * 
     * @param string $query
     * @param array $filters
     * @return array
     */
    private function performSearch($query, $filters)
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
                return [
                    'id' => $dest->id,
                    'type' => 'destination',
                    'title' => $dest->title,
                    'subtitle' => $dest->subtitle,
                    'label' => $dest->label,
                    'slug' => $dest->slug,
                    'content' => Str::limit(strip_tags($dest->content), 200),
                    'background_url' => $dest->background_url,
                    'overlays' => $dest->overlays,
                    'destination_types' => $dest->destinationTypes->map(function($dt) {
                        return [
                            'id' => $dt->id,
                            'icon' => $dt->icon,
                            'title' => $dt->title,
                        ];
                    }),
                ];
            });

        // Search Products
        $products = PariwisataProduct::with([
            'overlays', 
            'activityLevels', 
            'priceRanges', 
            'visitTimes', 
            'pariwisata.destinationTypes'
        ])
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
            ->when(!empty($filters['activity_level_ids']), function ($q) use ($filters) {
                $q->whereHas('activityLevels', function($q) use ($filters) {
                    $q->whereIn('preference_activity_levels.id', $filters['activity_level_ids']);
                });
            })
            ->when(!empty($filters['price_range_ids']), function ($q) use ($filters) {
                $q->whereHas('priceRanges', function($q) use ($filters) {
                    $q->whereIn('preference_price_ranges.id', $filters['price_range_ids']);
                });
            })
            ->when(!empty($filters['visit_time_ids']), function ($q) use ($filters) {
                $q->whereHas('visitTimes', function($q) use ($filters) {
                    $q->whereIn('preference_visit_times.id', $filters['visit_time_ids']);
                });
            })
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'type' => 'product',
                    'title' => $product->title,
                    'subtitle' => $product->subtitle,
                    'label' => $product->label,
                    'slug' => $product->slug,
                    'content' => Str::limit(strip_tags($product->content), 200),
                    'background_url' => $product->background_url,
                    'parent_destination' => [
                        'id' => $product->pariwisata->id,
                        'title' => $product->pariwisata->title,
                        'slug' => $product->pariwisata->slug,
                    ],
                    'overlays' => $product->overlays,
                    'activity_levels' => $product->activityLevels->map(function($al) {
                        return [
                            'id' => $al->id,
                            'icon' => $al->icon,
                            'title' => $al->title,
                            'subtitle' => $al->subtitle,
                        ];
                    }),
                    'price_ranges' => $product->priceRanges->map(function($pr) {
                        return [
                            'id' => $pr->id,
                            'icon' => $pr->icon,
                            'title' => $pr->title,
                            'subtitle' => $pr->subtitle,
                        ];
                    }),
                    'visit_times' => $product->visitTimes->map(function($vt) {
                        return [
                            'id' => $vt->id,
                            'icon' => $vt->icon,
                            'title' => $vt->title,
                            'subtitle' => $vt->subtitle,
                        ];
                    }),
                    'destination_types' => $product->pariwisata->destinationTypes->map(function($dt) {
                        return [
                            'id' => $dt->id,
                            'icon' => $dt->icon,
                            'title' => $dt->title,
                        ];
                    }),
                ];
            });

        // Merge and return results
        return $destinations->concat($products)->values();
    }
}
