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
        $pariwisata = Pariwisata::with(['overlays', 'metadata', 'preferenceValues'])->get();
        $setting = Setting::first();
        
        // Get metadata options from database
        $metadataOptions = $this->getMetadataOptions();
        
        return Inertia::render('frontend/PariwisataView', [
            'pariwisata' => $pariwisata->map(function($p){
                // augment metadata with preference arrays
                $meta = $p->metadata ?: new \stdClass();
                $prefs = $p->preferenceValues ?: collect();
                $meta->activity_levels = $prefs->where('type','activity')->pluck('key')->values();
                $meta->price_ranges = $prefs->where('type','price')->pluck('key')->values();
                $meta->best_seasons = $prefs->where('type','season')->pluck('key')->values();
                $p->setRelation('metadata', $meta);
                return $p;
            }),
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

        // Also include from preference_values master if present
        $pref = \App\Models\PreferenceValue::query();
        $activityLevelsFromPref = $pref->clone()->where('type','activity')->where('active',true)->orderBy('sort')->pluck('key')->toArray();
        $priceRangesFromPref = $pref->clone()->where('type','price')->where('active',true)->orderBy('sort')->pluck('key')->toArray();
        $bestSeasonsFromPref = $pref->clone()->where('type','season')->where('active',true)->orderBy('sort')->pluck('label')->toArray();

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
            'activity_levels' => count($activityLevelsFromPref) > 0 ? $activityLevelsFromPref : (count($activityLevels) > 0 ? $activityLevels : ['easy', 'moderate', 'challenging']),
            'price_ranges' => count($priceRangesFromPref) > 0 ? $priceRangesFromPref : (count($priceRanges) > 0 ? $priceRanges : ['budget', 'moderate', 'expensive', 'luxury']),
            'best_seasons' => count($bestSeasonsFromPref) > 0 ? $bestSeasonsFromPref : (count($bestSeasons) > 0 ? $bestSeasons : ['Januari-April', 'Mei-Oktober', 'Sepanjang Tahun']),
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
        $item = Pariwisata::with(['overlays', 'metadata', 'preferenceValues', 'products.overlays', 'products.metadata', 'products.preferenceValues'])->where('slug', $slug)->firstOrFail();
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
        $dest = Pariwisata::with(['metadata','preferenceValues'])->where('slug', $slug)->firstOrFail();
        $prod = PariwisataProduct::with(['overlays', 'metadata','preferenceValues'])->where('pariwisata_id', $dest->id)->where('slug', $product)->firstOrFail();
        $setting = Setting::first();
        // Also load destination overlays and metadata for fallback rendering if product has none
        $dest->load(['overlays']);
        // augment metadata arrays from preferences
        $destMeta = $dest->metadata ?: new \stdClass();
        $dPrefs = $dest->preferenceValues ?: collect();
        $destMeta->activity_levels = $dPrefs->where('type','activity')->pluck('key')->values();
        $destMeta->price_ranges = $dPrefs->where('type','price')->pluck('key')->values();
        $destMeta->best_seasons = $dPrefs->where('type','season')->pluck('key')->values();
        $dest->setRelation('metadata', $destMeta);

        $prodMeta = $prod->metadata ?: new \stdClass();
        $pPrefs = $prod->preferenceValues ?: collect();
        $prodMeta->activity_levels = $pPrefs->where('type','activity')->pluck('key')->values();
        $prodMeta->price_ranges = $pPrefs->where('type','price')->pluck('key')->values();
        $prodMeta->best_seasons = $pPrefs->where('type','season')->pluck('key')->values();
        $prod->setRelation('metadata', $prodMeta);
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
        $product->load(['overlays', 'metadata', 'preferenceValues', 'pariwisata.overlays', 'pariwisata.metadata', 'pariwisata.preferenceValues']);
        $setting = Setting::first();
        $destination = $product->pariwisata;
        // augment metadata arrays
        $destMeta = $destination->metadata ?: new \stdClass();
        $dPrefs = $destination->preferenceValues ?: collect();
        $destMeta->activity_levels = $dPrefs->where('type','activity')->pluck('key')->values();
        $destMeta->price_ranges = $dPrefs->where('type','price')->pluck('key')->values();
        $destMeta->best_seasons = $dPrefs->where('type','season')->pluck('key')->values();
        $destination->setRelation('metadata', $destMeta);

        $prodMeta = $product->metadata ?: new \stdClass();
        $pPrefs = $product->preferenceValues ?: collect();
        $prodMeta->activity_levels = $pPrefs->where('type','activity')->pluck('key')->values();
        $prodMeta->price_ranges = $pPrefs->where('type','price')->pluck('key')->values();
        $prodMeta->best_seasons = $pPrefs->where('type','season')->pluck('key')->values();
        $product->setRelation('metadata', $prodMeta);
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
        $dest = Pariwisata::with(['overlays', 'metadata','preferenceValues', 'products.overlays', 'products.metadata', 'products.preferenceValues'])->where('slug', $slug)->firstOrFail();
        $setting = Setting::first();
        $products = $dest->products->map(function($p){
            // augment product metadata with preferences
            $prodMeta = $p->metadata ?: new \stdClass();
            $pPrefs = $p->preferenceValues ?: collect();
            $prodMeta->activity_levels = $pPrefs->where('type','activity')->pluck('key')->values();
            $prodMeta->price_ranges = $pPrefs->where('type','price')->pluck('key')->values();
            $prodMeta->best_seasons = $pPrefs->where('type','season')->pluck('key')->values();
            return $p->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $p->overlays, 'metadata' => $prodMeta];
        })->values();

        // If no explicit products, fabricate one from destination
        if ($products->isEmpty()) {
            $productArray = $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']);
            $productArray['overlays'] = [];
            // augment dest metadata arrays
            $destMeta = $dest->metadata ?: new \stdClass();
            $dPrefs = $dest->preferenceValues ?: collect();
            $destMeta->activity_levels = $dPrefs->where('type','activity')->pluck('key')->values();
            $destMeta->price_ranges = $dPrefs->where('type','price')->pluck('key')->values();
            $destMeta->best_seasons = $dPrefs->where('type','season')->pluck('key')->values();
            $productArray['metadata'] = $destMeta;
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