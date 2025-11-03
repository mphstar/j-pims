<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pariwisata;
use App\Models\PariwisataOverlays;
use App\Models\PariwisataProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PariwisataProductController extends Controller
{
    private function deleteFileIfExists(?string $url): void
    {
        if (!$url) return;
        $publicPath = public_path();
        $parsed = parse_url($url, PHP_URL_PATH);
        if (!$parsed) return;
        $relative = ltrim($parsed, '/');
        if (!str_starts_with($relative, 'uploads/pariwisata/') && !str_starts_with($relative, 'pariwisata/')) return;
        $full = $publicPath . DIRECTORY_SEPARATOR . $relative;
        if (is_file($full)) {
            @unlink($full);
        }
    }

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
        return Inertia::render('product/create', [
            'destinations' => $destinations,
            'selectedPariwisataId' => $request->integer('pariwisata_id') ?: null,
            'item' => null,
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
        unset($validated['background_image']);

        $item = PariwisataProduct::create($validated);
        return redirect()->route('product.edit', $item->id)->with('success', 'Product created. Silakan lanjut menambah overlay.');
    }

    public function edit(PariwisataProduct $product)
    {
        $product->load(['overlays', 'pariwisata:id,title', 'metadata']);
        $destinations = Pariwisata::select('id','title','slug')->orderBy('title')->get();
        return Inertia::render('product/edit', [
            'item' => $product,
            'destinations' => $destinations,
            'overlays' => $product->overlays,
            'metadata' => $product->metadata,
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
        unset($validated['background_image']);

        $product->update($validated);
        return redirect()->route('product.index')->with('success', 'Product updated');
    }

    public function destroy(PariwisataProduct $product)
    {
        // Delete background file
        $this->deleteFileIfExists($product->background_url);
        // Delete overlay files
        foreach ($product->overlays as $ov) {
            $this->deleteFileIfExists($ov->overlay_url);
        }
        PariwisataOverlays::where('product_id', $product->id)->delete();
        $product->delete();
        return redirect()->route('product.index')->with('success', 'Product & files deleted');
    }

    public function deleteMultiple(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|array',
            'data.*.id' => 'required|integer|exists:pariwisata_products,id'
        ]);
        $ids = collect($data['data'])->pluck('id')->unique();
        $items = PariwisataProduct::with('overlays')->whereIn('id', $ids)->get();
        foreach ($items as $item) {
            $this->deleteFileIfExists($item->background_url);
            foreach ($item->overlays as $ov) {
                $this->deleteFileIfExists($ov->overlay_url);
            }
            PariwisataOverlays::where('product_id', $item->id)->delete();
            $item->delete();
        }
        return redirect()->route('product.index')->with('success', 'Selected products deleted');
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
        return redirect()->route('product.edit', $product->id)->with('success', 'Overlay created');
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
        return redirect()->route('product.edit', $overlay->product_id)->with('success', 'Overlay updated');
    }

    public function deleteOverlay(PariwisataOverlays $overlay)
    {
        $pid = $overlay->product_id;
        $this->deleteFileIfExists($overlay->overlay_url);
        $overlay->delete();
        return redirect()->route('product.edit', $pid)->with('success', 'Overlay deleted');
    }

    // Metadata CRUD
    public function storeMetadata(Request $request, PariwisataProduct $product)
    {
        $validated = $request->validate([
            'activity_level' => 'nullable|in:easy,moderate,challenging',
            'price_range' => 'nullable|in:budget,moderate,expensive,luxury',
            'best_season' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'duration_hours' => 'nullable|numeric|min:0|max:999.99',
            'target_age_group' => 'nullable|array',
            'target_age_group.*' => 'string|max:50',
            'includes' => 'nullable|array',
            'includes.*' => 'string|max:100',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string|max:100',
            'group_size' => 'nullable|array',
        ]);

        $product->metadata()->updateOrCreate(
            ['product_id' => $product->id],
            $validated
        );

        return redirect()->route('product.edit', $product->id)->with('success', 'Metadata updated');
    }
}
