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
        Schema::table('cerita', function (Blueprint $table) {
            if (!Schema::hasColumn('cerita', 'pariwisata_id')) {
                $table->foreignId('pariwisata_id')->nullable()->constrained('pariwisata')->cascadeOnDelete()->after('id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cerita', function (Blueprint $table) {
            if (Schema::hasColumn('cerita', 'pariwisata_id')) {
                $table->dropConstrainedForeignId('pariwisata_id');
            }
        });
    }
};
