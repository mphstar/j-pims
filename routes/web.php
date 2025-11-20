<?php

use App\Http\Controllers\Admin\PariwisataController;
use App\Http\Controllers\Admin\PariwisataProductController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\PreferenceValueController;
use App\Http\Controllers\Admin\PreferenceActivityLevelController;
use App\Http\Controllers\Admin\PreferencePriceRangeController;
use App\Http\Controllers\Admin\PreferenceVisitTimeController;
use App\Http\Controllers\Admin\PreferenceDestinationTypeController;
use App\Http\Controllers\Admin\TahunAkademikController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Api\PariwisataApiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return redirect()->route('frontend.index');
// })->name('home');

// Frontend Routes (Public)
Route::get('/', [FrontendController::class, 'index'])->name('home');
Route::get('/auto-play', [FrontendController::class, 'autoPlay'])->name('home.auto-play');
Route::get('/search', [SearchController::class, 'index'])->name('search');
// Cerita per destinasi (frontend)
Route::get('/{slug}/cerita', [FrontendController::class, 'cerita'])->name('frontend.cerita');
Route::get('/destinasi/{slug}/produk', [FrontendController::class, 'products'])->name('frontend.destination.products');
Route::get('/destinasi/{slug}/produk/{product}', [FrontendController::class, 'product'])->name('frontend.product.view');
// SEO friendly product page by destination slug
Route::get('/{slug}/product', [FrontendController::class, 'productBySlug'])->name('frontend.product.by-slug');
// Route::get('/view/{slug}', [FrontendController::class, 'show'])->name('frontend.show');

// Admin Routes
Route::get('/admin', function () {
    return redirect()->route('login');
})->name('admin.home');

// API Routes (Public)
Route::prefix('api')->group(function () {
    Route::get('/pariwisata', [PariwisataApiController::class, 'index'])->name('api.pariwisata.index');
    Route::get('/pariwisata/{slug}', [PariwisataApiController::class, 'show'])->name('api.pariwisata.show');
});

