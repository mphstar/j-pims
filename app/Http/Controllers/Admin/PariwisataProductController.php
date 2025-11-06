<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pariwisata;
use App\Models\PariwisataOverlays;
use App\Models\PariwisataProduct;
use App\Models\PreferenceValue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PariwisataProductController extends Controller
{
    public function index()
    {
        $data = PariwisataProduct::with('pariwisata:id,title,slug')->latest()->get();
        return Inertia::render('product/view', [
            'data' => $data,
        ]);
    }

    public function indexByPariwisata(Pariwisata $pariwisata)
    {
        $data = PariwisataProduct::with('pariwisata:id,title,slug')
            ->where('pariwisata_id', $pariwisata->id)
            ->latest()->get();
        return Inertia::render('product/view', [
            'data' => $data,
            'pariwisata' => $pariwisata->only(['id','title','slug'])
        ]);
    }

    public function create(Request $request)
    {
        $destinations = Pariwisata::select('id','title','slug')->orderBy('title')->get();
        
        $allActivityLevels = \App\Models\PreferenceActivityLevel::orderBy('title')->get(['id','icon','title','subtitle']);
        $allPriceRanges = \App\Models\PreferencePriceRange::orderBy('title')->get(['id','icon','title','subtitle']);
        $allVisitTimes = \App\Models\PreferenceVisitTime::orderBy('title')->get(['id','icon','title','subtitle']);
        
        return Inertia::render('product/create', [
            'destinations' => $destinations,
            'selectedPariwisataId' => $request->query('pariwisata_id'),
            'activityLevels' => $allActivityLevels,
            'priceRanges' => $allPriceRanges,
            'visitTimes' => $allVisitTimes,
            'selectedActivityLevelIds' => [],
            'selectedPriceRangeIds' => [],
            'selectedVisitTimeIds' => [],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pariwisata_id' => 'required|exists:pariwisata,id',
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pariwisata_products,slug',
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'activity_level_ids' => 'nullable|array',
            'activity_level_ids.*' => 'integer|exists:preference_activity_levels,id',
            'price_range_ids' => 'nullable|array',
            'price_range_ids.*' => 'integer|exists:preference_price_ranges,id',
            'visit_time_ids' => 'nullable|array',
            'visit_time_ids.*' => 'integer|exists:preference_visit_times,id',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            $original = $validated['slug'];
            $i = 1;
            while (PariwisataProduct::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $original.'-'.$i++;
            }
        }

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/pariwisata/products');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/pariwisata/products/'.$filename);
        }
        
        $activityLevelIds = $validated['activity_level_ids'] ?? [];
        $priceRangeIds = $validated['price_range_ids'] ?? [];
        $visitTimeIds = $validated['visit_time_ids'] ?? [];
        
        unset($validated['background_image'], $validated['activity_level_ids'], $validated['price_range_ids'], $validated['visit_time_ids']);

        $item = PariwisataProduct::create($validated);
        
        // Sync preferences
        if (!empty($activityLevelIds)) {
            $item->activityLevels()->sync($activityLevelIds);
        }
        if (!empty($priceRangeIds)) {
            $item->priceRanges()->sync($priceRangeIds);
        }
        if (!empty($visitTimeIds)) {
            $item->visitTimes()->sync($visitTimeIds);
        }
        
        return redirect()->route('product.by-pariwisata', $validated['pariwisata_id'])->with('success', 'Product berhasil dibuat');
    }

    public function edit(PariwisataProduct $product)
    {
        $product->load(['overlays', 'pariwisata:id,title', 'activityLevels', 'priceRanges', 'visitTimes']);
        $destinations = Pariwisata::select('id','title','slug')->orderBy('title')->get();
        
        $allActivityLevels = \App\Models\PreferenceActivityLevel::orderBy('title')->get(['id','icon','title','subtitle']);
        $allPriceRanges = \App\Models\PreferencePriceRange::orderBy('title')->get(['id','icon','title','subtitle']);
        $allVisitTimes = \App\Models\PreferenceVisitTime::orderBy('title')->get(['id','icon','title','subtitle']);
        
        $selectedActivityLevelIds = $product->activityLevels->pluck('id')->toArray();
        $selectedPriceRangeIds = $product->priceRanges->pluck('id')->toArray();
        $selectedVisitTimeIds = $product->visitTimes->pluck('id')->toArray();
        
        return Inertia::render('product/edit', [
            'item' => $product,
            'destinations' => $destinations,
            'overlays' => $product->overlays,
            'activityLevels' => $allActivityLevels,
            'priceRanges' => $allPriceRanges,
            'visitTimes' => $allVisitTimes,
            'selectedActivityLevelIds' => $selectedActivityLevelIds,
            'selectedPriceRangeIds' => $selectedPriceRangeIds,
            'selectedVisitTimeIds' => $selectedVisitTimeIds,
        ]);
    }

    public function update(Request $request, PariwisataProduct $product)
    {
        $validated = $request->validate([
            'pariwisata_id' => 'required|exists:pariwisata,id',
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:pariwisata_products,slug,'.$product->id,
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'activity_level_ids' => 'nullable|array',
            'activity_level_ids.*' => 'integer|exists:preference_activity_levels,id',
            'price_range_ids' => 'nullable|array',
            'price_range_ids.*' => 'integer|exists:preference_price_ranges,id',
            'visit_time_ids' => 'nullable|array',
            'visit_time_ids.*' => 'integer|exists:preference_visit_times,id',
        ]);

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/pariwisata/products');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/pariwisata/products/'.$filename);
        }
        
        $activityLevelIds = $validated['activity_level_ids'] ?? [];
        $priceRangeIds = $validated['price_range_ids'] ?? [];
        $visitTimeIds = $validated['visit_time_ids'] ?? [];
        
        unset($validated['background_image'], $validated['activity_level_ids'], $validated['price_range_ids'], $validated['visit_time_ids']);

        $product->update($validated);
        
        // Sync preferences
        $product->activityLevels()->sync($activityLevelIds);
        $product->priceRanges()->sync($priceRangeIds);
        $product->visitTimes()->sync($visitTimeIds);
        
        return redirect()->route('product.by-pariwisata', $product->pariwisata_id)->with('success', 'Product updated');
    }

    public function destroy(PariwisataProduct $product)
    {
        $pariwisataId = $product->pariwisata_id;
        
        // Delete background file
        $this->deleteFileIfExists($product->background_url);
        // Delete overlay files
        foreach ($product->overlays as $ov) {
            $this->deleteFileIfExists($ov->overlay_url);
        }
        PariwisataOverlays::where('product_id', $product->id)->delete();
        $product->delete();
        
        return redirect()->route('product.by-pariwisata', $pariwisataId)->with('success', 'Product berhasil dihapus');
    }

    public function deleteMultiple(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|array',
            'data.*.id' => 'required|integer|exists:pariwisata_products,id'
        ]);
        $ids = collect($data['data'])->pluck('id')->unique();
        $items = PariwisataProduct::with('overlays')->whereIn('id', $ids)->get();
        
        // Get first pariwisata_id for redirect (assuming all from same pariwisata in typical use case)
        $pariwisataId = $items->first()->pariwisata_id ?? null;
        
        foreach ($items as $item) {
            $this->deleteFileIfExists($item->background_url);
            foreach ($item->overlays as $ov) {
                $this->deleteFileIfExists($ov->overlay_url);
            }
            PariwisataOverlays::where('product_id', $item->id)->delete();
            $item->delete();
        }
        
        // Redirect to pariwisata product list if we have pariwisata_id, otherwise to general product index
        if ($pariwisataId) {
            return redirect()->route('product.by-pariwisata', $pariwisataId)->with('success', 'Products berhasil dihapus');
        }
        
        return redirect()->route('product.index')->with('success', 'Products berhasil dihapus');
    }

    public function uploadBackground(Request $request)
    {
        $request->validate(['image' => 'required|image']);
        $file = $request->file('image');
        $dir = public_path('uploads/pariwisata/products');
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/pariwisata/products/' . $filename);
        return response()->json(['url' => $publicUrl]);
    }

    public function storeOverlay(Request $request, PariwisataProduct $product)
    {
        $data = $request->validate([
            'overlay' => 'required|image|max:2048',
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop',
            'width' => 'nullable|integer|min:1',
            'height' => 'nullable|integer|min:1'
        ]);
        $file = $request->file('overlay');
        $dir = public_path('uploads/pariwisata/overlays');
        if (!is_dir($dir)) mkdir($dir, 0775, true);
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/pariwisata/overlays/' . $filename);
        PariwisataOverlays::create([
            'pariwisata_id' => $product->pariwisata_id,
            'product_id' => $product->id,
            'overlay_url' => $publicUrl,
            'position_horizontal' => $data['position_horizontal'] ?? 'center',
            'position_vertical' => $data['position_vertical'] ?? 'top',
            'object_fit' => $data['object_fit'] ?? 'contain',
            'width' => $data['width'] ?? null,
            'height' => $data['height'] ?? null,
        ]);
        return redirect()->route('product.by-pariwisata', $product->pariwisata_id)->with('success', 'Overlay berhasil dibuat');
    }

    public function updateOverlay(Request $request, PariwisataOverlays $overlay)
    {
        $data = $request->validate([
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop',
            'width' => 'nullable|integer|min:1',
            'height' => 'nullable|integer|min:1'
        ]);
        $overlay->update($data);
        $product = $overlay->product;
        return redirect()->route('product.by-pariwisata', $product->pariwisata_id)->with('success', 'Overlay berhasil diupdate');
    }

    public function deleteOverlay(PariwisataOverlays $overlay)
    {
        $product = $overlay->product;
        $pariwisataId = $product->pariwisata_id;
        $this->deleteFileIfExists($overlay->overlay_url);
        $overlay->delete();
        return redirect()->route('product.by-pariwisata', $pariwisataId)->with('success', 'Overlay berhasil dihapus');
    }

    private function deleteFileIfExists(?string $url): void
    {
        if (!$url) return;
        $parsed = parse_url($url);
        $path = public_path($parsed['path'] ?? '');
        if (file_exists($path)) {
            @unlink($path);
        }
    }
}
