<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreferenceVisitTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PreferenceVisitTimeController extends Controller
{
    public function index()
    {
        $data = PreferenceVisitTime::latest()->get();

        return Inertia::render('preferences/visit-time/view', [
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
            PreferenceVisitTime::create([
                'icon' => $request->icon,
                'title' => $request->title,
                'subtitle' => $request->subtitle,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Visit time created successfully');
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
                $data = PreferenceVisitTime::find($res['id']);
                if ($data) {
                    $data->delete();
                }
            }
            DB::commit();
            return redirect()->back()->with('success', 'Visit times deleted successfully');

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
            PreferenceVisitTime::findOrFail($request->id)->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Visit time deleted successfully');
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
            $item = PreferenceVisitTime::findOrFail($request->id);
            $item->icon = $request->icon;
            $item->title = $request->title;
            $item->subtitle = $request->subtitle;
            $item->save();

            DB::commit();

            return redirect()->back()->with('success', 'Visit time updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }
}
