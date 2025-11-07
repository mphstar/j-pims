<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PreferenceActivityLevel;
use App\Models\PreferencePriceRange;
use App\Models\PreferenceVisitTime;
use App\Models\PreferenceDestinationType;
use Illuminate\Http\Request;

class PreferenceController extends Controller
{
    /**
     * Get all activity levels
     */
    public function activityLevels()
    {
        $data = PreferenceActivityLevel::orderBy('title')->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get all price ranges
     */
    public function priceRanges()
    {
        $data = PreferencePriceRange::orderBy('title')->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get all visit times
     */
    public function visitTimes()
    {
        $data = PreferenceVisitTime::orderBy('title')->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get all destination types
     */
    public function destinationTypes()
    {
        $data = PreferenceDestinationType::orderBy('title')->get();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get all preferences (combined)
     */
    public function all()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'activity_levels' => PreferenceActivityLevel::orderBy('title')->get(),
                'price_ranges' => PreferencePriceRange::orderBy('title')->get(),
                'visit_times' => PreferenceVisitTime::orderBy('title')->get(),
                'destination_types' => PreferenceDestinationType::orderBy('title')->get(),
            ],
        ]);
    }
}
