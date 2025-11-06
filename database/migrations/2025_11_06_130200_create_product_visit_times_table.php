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
        Schema::create('product_visit_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('pariwisata_products')->cascadeOnDelete();
            $table->foreignId('preference_visit_time_id')->constrained('preference_visit_times')->cascadeOnDelete();
            $table->timestamps();
            
            $table->unique(['product_id', 'preference_visit_time_id'], 'product_visit_time_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_visit_times');
    }
};
