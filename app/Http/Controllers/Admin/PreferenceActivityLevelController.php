<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreferenceActivityLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PreferenceActivityLevelController extends Controller
{
    public function index()
    {
        $data = PreferenceActivityLevel::latest()->get();

        return Inertia::render('preferences/activity-level/view', [
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'icon' => 'nullable|string|max:64',
            'title' => 'required|string|max:100',
            'subtitle' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            PreferenceActivityLevel::create([
                'icon' => $request->icon,
                'title' => $request->title,
                'subtitle' => $request->subtitle,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Activity level created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }

    public function deleteMultiple(Request $request)
    {
        $request->validate([
            'data' => 'required',
        ], []);

        DB::beginTransaction();

        try {
            foreach ($request->data as $res) {
                $data = PreferenceActivityLevel::find($res['id']);
                if ($data) {
                    $data->delete();
                }
            }
            DB::commit();
            return redirect()->back()->with('success', 'Activity levels deleted successfully');

        } catch (\Throwable $th) {
            DB::rollBack();

            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }

    public function delete(Request $request)
    {
        DB::beginTransaction();

        try {
            PreferenceActivityLevel::findOrFail($request->id)->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Activity level deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }

    public function update(Request $request)
    {
        $request->validate([
            'icon' => 'nullable|string|max:64',
            'title' => 'required|string|max:100',
            'subtitle' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();

        try {
            $item = PreferenceActivityLevel::findOrFail($request->id);
            $item->icon = $request->icon;
            $item->title = $request->title;
            $item->subtitle = $request->subtitle;
            $item->save();

            DB::commit();

            return redirect()->back()->with('success', 'Activity level updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }
}
