<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            // Add width and height for overlay size control
            $table->integer('width')->nullable()->after('object_fit');
            $table->integer('height')->nullable()->after('width');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            $table->dropColumn(['width', 'height']);
        });
    }
};
