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
        Schema::create('product_activity_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('pariwisata_products')->cascadeOnDelete();
            $table->foreignId('preference_activity_level_id')->constrained('preference_activity_levels')->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['product_id', 'preference_activity_level_id'], 'product_activity_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_activity_levels');
    }
};
