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
        Schema::create('pariwisata_metadata', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pariwisata_id')->constrained('pariwisata')->onDelete('cascade');
            
            // Activity level: easy, moderate, challenging
            $table->enum('activity_level', ['easy', 'moderate', 'challenging'])->nullable();
            
            // Price range: budget, moderate, expensive, luxury
            $table->enum('price_range', ['budget', 'moderate', 'expensive', 'luxury'])->nullable();
            
            // Best time to visit (season/months)
            $table->string('best_season')->nullable(); // e.g., "Mei-Oktober", "Musim Kemarau"
            
            // Tags/Keywords for better matching (JSON array)
            $table->json('tags')->nullable(); // e.g., ["pantai", "sunset", "fotografi", "keluarga"]
            
            // Ideal visit duration in hours
            $table->decimal('duration_hours', 5, 2)->nullable(); // e.g., 2.5, 4.0
            
            // Target age group (JSON array)
            $table->json('target_age_group')->nullable(); // e.g., ["children", "adults", "elderly"]
            
            // Popularity metrics
            $table->unsignedInteger('view_count')->default(0);
            $table->unsignedInteger('visit_count')->default(0);
            
            $table->timestamps();
            
            // Ensure one metadata per pariwisata
            $table->unique('pariwisata_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pariwisata_metadata');
    }
};
