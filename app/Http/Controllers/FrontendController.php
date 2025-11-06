<?php

namespace App\Http\Controllers;

use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use App\Models\PariwisataMetadata;
use App\Models\PariwisataProductMetadata;
use App\Models\Setting;
use App\Http\Resources\DestinationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FrontendController extends Controller
{
    public function index()
    {
        // Load pariwisata with new preference relationships
        $pariwisata = Pariwisata::with([
            'overlays',
            'destinationTypes', // preference_destination_types pivot
        ])->get();
        
        $setting = Setting::first();
        
        // Get metadata options from new preference tables
        $metadataOptions = $this->getMetadataOptions();
        
        // Extract keys for OnboardingDialog (backward compatibility)
        $metadataKeys = [
            'activity_levels' => array_column($metadataOptions['activity_levels'], 'key'),
            'price_ranges' => array_column($metadataOptions['price_ranges'], 'key'),
            'best_seasons' => array_column($metadataOptions['visit_times'], 'key'), // Map visit_times to best_seasons for compatibility
            'tags' => [], // Deprecated
        ];
        
        return Inertia::render('frontend/PariwisataView', [
            'pariwisata' => $pariwisata->map(function($p){
                // Map new preference relationships to frontend format
                $destinationTypes = $p->destinationTypes->map(function($dt) {
                    return [
                        'id' => $dt->id,
                        'icon' => $dt->icon,
                        'title' => $dt->title,
                        'key' => Str::slug($dt->title), // Generate key for compatibility
                    ];
                })->toArray();
                
                // Create metadata object for frontend compatibility
                $metadata = (object)[
                    'destination_types' => $destinationTypes,
                ];
                
                $p->metadata = $metadata;
                return $p;
            }),
            'setting' => $setting ?: ['style' => 'column'],
            'metadataOptions' => $metadataKeys, // Send keys for OnboardingDialog compatibility
            'metadataDetails' => $metadataOptions, // Full objects for future use
        ]);
    }
    
    /**
     * Get available metadata options from new preference tables
     */
    private function getMetadataOptions()
    {
        // Get active preferences from new tables
        $activityLevels = \App\Models\PreferenceActivityLevel::orderBy('title')
            ->get(['id', 'icon', 'title', 'subtitle'])
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'icon' => $item->icon,
                    'title' => $item->title,
                    'subtitle' => $item->subtitle,
                    'key' => Str::slug($item->title), // For localStorage compatibility
                ];
            })->toArray();
            
        $priceRanges = \App\Models\PreferencePriceRange::orderBy('title')
            ->get(['id', 'icon', 'title', 'subtitle'])
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'icon' => $item->icon,
                    'title' => $item->title,
                    'subtitle' => $item->subtitle,
                    'key' => Str::slug($item->title),
                ];
            })->toArray();
            
        $visitTimes = \App\Models\PreferenceVisitTime::orderBy('title')
            ->get(['id', 'icon', 'title', 'subtitle'])
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'icon' => $item->icon,
                    'title' => $item->title,
                    'subtitle' => $item->subtitle,
                    'key' => Str::slug($item->title),
                ];
            })->toArray();
            
        $destinationTypes = \App\Models\PreferenceDestinationType::orderBy('title')
            ->get(['id', 'icon', 'title'])
            ->map(function($item) {
                return [
                    'id' => $item->id,
                    'icon' => $item->icon,
                    'title' => $item->title,
                    'subtitle' => null, // No subtitle field in destination_types table
                    'key' => Str::slug($item->title),
                ];
            })->toArray();

        return [
            'activity_levels' => $activityLevels,
            'price_ranges' => $priceRanges,
            'visit_times' => $visitTimes,
            'destination_types' => $destinationTypes,
            'best_seasons' => [], // Deprecated, kept for compatibility
            'tags' => [], // Deprecated, kept for compatibility
        ];
    }

    public function show($slug)
    {
        $pariwisata = Pariwisata::with('overlays')->where('slug', $slug)->firstOrFail();
        
        return Inertia::render('frontend/PariwisataDetail', [
            'pariwisata' => $pariwisata,
        ]);
    }

    public function products($slug)
    {
        // Load destination with new preference relationships
        $item = Pariwisata::with([
            'overlays',
            'destinationTypes',
            'products' => function($query) {
                $query->with(['overlays', 'activityLevels', 'priceRanges', 'visitTimes']);
            }
        ])->where('slug', $slug)->firstOrFail();
        
        // Build destination payload with nested products
        $destination = (new DestinationResource($item));
        $setting = Setting::first();
        
        // Get metadata options for personalization
        $metadataOptions = $this->getMetadataOptions();
        
        // Extract keys for OnboardingDialog compatibility
        $metadataKeys = [
            'activity_levels' => array_column($metadataOptions['activity_levels'], 'key'),
            'price_ranges' => array_column($metadataOptions['price_ranges'], 'key'),
            'best_seasons' => array_column($metadataOptions['visit_times'], 'key'), // Map visit_times to best_seasons for compatibility
            'tags' => [], // Deprecated
        ];

        return Inertia::render('frontend/DestinationProducts', [
            'destination' => $destination,
            'setting' => $setting ?: ['style' => 'column'],
            'metadataOptions' => $metadataKeys, // Send keys for OnboardingDialog compatibility
            'metadataDetails' => $metadataOptions, // Full objects for future use
        ]);
    }

    public function product($slug, $product)
    {
        // Load destination with new preference relationships
        $dest = Pariwisata::with(['overlays', 'destinationTypes'])->where('slug', $slug)->firstOrFail();
        
        // Load product with new preference relationships
        $prod = PariwisataProduct::with(['overlays', 'activityLevels', 'priceRanges', 'visitTimes'])
            ->where('pariwisata_id', $dest->id)
            ->where('slug', $product)
            ->firstOrFail();
            
        $setting = Setting::first();
        
        // Map destination preferences to metadata format
        $destMeta = (object)[
            'destination_types' => $dest->destinationTypes->map(function($dt) {
                return $dt->title;
            })->toArray(),
        ];
        
        // Map product preferences to metadata format using keys
        $prodMeta = (object)[
            'activity_levels' => $prod->activityLevels->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
            'price_ranges' => $prod->priceRanges->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
            'best_seasons' => $prod->visitTimes->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
        ];
        
        return Inertia::render('frontend/ProductView', [
            'destination' => $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $dest->overlays, 'metadata' => $destMeta],
            'product' => $prod->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $prod->overlays, 'metadata' => $prodMeta],
            'products' => [
                $prod->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $prod->overlays, 'metadata' => $prodMeta]
            ],
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function productById(\App\Models\PariwisataProduct $product)
    {
        // Load product with new preference relationships
        $product->load([
            'overlays', 
            'activityLevels', 
            'priceRanges', 
            'visitTimes',
            'pariwisata.overlays',
            'pariwisata.destinationTypes'
        ]);
        
        $setting = Setting::first();
        $destination = $product->pariwisata;
        
        // Map destination preferences to metadata format
        $destMeta = (object)[
            'destination_types' => $destination->destinationTypes->map(function($dt) {
                return $dt->title;
            })->toArray(),
        ];
        
        // Map product preferences to metadata format using keys
        $prodMeta = (object)[
            'activity_levels' => $product->activityLevels->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
            'price_ranges' => $product->priceRanges->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
            'best_seasons' => $product->visitTimes->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
        ];
        
        return Inertia::render('frontend/ProductView', [
            'destination' => $destination->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $destination->overlays, 'metadata' => $destMeta],
            'product' => $product->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $product->overlays, 'metadata' => $prodMeta],
            'products' => [
                $product->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $product->overlays, 'metadata' => $prodMeta]
            ],
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function productBySlug($slug)
    {
        // Find destination by slug and render all its products as sections
        $dest = Pariwisata::with([
            'overlays', 
            'destinationTypes',
            'products.overlays', 
            'products.activityLevels', 
            'products.priceRanges', 
            'products.visitTimes'
        ])->where('slug', $slug)->firstOrFail();
        
        $setting = Setting::first();
        
        // Map products with new preference relationships
        $products = $dest->products->map(function($p){
            $prodMeta = (object)[
                'activity_levels' => $p->activityLevels->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                'price_ranges' => $p->priceRanges->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
                'best_seasons' => $p->visitTimes->pluck('title')->map(fn($t) => Str::slug($t))->toArray(),
            ];
            return $p->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $p->overlays, 'metadata' => $prodMeta];
        })->values();

        // Map destination metadata
        $destMeta = (object)[
            'destination_types' => $dest->destinationTypes->map(function($dt) {
                return $dt->title;
            })->toArray(),
        ];

        // If no explicit products, fabricate one from destination
        if ($products->isEmpty()) {
            $productArray = $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']);
            $productArray['overlays'] = [];
            $productArray['metadata'] = $destMeta;
            $products = collect([$productArray]);
        }

        return Inertia::render('frontend/ProductView', [
            'destination' => $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $dest->overlays, 'metadata' => $destMeta],
            'product' => $products->first(),
            'products' => $products,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }
}