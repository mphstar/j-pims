<?php

namespace App\Http\Controllers;

use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->input('q', '');
        $filters = [
            'labels' => $request->input('labels', []),
        ];

        $results = $this->search($query, $filters);

        // Get recommendations (random mix of destinations and products)
        $randomDestinations = Pariwisata::with(['overlays', 'metadata'])
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
                    'content' => $dest->content,
                    'background_url' => $dest->background_url,
                    'url' => route('home', ['open' => $dest->slug]),
                    'metadata' => $dest->metadata,
                    'overlays' => $dest->overlays,
                ];
            });

        $randomProducts = PariwisataProduct::with(['overlays', 'metadata', 'pariwisata'])
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
                    'content' => $product->content,
                    'background_url' => $product->background_url,
                    'url' => route('frontend.product.view', [
                        'slug' => $product->pariwisata->slug,
                        'product' => $product->slug
                    ]),
                    'parent_destination' => $product->pariwisata->title,
                    'metadata' => $product->metadata,
                    'overlays' => $product->overlays,
                ];
            });

        $recommendations = $randomDestinations->merge($randomProducts)->shuffle()->take(12);

        // Get all labels for filtering
        $allLabels = Pariwisata::pluck('label')->unique()->values()->toArray();

        return Inertia::render('frontend/SearchView', [
            'query' => $query,
            'filters' => $filters,
            'results' => $results,
            'recommendations' => $recommendations,
            'allLabels' => $allLabels,
        ]);
    }

    private function search($query, $filters)
    {
        // Search Pariwisata (destinations)
        $destinations = Pariwisata::with(['overlays', 'metadata'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('subtitle', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%")
                      ->orWhere('label', 'like', "%{$query}%");
                });
            })
            ->when(!empty($filters['labels']), function ($q) use ($filters) {
                $q->whereIn('label', $filters['labels']);
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
                    'content' => $dest->content,
                    'background_url' => $dest->background_url,
                    'url' => route('home', ['open' => $dest->slug]),
                    'metadata' => $dest->metadata,
                    'overlays' => $dest->overlays,
                ];
            });

        // Search Products
        $products = PariwisataProduct::with(['overlays', 'metadata', 'pariwisata'])
            ->when($query, function ($q) use ($query) {
                $q->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                      ->orWhere('subtitle', 'like', "%{$query}%")
                      ->orWhere('content', 'like', "%{$query}%")
                      ->orWhere('label', 'like', "%{$query}%");
                });
            })
            ->when(!empty($filters['labels']), function ($q) use ($filters) {
                $q->whereIn('label', $filters['labels']);
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
                    'content' => $product->content,
                    'background_url' => $product->background_url,
                    'url' => route('frontend.product.view', [
                        'slug' => $product->pariwisata->slug,
                        'product' => $product->slug
                    ]),
                    'parent_destination' => $product->pariwisata->title,
                    'metadata' => $product->metadata,
                    'overlays' => $product->overlays,
                ];
            });

        // Merge and return results
        return $destinations->concat($products)->values();
    }
}
