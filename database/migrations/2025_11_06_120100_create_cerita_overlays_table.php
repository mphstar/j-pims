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
        Schema::create('cerita_overlays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cerita_id')->constrained('cerita')->cascadeOnDelete();
            $table->string('overlay_url');
            $table->enum('position_horizontal', ['left', 'center', 'right'])->nullable();
            $table->enum('position_vertical', ['top', 'center', 'bottom'])->nullable();
            $table->enum('object_fit', ['contain', 'cover', 'fill', 'none', 'scale-down', 'crop'])->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cerita_overlays');
    }
};
