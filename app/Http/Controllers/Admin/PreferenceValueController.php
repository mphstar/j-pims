<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreferenceValue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PreferenceValueController extends Controller
{
    public function index()
    {
        $data = PreferenceValue::orderBy('type')->orderBy('sort')->get();
        return Inertia::render('preferences/view', [
            'data' => $data,
        ]);
    }

    public function create()
    {
        return Inertia::render('preferences/create', [
            'item' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:activity,price,season,label',
            'key' => 'required|string|max:100',
            'label' => 'required|string|max:150',
            'sort' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
        ]);
        $validated['active'] = (bool)($validated['active'] ?? true);
        $validated['sort'] = $validated['sort'] ?? 0;
        PreferenceValue::create($validated);
        return redirect()->route('preferences.index')->with('success', 'Preference created');
    }

    public function edit(PreferenceValue $preference)
    {
        return Inertia::render('preferences/edit', [
            'item' => $preference,
        ]);
    }

    public function update(Request $request, PreferenceValue $preference)
    {
        $validated = $request->validate([
            'type' => 'required|in:activity,price,season,label',
            'key' => 'required|string|max:100',
            'label' => 'required|string|max:150',
            'sort' => 'nullable|integer|min:0',
            'active' => 'nullable|boolean',
        ]);
        $validated['active'] = (bool)($validated['active'] ?? false);
        $preference->update($validated);
        return redirect()->route('preferences.index')->with('success', 'Preference updated');
    }

    public function destroy(PreferenceValue $preference)
    {
        $preference->delete();
        return redirect()->route('preferences.index')->with('success', 'Preference deleted');
    }
}
