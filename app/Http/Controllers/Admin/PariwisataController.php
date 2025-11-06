<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pariwisata;
use App\Models\PariwisataOverlays;
use App\Models\PreferenceValue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class PariwisataController extends Controller
{
    private function deleteFileIfExists(?string $url): void
    {
        if (!$url) return;
        // Expecting asset('uploads/...') or legacy asset('pariwisata/...')
        $publicPath = public_path();
        $parsed = parse_url($url, PHP_URL_PATH);
        if (!$parsed) return;
        // Remove leading slash
        $relative = ltrim($parsed, '/');
        // Security: ensure it's inside allowed directories
        if (!str_starts_with($relative, 'uploads/pariwisata/') && !str_starts_with($relative, 'pariwisata/')) return;
        $full = $publicPath . DIRECTORY_SEPARATOR . $relative;
        if (is_file($full)) {
            @unlink($full);
        }
    }

    public function index()
    {
        $data = Pariwisata::latest()->get();

        return Inertia::render('pariwisata/view', [
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pariwisata,slug',
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255', // will be set after upload
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'destination_type_ids' => 'nullable|array',
            'destination_type_ids.*' => 'integer|exists:preference_destination_types,id',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            // Ensure uniqueness
            $original = $validated['slug'];
            $i = 1;
            while (Pariwisata::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $original.'-'.$i++;
            }
        }

        // Handle background image upload if provided
        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/pariwisata/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/pariwisata/backgrounds/'.$filename);
        }

        $destinationTypeIds = $validated['destination_type_ids'] ?? [];
        unset($validated['background_image'], $validated['destination_type_ids']);
        
        $item = Pariwisata::create($validated);
        
        // Sync destination types
        if (!empty($destinationTypeIds)) {
            $item->destinationTypes()->sync($destinationTypeIds);
        }

        return redirect()->route('pariwisata.edit', $item->id)->with('success', 'Pariwisata created. Silakan lanjut menambah overlay.');
    }

    public function update(Request $request, Pariwisata $pariwisata)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:pariwisata,slug,'.$pariwisata->id,
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'destination_type_ids' => 'nullable|array',
            'destination_type_ids.*' => 'integer|exists:preference_destination_types,id',
        ]);

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/pariwisata/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/pariwisata/backgrounds/'.$filename);
        }
        
        $destinationTypeIds = $validated['destination_type_ids'] ?? [];
        unset($validated['background_image'], $validated['destination_type_ids']);

        $pariwisata->update($validated);
        
        // Sync destination types
        $pariwisata->destinationTypes()->sync($destinationTypeIds);

        return redirect()->route('pariwisata.index')->with('success', 'Pariwisata updated');
    }

    public function create()
    {
        $allDestinationTypes = \App\Models\PreferenceDestinationType::orderBy('title')->get(['id','icon','title']);
        
        return Inertia::render('pariwisata/create', [
            'item' => null,
            'destinationTypes' => $allDestinationTypes,
            'selectedDestinationTypeIds' => [],
        ]);
    }

    public function edit(Pariwisata $pariwisata)
    {
        $pariwisata->load(['overlays', 'destinationTypes']);
        $allDestinationTypes = \App\Models\PreferenceDestinationType::orderBy('title')->get(['id','icon','title']);
        $selectedDestinationTypeIds = $pariwisata->destinationTypes->pluck('id')->values();
        
        return Inertia::render('pariwisata/edit', [
            'item' => $pariwisata,
            'overlays' => $pariwisata->overlays,
            'destinationTypes' => $allDestinationTypes,
            'selectedDestinationTypeIds' => $selectedDestinationTypeIds,
        ]);
    }

    public function uploadBackground(Request $request)
    {
        $request->validate([
            'image' => 'required|image'
        ]);

        $file = $request->file('image');
        $dir = public_path('uploads/pariwisata/backgrounds');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/pariwisata/backgrounds/' . $filename);
        return response()->json(['url' => $publicUrl]);
    }

    public function storeOverlay(Request $request, Pariwisata $pariwisata)
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
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/pariwisata/overlays/' . $filename);
        PariwisataOverlays::create([
            'pariwisata_id' => $pariwisata->id,
            'overlay_url' => $publicUrl,
            'position_horizontal' => $data['position_horizontal'] ?? 'center',
            'position_vertical' => $data['position_vertical'] ?? 'top',
            'object_fit' => $data['object_fit'] ?? 'contain',
            'width' => $data['width'] ?? null,
            'height' => $data['height'] ?? null,
        ]);
        return redirect()->route('pariwisata.edit', $pariwisata->id)->with('success', 'Overlay created');
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
        return redirect()->route('pariwisata.edit', $overlay->pariwisata_id)->with('success', 'Overlay updated');
    }

    public function deleteOverlay(PariwisataOverlays $overlay)
    {
        $pid = $overlay->pariwisata_id;
        // delete file
        $this->deleteFileIfExists($overlay->overlay_url);
        $overlay->delete();
        return redirect()->route('pariwisata.edit', $pid)->with('success', 'Overlay deleted');
    }

    public function destroy(Pariwisata $pariwisata)
    {
        // Delete background file
        $this->deleteFileIfExists($pariwisata->background_url);
        // Delete overlay files
        foreach ($pariwisata->overlays as $ov) {
            $this->deleteFileIfExists($ov->overlay_url);
        }
        // Delete related overlays (DB cascade could also handle if FK onDelete cascade)
        PariwisataOverlays::where('pariwisata_id', $pariwisata->id)->delete();
        $pariwisata->delete();
        return redirect()->route('pariwisata.index')->with('success', 'Pariwisata & files deleted');
    }

    public function deleteMultiple(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|array',
            'data.*.id' => 'required|integer|exists:pariwisata,id'
        ]);

        $ids = collect($data['data'])->pluck('id')->unique();
        $items = Pariwisata::with('overlays')->whereIn('id', $ids)->get();
        foreach ($items as $item) {
            $this->deleteFileIfExists($item->background_url);
            foreach ($item->overlays as $ov) {
                $this->deleteFileIfExists($ov->overlay_url);
            }
            PariwisataOverlays::where('pariwisata_id', $item->id)->delete();
            $item->delete();
        }
        return redirect()->route('pariwisata.index')->with('success', 'Selected pariwisata deleted');
    }
}
