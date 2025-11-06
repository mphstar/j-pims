<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferenceVisitTimeSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['icon' => '🌅', 'title' => 'Pagi', 'subtitle' => '06:00 - 10:00'],
            ['icon' => '🌤️', 'title' => 'Siang', 'subtitle' => '10:00 - 14:00'],
            ['icon' => '🌇', 'title' => 'Sore', 'subtitle' => '14:00 - 18:00'],
            ['icon' => '🌃', 'title' => 'Malam', 'subtitle' => '18:00 - 22:00'],
        ];

        foreach ($rows as $row) {
            DB::table('preference_visit_times')->updateOrInsert(
                ['title' => $row['title']],
                $row
            );
        }
    }
}
