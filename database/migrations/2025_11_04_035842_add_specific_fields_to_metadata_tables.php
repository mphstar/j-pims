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
        // Add specific fields to pariwisata_metadata (Destinasi)
        Schema::table('pariwisata_metadata', function (Blueprint $table) {
            if (!Schema::hasColumn('pariwisata_metadata', 'facilities')) {
                $table->json('facilities')->nullable()->after('target_age_group'); // e.g., ["parking", "toilet", "restaurant", "wifi"]
            }
            if (!Schema::hasColumn('pariwisata_metadata', 'accessibility')) {
                $table->enum('accessibility', ['wheelchair_friendly', 'child_friendly', 'elderly_friendly', 'all_accessible'])->nullable()->after('facilities');
            }
        });

        // Add specific fields to pariwisata_products_metadata (Paket/Aktivitas)
        Schema::table('pariwisata_products_metadata', function (Blueprint $table) {
            if (!Schema::hasColumn('pariwisata_products_metadata', 'includes')) {
                $table->json('includes')->nullable()->after('target_age_group'); // e.g., ["guide", "equipment", "meal", "insurance"]
            }
            if (!Schema::hasColumn('pariwisata_products_metadata', 'requirements')) {
                $table->json('requirements')->nullable()->after('includes'); // e.g., ["swimming_skill", "fitness_level"]
            }
            if (!Schema::hasColumn('pariwisata_products_metadata', 'group_size')) {
                $table->json('group_size')->nullable()->after('requirements'); // e.g., {"min": 2, "max": 10}
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pariwisata_metadata', function (Blueprint $table) {
            if (Schema::hasColumn('pariwisata_metadata', 'facilities')) {
                $table->dropColumn('facilities');
            }
            if (Schema::hasColumn('pariwisata_metadata', 'accessibility')) {
                $table->dropColumn('accessibility');
            }
        });

        Schema::table('pariwisata_products_metadata', function (Blueprint $table) {
            if (Schema::hasColumn('pariwisata_products_metadata', 'includes')) {
                $table->dropColumn('includes');
            }
            if (Schema::hasColumn('pariwisata_products_metadata', 'requirements')) {
                $table->dropColumn('requirements');
            }
            if (Schema::hasColumn('pariwisata_products_metadata', 'group_size')) {
                $table->dropColumn('group_size');
            }
        });
    }
};
