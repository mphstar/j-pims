<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preference_values', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['activity', 'price', 'season', 'label']);
            $table->string('key')->index(); // canonical key used in personalization (e.g., easy, moderate, all-year)
            $table->string('label'); // human-readable label for admin/frontend
            $table->unsignedInteger('sort')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['type', 'key']);
        });

        Schema::create('pariwisata_preference_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pariwisata_id')->constrained('pariwisata')->onDelete('cascade');
            $table->foreignId('preference_value_id')->constrained('preference_values')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['pariwisata_id', 'preference_value_id']);
        });

        Schema::create('pariwisata_product_preference_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('pariwisata_products')->onDelete('cascade');
            $table->foreignId('preference_value_id')->constrained('preference_values')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['product_id', 'preference_value_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pariwisata_product_preference_values');
        Schema::dropIfExists('pariwisata_preference_values');
        Schema::dropIfExists('preference_values');
    }
};
