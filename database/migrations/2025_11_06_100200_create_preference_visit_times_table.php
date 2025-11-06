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
        Schema::create('preference_visit_times', function (Blueprint $table) {
            $table->id();
            $table->string('icon', 64)->nullable(); // emoji/icon
            $table->string('title', 100);
            $table->string('subtitle', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preference_visit_times');
    }
};
