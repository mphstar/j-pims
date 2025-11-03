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
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->after('pariwisata_id')
                ->constrained('pariwisata_products')->onDelete('cascade');
            $table->index(['pariwisata_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pariwisata_overlays', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
            $table->dropIndex(['pariwisata_id', 'product_id']);
        });
    }
};
