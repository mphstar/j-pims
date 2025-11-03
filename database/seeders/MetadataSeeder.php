<?php

namespace Database\Seeders;

use App\Models\Pariwisata;
use App\Models\PariwisataProduct;
use App\Models\PariwisataMetadata;
use App\Models\PariwisataProductMetadata;
use Illuminate\Database\Seeder;

class MetadataSeeder extends Seeder
{
    public function run(): void
    {
        // Get all pariwisata and products
        $pariwisataItems = Pariwisata::all();
        $products = PariwisataProduct::all();

        // Sample metadata for destinations
        $destinationMetadataTemplates = [
            [
                'activity_level' => 'easy',
                'price_range' => 'budget',
                'best_season' => 'Mei-Oktober',
                'tags' => ['pantai', 'fotografi', 'sunset', 'keluarga'],
                'duration_hours' => 3.5,
                'target_age_group' => ['adult', 'child', 'family'],
                'facilities' => ['parking', 'toilet', 'restaurant', 'wifi', 'mushola'],
                'accessibility' => 'all_accessible',
            ],
            [
                'activity_level' => 'moderate',
                'price_range' => 'moderate',
                'best_season' => 'Sepanjang Tahun',
                'tags' => ['edukasi', 'keluarga', 'satwa', 'budaya'],
                'duration_hours' => 4.0,
                'target_age_group' => ['child', 'family', 'teenager'],
                'facilities' => ['parking', 'toilet', 'souvenir_shop', 'restaurant'],
                'accessibility' => 'child_friendly',
            ],
            [
                'activity_level' => 'challenging',
                'price_range' => 'expensive',
                'best_season' => 'Juni-September',
                'tags' => ['gunung', 'hiking', 'petualangan', 'alam'],
                'duration_hours' => 6.0,
                'target_age_group' => ['adult', 'teenager'],
                'facilities' => ['parking', 'toilet', 'atm'],
                'accessibility' => 'wheelchair_friendly',
            ],
        ];

        // Sample metadata for products
        $productMetadataTemplates = [
            [
                'activity_level' => 'easy',
                'price_range' => 'budget',
                'best_season' => 'Mei-Oktober',
                'tags' => ['santai', 'keluarga', 'relax'],
                'duration_hours' => 2.0,
                'target_age_group' => ['family', 'child', 'adult', 'senior'],
                'includes' => ['Guide', 'Tiket Masuk', 'Snack', 'Dokumentasi'],
                'requirements' => ['ID Card', 'Sepatu Nyaman'],
                'group_size' => ['min' => 2, 'max' => 10],
            ],
            [
                'activity_level' => 'moderate',
                'price_range' => 'moderate',
                'best_season' => 'Sepanjang Tahun',
                'tags' => ['komplit', 'hemat', 'populer'],
                'duration_hours' => 4.0,
                'target_age_group' => ['adult', 'child', 'family'],
                'includes' => ['Guide', 'Tiket Masuk', 'Makan Siang', 'Transport'],
                'requirements' => ['Kesehatan Baik', 'Asuransi'],
                'group_size' => ['min' => 4, 'max' => 20],
            ],
        ];

        // Create metadata for each pariwisata
        foreach ($pariwisataItems as $index => $pariwisata) {
            $template = $destinationMetadataTemplates[$index % count($destinationMetadataTemplates)];
            
            PariwisataMetadata::updateOrCreate(
                ['pariwisata_id' => $pariwisata->id],
                $template
            );
        }

        // Create metadata for each product
        foreach ($products as $index => $product) {
            $template = $productMetadataTemplates[$index % count($productMetadataTemplates)];
            
            PariwisataProductMetadata::updateOrCreate(
                ['product_id' => $product->id],
                $template
            );
        }

        $this->command->info('Metadata seeded successfully!');
    }
}
