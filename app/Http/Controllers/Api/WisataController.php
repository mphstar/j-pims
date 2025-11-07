<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use App\Models\Cerita;
use Illuminate\Http\Request;

class WisataController extends Controller
{
    /**
     * Get all wisata (pariwisata) with relations
     */
    public function index()
    {
        $wisata = Pariwisata::with([
            'overlays',
            'destinationTypes',
            'products.overlays',
            'products.activityLevels',
            'products.priceRanges',
            'products.visitTimes',
            'cerita.overlays',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $wisata,
        ]);
    }

    /**
     * Get single wisata by slug
     */
    public function show($slug)
    {
        $wisata = Pariwisata::with([
            'overlays',
            'destinationTypes',
            'products.overlays',
            'products.activityLevels',
            'products.priceRanges',
            'products.visitTimes',
            'cerita.overlays',
        ])->where('slug', $slug)->first();

        if (!$wisata) {
            return response()->json([
                'success' => false,
                'message' => 'Wisata not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $wisata,
        ]);
    }

    /**
     * Get all products
     */
    public function products()
    {
        $products = PariwisataProduct::with([
            'overlays',
            'activityLevels',
            'priceRanges',
            'visitTimes',
            'pariwisata.overlays',
            'pariwisata.destinationTypes',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get single product by slug
     */
    public function showProduct($slug)
    {
        $product = PariwisataProduct::with([
            'overlays',
            'activityLevels',
            'priceRanges',
            'visitTimes',
            'pariwisata.overlays',
            'pariwisata.destinationTypes',
        ])->where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Get all cerita (stories)
     */
    public function cerita()
    {
        $cerita = Cerita::with([
            'overlays',
            'pariwisata.overlays',
            'pariwisata.destinationTypes',
        ])->get();

        return response()->json([
            'success' => true,
            'data' => $cerita,
        ]);
    }

    /**
     * Get single cerita by slug
     */
    public function showCerita($slug)
    {
        $cerita = Cerita::with([
            'overlays',
            'pariwisata.overlays',
            'pariwisata.destinationTypes',
        ])->where('slug', $slug)->first();

        if (!$cerita) {
            return response()->json([
                'success' => false,
                'message' => 'Cerita not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $cerita,
        ]);
    }
}
