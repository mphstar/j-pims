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
        Schema::create('pariwisata_preference_destination_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pariwisata_id')->constrained('pariwisata')->onDelete('cascade');
            $table->unsignedBigInteger('preference_destination_type_id');
            $table->timestamps();

            // Prevent duplicate entries
            $table->unique(['pariwisata_id', 'preference_destination_type_id'], 'pariwisata_dest_type_unique');
            
            // Foreign key with custom short name
            $table->foreign('preference_destination_type_id', 'pref_dest_type_fk')
                  ->references('id')
                  ->on('preference_destination_types')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pariwisata_preference_destination_types');
    }
};
