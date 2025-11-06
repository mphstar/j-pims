<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferenceActivityLevelSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['icon' => '🛌', 'title' => 'Santai', 'subtitle' => 'Aktivitas ringan, santai'],
            ['icon' => '🚶', 'title' => 'Sedang', 'subtitle' => 'Jalan santai, aktivitas moderat'],
            ['icon' => '⛰️', 'title' => 'Aktif', 'subtitle' => 'Trekking, aktivitas intens'],
        ];

        foreach ($rows as $row) {
            DB::table('preference_activity_levels')->updateOrInsert(
                ['title' => $row['title']],
                $row
            );
        }
    }
}
