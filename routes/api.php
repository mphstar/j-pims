<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PariwisataController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\WisataController;
use App\Http\Controllers\Api\PreferenceController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\MetadataOptionsController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// ===== Wisata API (New Comprehensive API) =====
// Pariwisata/Destinations
Route::get('/wisata', [WisataController::class, 'index']);
// Route::get('/wisata/{slug}', [WisataController::class, 'show']);

// ===== Search API =====
Route::get('/search', [SearchController::class, 'search']);
Route::get('/search/recommendations', [SearchController::class, 'recommendations']);

// ===== Preference API =====
Route::prefix('preferences')->group(function () {
    Route::get('/activity-levels', [PreferenceController::class, 'activityLevels']);
    Route::get('/price-ranges', [PreferenceController::class, 'priceRanges']);
    Route::get('/visit-times', [PreferenceController::class, 'visitTimes']);
    Route::get('/destination-types', [PreferenceController::class, 'destinationTypes']);
    Route::get('/all', [PreferenceController::class, 'all']);
});


// ===== Legacy API (Backward Compatibility) =====
// New Destinations API (nested products)
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{slug}', [DestinationController::class, 'show']);

// Setting API
Route::get('/setting', [SettingController::class, 'index']);
Route::match(['post', 'put', 'patch'], '/setting', [SettingController::class, 'update'])->middleware('auth:sanctum');

// Pariwisata API
Route::get('/pariwisata', [PariwisataController::class, 'index']);
Route::get('/pariwisata/{slug}', [PariwisataController::class, 'show']);

// ===== Visitor Log API =====
Route::post('/visitor-log', [\App\Http\Controllers\Api\VisitorLogController::class, 'log']);
