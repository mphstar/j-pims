<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DestinationResource;
use App\Models\Pariwisata;
use App\Models\Setting;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    /**
     * GET /api/destinations - List destinations with nested products
     */
    public function index(Request $request)
    {
    $items = Pariwisata::with(['overlays','products.overlays'])->get();
        $setting = Setting::query()->first();
        return response()->json([
            'success' => true,
            'data' => DestinationResource::collection($items),
            'setting' => $setting,
        ]);
    }

    /**
     * GET /api/destinations/{slug} - Single destination with nested products
     */
    public function show(string $slug)
    {
    $item = Pariwisata::with(['overlays','products.overlays'])->where('slug', $slug)->firstOrFail();
        $setting = Setting::query()->first();
        return response()->json([
            'success' => true,
            'data' => new DestinationResource($item),
            'setting' => $setting,
        ]);
    }
}
