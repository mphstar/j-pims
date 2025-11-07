<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cerita;
use App\Models\CeritaOverlays;
use App\Models\Pariwisata;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CeritaController extends Controller
{
    public function index()
    {
        $items = Cerita::with(['overlays','pariwisata:id,title,slug'])->orderBy('created_at', 'desc')->get();
        return Inertia::render('cerita/view', [
            'items' => $items,
        ]);
    }

    public function byPariwisata(\App\Models\Pariwisata $pariwisata)
    {
        $items = Cerita::with(['overlays','pariwisata:id,title,slug'])
            ->where('pariwisata_id', $pariwisata->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('cerita/view', [
            'items' => $items,
            'pariwisata' => $pariwisata->only(['id','title','slug']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cerita,slug',
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
            'pariwisata_id' => 'nullable|exists:pariwisata,id',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
            // Ensure uniqueness
            $original = $validated['slug'];
            $i = 1;
            while (Cerita::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $original.'-'.$i++;
            }
        }

        // Handle background image upload if provided
        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/cerita/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/cerita/backgrounds/'.$filename);
        }

        // Optionally bind destinasi if provided (generic create path)
        if ($request->filled('pariwisata_id')) {
            $validated['pariwisata_id'] = (int) $request->input('pariwisata_id');
        } else {
            unset($validated['pariwisata_id']);
        }

        unset($validated['background_image']);
        $item = Cerita::create($validated);

        // After create, go back to the destinasi-specific list (or global list)
        if (!empty($validated['pariwisata_id'])) {
            return redirect()->route('cerita.by-pariwisata', $validated['pariwisata_id'])->with('success', 'Cerita dibuat.');
        }
        return redirect()->route('cerita.index')->with('success', 'Cerita dibuat.');
    }

    public function update(Request $request, Cerita $cerita)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:cerita,slug,'.$cerita->id,
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
        ]);

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/cerita/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/cerita/backgrounds/'.$filename);
        }
        unset($validated['background_image']);

        $cerita->update($validated);

        // After update (generic), prefer to go back to destinasi list when bound
        if ($cerita->pariwisata_id) {
            return redirect()->route('cerita.by-pariwisata', $cerita->pariwisata_id)->with('success', 'Cerita updated');
        }
        return redirect()->route('cerita.index')->with('success', 'Cerita updated');
    }

    public function create()
    {
        $pariwisataOptions = \App\Models\Pariwisata::orderBy('title')->get(['id','title','slug']);
        $defaultPariwisataId = request()->query('pariwisata_id');
        return Inertia::render('cerita/create', [
            'item' => null,
            'pariwisataOptions' => $pariwisataOptions,
            'defaultPariwisataId' => $defaultPariwisataId ? (int)$defaultPariwisataId : null,
        ]);
    }

    // New: Nested under pariwisata - prebind destinasi and hide selection in UI
    public function createForPariwisata(Pariwisata $pariwisata)
    {
        return Inertia::render('cerita/create', [
            'item' => null,
            'pariwisata' => $pariwisata->only(['id','title','slug']),
            'lockPariwisata' => true,
        ]);
    }

    public function storeForPariwisata(Request $request, Pariwisata $pariwisata)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cerita,slug',
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
            while (Cerita::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $original.'-'.$i++;
            }
        }

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/cerita/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/cerita/backgrounds/'.$filename);
        }

        $validated['pariwisata_id'] = $pariwisata->id;
        unset($validated['background_image']);
        $item = Cerita::create($validated);

    return redirect()->route('cerita.by-pariwisata', $pariwisata->id)->with('success', 'Cerita dibuat.');
    }

    public function edit(Cerita $cerita)
    {
        $cerita->load(['overlays']);
        $pariwisataOptions = \App\Models\Pariwisata::orderBy('title')->get(['id','title','slug']);
        return Inertia::render('cerita/edit', [
            'item' => $cerita,
            'overlays' => $cerita->overlays,
            'pariwisataOptions' => $pariwisataOptions,
        ]);
    }

    // Nested edit: lock destinasi context and show proper back link
    public function editForPariwisata(Pariwisata $pariwisata, Cerita $cerita)
    {
        $cerita->load(['overlays']);
        $pariwisataOptions = \App\Models\Pariwisata::orderBy('title')->get(['id','title','slug']);
        return Inertia::render('cerita/edit', [
            'item' => $cerita,
            'overlays' => $cerita->overlays,
            'pariwisataOptions' => $pariwisataOptions,
            'pariwisata' => $pariwisata->only(['id','title','slug']),
            'lockPariwisata' => true,
        ]);
    }

    public function uploadBackground(Request $request)
    {
        $request->validate([
            'image' => 'required|image'
        ]);

        $file = $request->file('image');
        $dir = public_path('uploads/cerita/backgrounds');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
        $file->move($dir, $filename);
        $url = asset('uploads/cerita/backgrounds/'.$filename);

        return response()->json(['url' => $url]);
    }

    // Nested update: after saving, go back to list of cerita for this destinasi
    public function updateForPariwisata(Request $request, Pariwisata $pariwisata, Cerita $cerita)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|unique:cerita,slug,'.$cerita->id,
            'content' => 'nullable|string',
            'background_url' => 'nullable|string|max:255',
            'background_image' => 'nullable|image',
            'cta_href' => 'nullable|string|max:255',
            'cta_label' => 'nullable|string|max:255',
            'align' => 'required|in:left,right',
        ]);

        if ($request->hasFile('background_image')) {
            $file = $request->file('background_image');
            $dir = public_path('uploads/cerita/backgrounds');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['background_url'] = asset('uploads/cerita/backgrounds/'.$filename);
        }
        unset($validated['background_image']);

        $cerita->update($validated);

        return redirect()->route('cerita.by-pariwisata', $pariwisata->id)->with('success', 'Cerita updated');
    }

    // Handle /pariwisata/{id}/cerita/edit without cerita id by redirecting appropriately
    public function redirectEdit(Request $request, Pariwisata $pariwisata)
    {
        $ceritaId = $request->query('cerita');
        if ($ceritaId) {
            return redirect()->route('cerita.edit-for-pariwisata', [$pariwisata->id, $ceritaId]);
        }
        return redirect()->route('cerita.by-pariwisata', $pariwisata->id);
    }

    public function storeOverlay(Request $request, Cerita $cerita)
    {
        // Mirror PariwisataController: require 'overlay' file, optional position/size
        $data = $request->validate([
            'overlay' => 'required|image',
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop',
            'width' => 'nullable|numeric|gt:0',
            'height' => 'nullable|numeric|gt:0',
        ]);

        $file = $request->file('overlay');
        $dir = public_path('uploads/cerita/overlays');
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $ext = $file->getClientOriginalExtension();
        $filename = now()->format('Ymd_His') . '_' . Str::random(8) . '.' . $ext;
        $file->move($dir, $filename);
        $publicUrl = asset('uploads/cerita/overlays/' . $filename);

        CeritaOverlays::create([
            'cerita_id' => $cerita->id,
            'overlay_url' => $publicUrl,
            'position_horizontal' => $data['position_horizontal'] ?? 'center',
            'position_vertical' => $data['position_vertical'] ?? 'top',
            'object_fit' => $data['object_fit'] ?? 'contain',
            'width' => $data['width'] ?? null,
            'height' => $data['height'] ?? null,
        ]);

        $cerita->refresh();
        if ($cerita->pariwisata_id) {
            return redirect()->route('cerita.edit-for-pariwisata', [$cerita->pariwisata_id, $cerita->id])->with('success', 'Overlay added');
        }
        return redirect()->route('cerita.edit', $cerita->id)->with('success', 'Overlay added');
    }

    public function updateOverlay(Request $request, CeritaOverlays $overlay)
    {
        $validated = $request->validate([
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop',
            'width' => 'nullable|numeric|gt:0',
            'height' => 'nullable|numeric|gt:0',
        ]);

        $overlay->update($validated);

        $overlay->refresh();
        $cerita = Cerita::find($overlay->cerita_id);
        if ($cerita && $cerita->pariwisata_id) {
            return redirect()->route('cerita.edit-for-pariwisata', [$cerita->pariwisata_id, $cerita->id])->with('success', 'Overlay updated');
        }
        return redirect()->route('cerita.edit', $overlay->cerita_id)->with('success', 'Overlay updated');
    }

    public function deleteOverlay(CeritaOverlays $overlay)
    {
        $ceritaId = $overlay->cerita_id;
        $this->deleteFileIfExists($overlay->overlay_url);
        $overlay->delete();
        $cerita = Cerita::find($ceritaId);
        if ($cerita && $cerita->pariwisata_id) {
            return redirect()->route('cerita.edit-for-pariwisata', [$cerita->pariwisata_id, $cerita->id])->with('success', 'Overlay deleted');
        }
        return redirect()->route('cerita.edit', $ceritaId)->with('success', 'Overlay deleted');
    }

    public function destroy(Cerita $cerita)
    {
        $this->deleteFileIfExists($cerita->background_url);
        foreach ($cerita->overlays as $ov) {
            $this->deleteFileIfExists($ov->overlay_url);
        }
        CeritaOverlays::where('cerita_id', $cerita->id)->delete();
        $cerita->delete();
        return redirect()->route('cerita.index')->with('success', 'Cerita deleted');
    }

    public function deleteMultiple(Request $request)
    {
        $ids = $request->input('ids', []);
        $items = Cerita::whereIn('id', $ids)->get();
        foreach ($items as $item) {
            $this->deleteFileIfExists($item->background_url);
            foreach ($item->overlays as $ov) {
                $this->deleteFileIfExists($ov->overlay_url);
            }
            CeritaOverlays::where('cerita_id', $item->id)->delete();
            $item->delete();
        }
        return redirect()->route('cerita.index')->with('success', 'Selected cerita deleted');
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
