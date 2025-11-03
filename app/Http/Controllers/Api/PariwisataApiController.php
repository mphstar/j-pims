<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pariwisata;
use App\Models\Setting;
use Illuminate\Http\Request;

class PariwisataApiController extends Controller
{
    public function index()
    {
        $pariwisata = Pariwisata::with(['overlays', 'metadata'])->get();
        $setting = Setting::first();
        
        return response()->json([
            'success' => true,
            'data' => $pariwisata,
            'setting' => $setting ?: ['style' => 'column'],
        ]);
    }

    public function show($slug)
    {
        $pariwisata = Pariwisata::with(['overlays', 'metadata'])->where('slug', $slug)->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $pariwisata,
        ]);
    }
}