<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cerita;
use App\Models\CeritaOverlays;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CeritaController extends Controller
{
    public function index()
    {
        $items = Cerita::with('overlays')->orderBy('created_at', 'desc')->get();
        return Inertia::render('cerita/view', [
            'items' => $items,
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

        unset($validated['background_image']);
        $item = Cerita::create($validated);

        return redirect()->route('cerita.edit', $item->id)->with('success', 'Cerita created. Silakan lanjut menambah overlay.');
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

        return redirect()->route('cerita.index')->with('success', 'Cerita updated');
    }

    public function create()
    {
        return Inertia::render('cerita/create', [
            'item' => null,
        ]);
    }

    public function edit(Cerita $cerita)
    {
        $cerita->load(['overlays']);
        
        return Inertia::render('cerita/edit', [
            'item' => $cerita,
            'overlays' => $cerita->overlays,
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

    public function storeOverlay(Request $request, Cerita $cerita)
    {
        $validated = $request->validate([
            'overlay_url' => 'required|string|max:255',
            'overlay_image' => 'nullable|image',
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop',
            'width' => 'nullable|integer|min:1',
            'height' => 'nullable|integer|min:1',
        ]);

        if ($request->hasFile('overlay_image')) {
            $file = $request->file('overlay_image');
            $dir = public_path('uploads/cerita/overlays');
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext = $file->getClientOriginalExtension();
            $filename = now()->format('Ymd_His').'_'.Str::random(8).'.'.$ext;
            $file->move($dir, $filename);
            $validated['overlay_url'] = asset('uploads/cerita/overlays/'.$filename);
        }
        unset($validated['overlay_image']);

        $validated['cerita_id'] = $cerita->id;
        CeritaOverlays::create($validated);

        return redirect()->route('cerita.edit', $cerita->id)->with('success', 'Overlay added');
    }

    public function updateOverlay(Request $request, CeritaOverlays $overlay)
    {
        $validated = $request->validate([
            'position_horizontal' => 'nullable|in:left,center,right',
            'position_vertical' => 'nullable|in:top,center,bottom',
            'object_fit' => 'nullable|in:contain,cover,fill,none,scale-down,crop',
            'width' => 'nullable|integer|min:1',
            'height' => 'nullable|integer|min:1',
        ]);

        $overlay->update($validated);

        return redirect()->route('cerita.edit', $overlay->cerita_id)->with('success', 'Overlay updated');
    }

    public function deleteOverlay(CeritaOverlays $overlay)
    {
        $ceritaId = $overlay->cerita_id;
        $this->deleteFileIfExists($overlay->overlay_url);
        $overlay->delete();
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
