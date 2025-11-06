<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PreferencePriceRangeSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['icon' => '💸', 'title' => 'Hemat', 'subtitle' => 'Budget friendly'],
            ['icon' => '💰', 'title' => 'Sedang', 'subtitle' => 'Mid-range'],
            ['icon' => '💎', 'title' => 'Premium', 'subtitle' => 'High-end experience'],
        ];

        foreach ($rows as $row) {
            DB::table('preference_price_ranges')->updateOrInsert(
                ['title' => $row['title']],
                $row
            );
        }
    }
}