Route::get('/glitchtip/error', function () {
    throw new Exception('My first GlitchTip error!');
});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/stats', [DashboardController::class, 'getStats'])->name('dashboard.stats');


    Route::prefix('user')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('user.index');
        Route::post('store', [UserController::class, 'store'])->name('user.store');
        Route::post('delete-multiple', [UserController::class, 'deleteMultiple'])->name('user.delete-multiple');
        Route::post('delete', [UserController::class, 'delete'])->name('user.delete');
        Route::post('update', [UserController::class, 'update'])->name('user.update');
    });

    Route::prefix('pariwisata')->group(function () {
        Route::get('/', [PariwisataController::class, 'index'])->name('pariwisata.index');
        Route::get('create', [PariwisataController::class, 'create'])->name('pariwisata.create');
        Route::post('store', [PariwisataController::class, 'store'])->name('pariwisata.store');
        Route::get('edit/{pariwisata}', [PariwisataController::class, 'edit'])->name('pariwisata.edit');
        Route::post('update/{pariwisata}', [PariwisataController::class, 'update'])->name('pariwisata.update');
    Route::post('delete/{pariwisata}', [PariwisataController::class, 'destroy'])->name('pariwisata.destroy');
        Route::post('delete-multiple', [PariwisataController::class, 'deleteMultiple'])->name('pariwisata.delete-multiple');
        Route::post('upload-background', [PariwisataController::class, 'uploadBackground'])->name('pariwisata.upload-background');

        // Overlays
        Route::post('{pariwisata}/overlays', [PariwisataController::class, 'storeOverlay'])->name('pariwisata.overlays.store');
        Route::post('overlays/{overlay}', [PariwisataController::class, 'updateOverlay'])->name('pariwisata.overlays.update');
        Route::post('overlays/{overlay}/delete', [PariwisataController::class, 'deleteOverlay'])->name('pariwisata.overlays.delete');

        // Cerita management shortcut per destinasi (Admin)
        Route::get('{pariwisata}/cerita', [\App\Http\Controllers\Admin\CeritaController::class, 'byPariwisata'])->name('cerita.by-pariwisata');
        Route::get('{pariwisata}/cerita/create', [\App\Http\Controllers\Admin\CeritaController::class, 'createForPariwisata'])->name('cerita.create-for-pariwisata');
        Route::post('{pariwisata}/cerita', [\App\Http\Controllers\Admin\CeritaController::class, 'storeForPariwisata'])->name('cerita.store-for-pariwisata');
    // Nested edit/update
    Route::get('{pariwisata}/cerita/edit/{cerita}', [\App\Http\Controllers\Admin\CeritaController::class, 'editForPariwisata'])->name('cerita.edit-for-pariwisata');
    Route::post('{pariwisata}/cerita/update/{cerita}', [\App\Http\Controllers\Admin\CeritaController::class, 'updateForPariwisata'])->name('cerita.update-for-pariwisata');
    // Optional convenience: /pariwisata/{id}/cerita/edit?cerita=123 → redirect to nested edit or list
    Route::get('{pariwisata}/cerita/edit', [\App\Http\Controllers\Admin\CeritaController::class, 'redirectEdit'])->name('cerita.redirect-edit');
    });

    // Cerita (Admin)
    Route::prefix('cerita')->group(function () {
        // Route::get('/', [\App\Http\Controllers\Admin\CeritaController::class, 'index'])->name('cerita.index');
        // Generic create/store kept for backward compatibility; prefer nested routes under pariwisata
        Route::get('create', [\App\Http\Controllers\Admin\CeritaController::class, 'create'])->name('cerita.create');
        Route::post('store', [\App\Http\Controllers\Admin\CeritaController::class, 'store'])->name('cerita.store');
        Route::get('edit/{cerita}', [\App\Http\Controllers\Admin\CeritaController::class, 'edit'])->name('cerita.edit');
        Route::post('update/{cerita}', [\App\Http\Controllers\Admin\CeritaController::class, 'update'])->name('cerita.update');
        Route::post('delete/{cerita}', [\App\Http\Controllers\Admin\CeritaController::class, 'destroy'])->name('cerita.destroy');
        Route::post('delete-multiple', [\App\Http\Controllers\Admin\CeritaController::class, 'deleteMultiple'])->name('cerita.delete-multiple');
        Route::post('upload-background', [\App\Http\Controllers\Admin\CeritaController::class, 'uploadBackground'])->name('cerita.upload-background');

        // Overlays
        Route::post('{cerita}/overlays', [\App\Http\Controllers\Admin\CeritaController::class, 'storeOverlay'])->name('cerita.overlays.store');
        Route::post('overlays/{overlay}', [\App\Http\Controllers\Admin\CeritaController::class, 'updateOverlay'])->name('cerita.overlays.update');
        Route::post('overlays/{overlay}/delete', [\App\Http\Controllers\Admin\CeritaController::class, 'deleteOverlay'])->name('cerita.overlays.delete');
    });


    // Products (Admin)
    Route::prefix('products')->group(function () {
        Route::get('/', [PariwisataProductController::class, 'index'])->name('product.index');
        Route::get('create', [PariwisataProductController::class, 'create'])->name('product.create');
        Route::post('store', [PariwisataProductController::class, 'store'])->name('product.store');
        Route::get('edit/{product}', [PariwisataProductController::class, 'edit'])->name('product.edit');
        Route::post('update/{product}', [PariwisataProductController::class, 'update'])->name('product.update');
        Route::post('delete/{product}', [PariwisataProductController::class, 'destroy'])->name('product.destroy');
        Route::post('delete-multiple', [PariwisataProductController::class, 'deleteMultiple'])->name('product.delete-multiple');
        Route::post('upload-background', [PariwisataProductController::class, 'uploadBackground'])->name('product.upload-background');
        // Overlays for products
        Route::post('{product}/overlays', [PariwisataProductController::class, 'storeOverlay'])->name('product.overlays.store');
        Route::post('overlays/{overlay}', [PariwisataProductController::class, 'updateOverlay'])->name('product.overlays.update');
        Route::post('overlays/{overlay}/delete', [PariwisataProductController::class, 'deleteOverlay'])->name('product.overlays.delete');
    });

    // Access from pariwisata action: /pariwisata/{pariwisata}/product
    Route::get('pariwisata/{pariwisata}/product', [PariwisataProductController::class, 'indexByPariwisata'])->name('product.by-pariwisata');
    // Nested create page bound to a specific destinasi: /pariwisata/{pariwisata}/product/create
    Route::get('pariwisata/{pariwisata}/product/create', [PariwisataProductController::class, 'createForPariwisata'])->name('product.create-for-pariwisata');
    // Nested edit page: /pariwisata/{pariwisata}/product/{product}/edit
    Route::get('pariwisata/{pariwisata}/product/{product}/edit', [PariwisataProductController::class, 'editForPariwisata'])->name('product.edit-for-pariwisata');

    Route::prefix('settings')->group(function () {
        Route::post('update', [SettingController::class, 'update'])->name('settings.update');
        Route::get('/', [SettingController::class, 'getSettings'])->name('settings.get');
    });

    // Preference Activity Levels (Admin)
    Route::prefix('preference-activity-levels')->group(function () {
        Route::get('/', [PreferenceActivityLevelController::class, 'index'])->name('preference-activity-levels.index');
        Route::post('store', [PreferenceActivityLevelController::class, 'store'])->name('preference-activity-levels.store');
        Route::post('delete-multiple', [PreferenceActivityLevelController::class, 'deleteMultiple'])->name('preference-activity-levels.delete-multiple');
        Route::post('delete', [PreferenceActivityLevelController::class, 'delete'])->name('preference-activity-levels.delete');
        Route::post('update', [PreferenceActivityLevelController::class, 'update'])->name('preference-activity-levels.update');
    });

    // Preference Price Ranges (Admin)
    Route::prefix('preference-price-ranges')->group(function () {
        Route::get('/', [PreferencePriceRangeController::class, 'index'])->name('preference-price-ranges.index');
        Route::post('store', [PreferencePriceRangeController::class, 'store'])->name('preference-price-ranges.store');
        Route::post('delete-multiple', [PreferencePriceRangeController::class, 'deleteMultiple'])->name('preference-price-ranges.delete-multiple');
        Route::post('delete', [PreferencePriceRangeController::class, 'delete'])->name('preference-price-ranges.delete');
        Route::post('update', [PreferencePriceRangeController::class, 'update'])->name('preference-price-ranges.update');
    });

    // Preference Visit Times (Admin)
    Route::prefix('preference-visit-times')->group(function () {
        Route::get('/', [PreferenceVisitTimeController::class, 'index'])->name('preference-visit-times.index');
        Route::post('store', [PreferenceVisitTimeController::class, 'store'])->name('preference-visit-times.store');
        Route::post('delete-multiple', [PreferenceVisitTimeController::class, 'deleteMultiple'])->name('preference-visit-times.delete-multiple');
        Route::post('delete', [PreferenceVisitTimeController::class, 'delete'])->name('preference-visit-times.delete');
        Route::post('update', [PreferenceVisitTimeController::class, 'update'])->name('preference-visit-times.update');
    });

    // Preference Destination Types (Admin)
    Route::prefix('preference-destination-types')->group(function () {
        Route::get('/', [PreferenceDestinationTypeController::class, 'index'])->name('preference-destination-types.index');
        Route::post('store', [PreferenceDestinationTypeController::class, 'store'])->name('preference-destination-types.store');
        Route::post('delete-multiple', [PreferenceDestinationTypeController::class, 'deleteMultiple'])->name('preference-destination-types.delete-multiple');
        Route::post('delete', [PreferenceDestinationTypeController::class, 'delete'])->name('preference-destination-types.delete');
        Route::post('update', [PreferenceDestinationTypeController::class, 'update'])->name('preference-destination-types.update');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
