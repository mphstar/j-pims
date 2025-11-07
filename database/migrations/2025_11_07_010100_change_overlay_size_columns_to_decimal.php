<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL to avoid doctrine/dbal dependency for change()
        DB::statement('ALTER TABLE pariwisata_overlays MODIFY COLUMN width DECIMAL(8,2) NULL');
        DB::statement('ALTER TABLE pariwisata_overlays MODIFY COLUMN height DECIMAL(8,2) NULL');
        DB::statement('ALTER TABLE cerita_overlays MODIFY COLUMN width DECIMAL(8,2) NULL');
        DB::statement('ALTER TABLE cerita_overlays MODIFY COLUMN height DECIMAL(8,2) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to INTEGER
        DB::statement('ALTER TABLE pariwisata_overlays MODIFY COLUMN width INT NULL');
        DB::statement('ALTER TABLE pariwisata_overlays MODIFY COLUMN height INT NULL');
        DB::statement('ALTER TABLE cerita_overlays MODIFY COLUMN width INT NULL');
        DB::statement('ALTER TABLE cerita_overlays MODIFY COLUMN height INT NULL');
    }
};
