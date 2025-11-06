<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreferenceDestinationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PreferenceDestinationTypeController extends Controller
{
    public function index()
    {
        $data = PreferenceDestinationType::latest()->get();

        return Inertia::render('preferences/destination-type/view', [
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'icon' => 'nullable|string|max:64',
            'title' => 'required|string|max:100',
        ]);

        DB::beginTransaction();

        try {
            PreferenceDestinationType::create([
                'icon' => $request->icon,
                'title' => $request->title,
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Destination type created successfully');
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
                $data = PreferenceDestinationType::find($res['id']);
                if ($data) {
                    $data->delete();
                }
            }
            DB::commit();
            return redirect()->back()->with('success', 'Destination types deleted successfully');

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
            PreferenceDestinationType::findOrFail($request->id)->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Destination type deleted successfully');
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
        ]);

        DB::beginTransaction();

        try {
            $item = PreferenceDestinationType::findOrFail($request->id);
            $item->icon = $request->icon;
            $item->title = $request->title;
            $item->save();

            DB::commit();

            return redirect()->back()->with('success', 'Destination type updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            throw ValidationException::withMessages([
                'error' => 'Internal Server Error',
            ]);
        }
    }
}
