<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Bintang',
            'email' => 'bintang@gmail.com',
            'password' => bcrypt('12345678'),
        ]);
        
        $this->call([
            SettingSeeder::class,
            // Seed preference dictionaries first so downstream seeders can attach relations
            PreferenceActivityLevelSeeder::class,
            PreferencePriceRangeSeeder::class,
            PreferenceVisitTimeSeeder::class,
            PreferenceDestinationTypeSeeder::class,
            // Then seed destinations/products which will attach the above preferences
            PariwisataSeeder::class,
            // Finally seed cerita that reference the destinations
            CeritaSeeder::class,
        ]);
    }
}
