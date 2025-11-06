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
        Schema::create('product_price_ranges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('pariwisata_products')->cascadeOnDelete();
            $table->foreignId('preference_price_range_id')->constrained('preference_price_ranges')->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['product_id', 'preference_price_range_id'], 'product_price_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_price_ranges');
    }
};
