<?php

namespace App\Http\Controllers;

use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use App\Models\Setting;
use App\Http\Resources\DestinationResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrontendController extends Controller
{
    public function index()
    {
        $pariwisata = Pariwisata::with('overlays')->get();
        $setting = Setting::first();
        
        return Inertia::render('frontend/PariwisataView', [
            'pariwisata' => $pariwisata,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
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
        $item = Pariwisata::with(['overlays','products.overlays'])->where('slug', $slug)->firstOrFail();
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
        $prod = PariwisataProduct::with('overlays')->where('pariwisata_id', $dest->id)->where('slug', $product)->firstOrFail();
        $setting = Setting::first();
        // Also load destination overlays for fallback rendering if product has none
        $dest->load('overlays');
        return Inertia::render('frontend/ProductView', [
            'destination' => $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $dest->overlays],
            'product' => $prod->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $prod->overlays],
            // Provide products array to allow multi-product rendering on the frontend
            'products' => [
                $prod->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $prod->overlays]
            ],
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function productById(\App\Models\PariwisataProduct $product)
    {
        // Render a single product in the same style as a pariwisata section (no variants)
        $product->load('overlays', 'pariwisata.overlays');
        $setting = Setting::first();
        $destination = $product->pariwisata;
        return Inertia::render('frontend/ProductView', [
            'destination' => $destination->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $destination->overlays],
            'product' => $product->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $product->overlays],
            'products' => [
                $product->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $product->overlays]
            ],
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function productBySlug($slug)
    {
        // Find destination by slug and render all its products as sections
        $dest = Pariwisata::with(['overlays','products.overlays'])->where('slug', $slug)->firstOrFail();
        $setting = Setting::first();
        $products = $dest->products->map(function($p){
            return $p->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $p->overlays];
        })->values();

        // If no explicit products, fabricate one from destination
        if ($products->isEmpty()) {
            $productArray = $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']);
            $productArray['overlays'] = [];
            $products = collect([$productArray]);
        }

        return Inertia::render('frontend/ProductView', [
            'destination' => $dest->only(['id','title','slug','label','subtitle','content','background_url','cta_href','cta_label','align']) + ['overlays' => $dest->overlays],
            // keep single 'product' for backward compat (first item)
            'product' => $products->first(),
            'products' => $products,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }
}