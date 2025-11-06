<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferenceDestinationTypeSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['icon' => '🏖️', 'title' => 'Pantai'],
            ['icon' => '⛰️', 'title' => 'Gunung'],
            ['icon' => '🏛️', 'title' => 'Budaya & Sejarah'],
            ['icon' => '🌳', 'title' => 'Alam & Hutan'],
            ['icon' => '🏙️', 'title' => 'Kota'],
            ['icon' => '🎢', 'title' => 'Taman Hiburan'],
        ];

        foreach ($rows as $row) {
            DB::table('preference_destination_types')->updateOrInsert(
                ['title' => $row['title']],
                $row
            );
        }
    }
}
