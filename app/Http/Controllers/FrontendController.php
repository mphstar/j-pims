<?php

namespace App\Http\Controllers;

use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use App\Models\PariwisataMetadata;
use App\Models\PariwisataProductMetadata;
use App\Models\Setting;
use App\Http\Resources\DestinationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrontendController extends Controller
{
    public function index()
    {
        $pariwisata = Pariwisata::with(['overlays', 'metadata'])->get();
        $setting = Setting::first();
        
        // Get metadata options from database
        $metadataOptions = $this->getMetadataOptions();
        
        return Inertia::render('frontend/PariwisataView', [
            'pariwisata' => $pariwisata,
            'setting' => $setting ?: ['style' => 'column'],
            'metadataOptions' => $metadataOptions,
        ]);
    }
    
    /**
     * Get available metadata options from existing data
     */
    private function getMetadataOptions()
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
        ])->unique()->values()->toArray();

        $priceRanges = collect([
            ...$destinationMetadata->pluck('price_range')->filter(),
            ...$productMetadata->pluck('price_range')->filter()
        ])->unique()->values()->toArray();

        $bestSeasons = collect([
            ...$destinationMetadata->pluck('best_season')->filter(),
            ...$productMetadata->pluck('best_season')->filter()
        ])->unique()->values()->toArray();

        // Extract tags from JSON arrays (for future use)
        $allTags = collect([
            ...$destinationMetadata->pluck('tags')->filter()->flatten(),
            ...$productMetadata->pluck('tags')->filter()->flatten()
        ])->unique()->values()->toArray();

        // Fallback to enum options if no data exists
        return [
            'activity_levels' => count($activityLevels) > 0 ? $activityLevels : ['easy', 'moderate', 'challenging'],
            'price_ranges' => count($priceRanges) > 0 ? $priceRanges : ['budget', 'moderate', 'expensive', 'luxury'],
            'best_seasons' => $bestSeasons,
            'tags' => $allTags,
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
        $item = Pariwisata::with(['overlays', 'metadata', 'products.overlays', 'products.metadata'])->where('slug', $slug)->firstOrFail();
        // Build destination payload with nested products
        $destination = (new DestinationResource($item));
        $setting = Setting::first();

        return Inertia::render('frontend/DestinationProducts', [
            'destination' => $destination,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function product($slug, $product)
    {
        $dest = Pariwisata::where('slug', $slug)->firstOrFail();
        $prod = PariwisataProduct::with(['overlays', 'metadata'])->where('pariwisata_id', $dest->id)->where('slug', $product)->firstOrFail();
        $setting = Setting::first();
        // Also load destination overlays and metadata for fallback rendering if product has none
        $dest->load(['overlays', 'metadata']);
        return Inertia::render('frontend/ProductView', [
            'destination' => $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $dest->overlays, 'metadata' => $dest->metadata],
            'product' => $prod->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $prod->overlays, 'metadata' => $prod->metadata],
            // Provide products array to allow multi-product rendering on the frontend
            'products' => [
                $prod->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $prod->overlays, 'metadata' => $prod->metadata]
            ],
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function productById(\App\Models\PariwisataProduct $product)
    {
        // Render a single product in the same style as a pariwisata section (no variants)
        $product->load(['overlays', 'metadata', 'pariwisata.overlays', 'pariwisata.metadata']);
        $setting = Setting::first();
        $destination = $product->pariwisata;
        return Inertia::render('frontend/ProductView', [
            'destination' => $destination->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $destination->overlays, 'metadata' => $destination->metadata],
            'product' => $product->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $product->overlays, 'metadata' => $product->metadata],
            'products' => [
                $product->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $product->overlays, 'metadata' => $product->metadata]
            ],
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function productBySlug($slug)
    {
        // Find destination by slug and render all its products as sections
        $dest = Pariwisata::with(['overlays', 'metadata', 'products.overlays', 'products.metadata'])->where('slug', $slug)->firstOrFail();
        $setting = Setting::first();
        $products = $dest->products->map(function($p){
            return $p->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $p->overlays, 'metadata' => $p->metadata];
        })->values();

        // If no explicit products, fabricate one from destination
        if ($products->isEmpty()) {
            $productArray = $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']);
            $productArray['overlays'] = [];
            $productArray['metadata'] = $dest->metadata;
            $products = collect([$productArray]);
        }

        return Inertia::render('frontend/ProductView', [
            'destination' => $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $dest->overlays, 'metadata' => $dest->metadata],
            // keep single 'product' for backward compat (first item)
            'product' => $products->first(),
            'products' => $products,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }
}