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
        Schema::create('pariwisata_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pariwisata_id')->constrained('pariwisata')->onDelete('cascade');
            $table->string('title');
            $table->string('label')->nullable();
            $table->string('subtitle')->nullable();
            $table->string('slug')->unique();
            $table->text('content')->nullable();
            $table->string('background_url')->nullable();
            $table->string('cta_href')->nullable();
            $table->string('cta_label')->nullable();
            $table->enum('align', ['left', 'right'])->default('left');
            $table->timestamps();

            $table->index('pariwisata_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pariwisata_products');
    }
};
