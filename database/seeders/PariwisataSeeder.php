<?php

namespace Database\Seeders;

use App\Models\Pariwisata;
use App\Models\PariwisataOverlays;
use App\Models\PariwisataProduct;
use App\Models\PreferenceDestinationType;
use App\Models\PreferenceActivityLevel;
use App\Models\PreferencePriceRange;
use App\Models\PreferenceVisitTime;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Seeder;

class PariwisataSeeder extends Seeder
{
    public function run(): void
    {
        // Reset destination-related tables for clean seeding (dev/demo convenience)
        Schema::disableForeignKeyConstraints();
        DB::table('pariwisata_overlays')->truncate();
        DB::table('pariwisata_products')->truncate();
        DB::table('pariwisata_preference_destination_types')->truncate();
        DB::table('product_activity_levels')->truncate();
        DB::table('product_price_ranges')->truncate();
        DB::table('product_visit_times')->truncate();
        DB::table('pariwisata')->truncate();
        Schema::enableForeignKeyConstraints();

        // Data pariwisata Jember
        $pariwisataData = [
            [
                'title' => 'Pantai Papuma',
                'label' => 'Pantai Indah',
                'subtitle' => 'Keindahan Pantai di Jember',
                'slug' => 'pantai-papuma',
                'content' => "Pantai Papuma adalah salah satu pantai terindah di Jember yang terkenal dengan pasir putihnya dan formasi batu karang yang unik. Pantai ini menawarkan pemandangan yang menakjubkan dengan hamparan pasir putih dan air laut yang jernih.\n\nPantai Papuma merupakan destinasi wisata favorit bagi wisatawan lokal maupun mancanegara yang berkunjung ke Jember.",
                'background_url' => 'https://picsum.photos/1920/1080?random=1',
                'cta_href' => '#',
                'cta_label' => 'Kunjungi Sekarang',
                'align' => 'left',
                'overlays' => [
                    [
                        'overlay_url' => 'https://picsum.photos/300/200?random=11',
                        'position_horizontal' => 'right',
                        'position_vertical' => 'top',
                        'object_fit' => 'cover'
                    ],
                    [
                        'overlay_url' => 'https://picsum.photos/250/300?random=12',
                        'position_horizontal' => 'right',
                        'position_vertical' => 'bottom',
                        'object_fit' => 'cover'
                    ]
                ]
            ],
            [
                'title' => 'Jember Mini Zoom',
                'label' => 'Kebun Binatang',
                'subtitle' => 'Wisata Keluarga di Jember',
                'slug' => 'jember-mini-zoom',
                'content' => "Jember Mini Zoom adalah kebun binatang mini yang menyajikan berbagai koleksi satwa dan merupakan destinasi wisata edukatif yang cocok untuk keluarga. Pengunjung dapat melihat berbagai jenis hewan dan belajar tentang keanekaragaman hayati.\n\nTempat ini sangat cocok untuk wisata bersama keluarga dan anak-anak untuk mengenal lebih dekat dengan berbagai satwa.",
                'background_url' => 'https://picsum.photos/1920/1080?random=2',
                'cta_href' => '#',
                'cta_label' => 'Jelajahi Sekarang',
                'align' => 'right',
                'overlays' => [
                    [
                        'overlay_url' => 'https://picsum.photos/280/180?random=21',
                        'position_horizontal' => 'left',
                        'position_vertical' => 'center',
                        'object_fit' => 'cover'
                    ],
                    [
                        'overlay_url' => 'https://picsum.photos/200/250?random=22',
                        'position_horizontal' => 'center',
                        'position_vertical' => 'bottom',
                        'object_fit' => 'cover'
                    ]
                ]
            ],
            [
                'title' => 'Wisata Kebun Teh',
                'label' => 'Perkebunan Teh',
                'subtitle' => 'Hamparan Hijau Kebun Teh',
                'slug' => 'wisata-kebun-teh',
                'content' => "Wisata Kebun Teh menawarkan pemandangan hijau perkebunan teh yang membentang luas dengan udara sejuk pegunungan. Pengunjung dapat menikmati keindahan alam, berfoto di tengah kebun teh, dan belajar tentang proses pengolahan teh.\n\nTempat ini sangat cocok untuk melepas penat dan menikmati suasana alam yang asri dan menenangkan.",
                'background_url' => 'https://picsum.photos/1920/1080?random=3',
                'cta_href' => '#',
                'cta_label' => 'Nikmati Kesegaran',
                'align' => 'left',
                'overlays' => [
                    [
                        'overlay_url' => 'https://picsum.photos/320/240?random=31',
                        'position_horizontal' => 'right',
                        'position_vertical' => 'center',
                        'object_fit' => 'cover'
                    ]
                ]
            ],
            [
                'title' => 'Rembangan',
                'label' => 'Wisata Alam',
                'subtitle' => 'Keindahan Alam Rembangan',
                'slug' => 'rembangan',
                'content' => "Rembangan adalah destinasi wisata alam yang menawarkan keindahan pemandangan dan suasana yang tenang. Tempat ini cocok untuk wisata alam, hiking, dan menikmati keindahan panorama pegunungan.\n\nRembangan menjadi pilihan tepat bagi para pecinta alam yang ingin menikmati kesejukan dan keindahan alam yang masih alami.",
                'background_url' => 'https://picsum.photos/1920/1080?random=4',
                'cta_href' => '#',
                'cta_label' => 'Jelajahi Alam',
                'align' => 'right',
                'overlays' => [
                    [
                        'overlay_url' => 'https://picsum.photos/250/200?random=41',
                        'position_horizontal' => 'left',
                        'position_vertical' => 'top',
                        'object_fit' => 'cover'
                    ],
                    [
                        'overlay_url' => 'https://picsum.photos/200/300?random=42',
                        'position_horizontal' => 'center',
                        'position_vertical' => 'center',
                        'object_fit' => 'cover'
                    ]
                ]
            ],
            [
                'title' => 'Pemandian Patemon',
                'label' => 'Pemandian Air Panas',
                'subtitle' => 'Relaksasi di Air Hangat Alami',
                'slug' => 'pemandian-patemon',
                'content' => "Pemandian Patemon adalah objek wisata pemandian air panas alami yang terletak di kawasan pegunungan. Air panas yang mengandung belerang dipercaya memiliki khasiat untuk kesehatan dan relaksasi.\n\nTempat ini sangat cocok untuk berendam sambil menikmati suasana alam pegunungan yang sejuk dan menenangkan.",
                'background_url' => 'https://picsum.photos/1920/1080?random=5',
                'cta_href' => '#',
                'cta_label' => 'Nikmati Relaksasi',
                'align' => 'left',
                'overlays' => [
                    [
                        'overlay_url' => 'https://picsum.photos/300/180?random=51',
                        'position_horizontal' => 'right',
                        'position_vertical' => 'bottom',
                        'object_fit' => 'cover'
                    ]
                ]
            ]
        ];

        // Fetch preference dictionaries to attach
        $allDestTypes = PreferenceDestinationType::all()->keyBy(fn($r) => $r->title);
        $activityLevels = PreferenceActivityLevel::pluck('id')->all();
        $priceRanges = PreferencePriceRange::pluck('id')->all();
        $visitTimes = PreferenceVisitTime::pluck('id')->all();

        foreach ($pariwisataData as $data) {
            $overlays = $data['overlays'];
            unset($data['overlays']);

            // 1) Create destination (pariwisata)
            $pariwisata = Pariwisata::create($data);

            // Destination-level overlays (no product_id)
            foreach ($overlays as $overlay) {
                PariwisataOverlays::create([
                    'pariwisata_id' => $pariwisata->id,
                    'overlay_url' => $overlay['overlay_url'],
                    'position_horizontal' => $overlay['position_horizontal'],
                    'position_vertical' => $overlay['position_vertical'],
                    'object_fit' => $overlay['object_fit']
                ]);
            }

            // Attach 1-2 destination types based on slug keywords
            $attachTypes = [];
            if (str_contains($pariwisata->slug, 'pantai')) {
                if ($allDestTypes->has('Pantai')) $attachTypes[] = $allDestTypes['Pantai']->id;
                if ($allDestTypes->has('Alam & Sejarah')) { /* old key guard */ }
                if ($allDestTypes->has('Alam & Hutan')) $attachTypes[] = $allDestTypes['Alam & Hutan']->id;
            } elseif (str_contains($pariwisata->slug, 'zoom')) {
                if ($allDestTypes->has('Taman Hiburan')) $attachTypes[] = $allDestTypes['Taman Hiburan']->id;
                if ($allDestTypes->has('Kota')) $attachTypes[] = $allDestTypes['Kota']->id;
            } elseif (str_contains($pariwisata->slug, 'teh')) {
                if ($allDestTypes->has('Alam & Hutan')) $attachTypes[] = $allDestTypes['Alam & Hutan']->id;
                if ($allDestTypes->has('Gunung')) $attachTypes[] = $allDestTypes['Gunung']->id;
            } elseif (str_contains($pariwisata->slug, 'rembangan')) {
                if ($allDestTypes->has('Gunung')) $attachTypes[] = $allDestTypes['Gunung']->id;
                if ($allDestTypes->has('Alam & Hutan')) $attachTypes[] = $allDestTypes['Alam & Hutan']->id;
            } elseif (str_contains($pariwisata->slug, 'pemandian')) {
                if ($allDestTypes->has('Alam & Hutan')) $attachTypes[] = $allDestTypes['Alam & Hutan']->id;
            }
            $attachTypes = array_values(array_unique($attachTypes));
            if (!empty($attachTypes)) {
                DB::table('pariwisata_preference_destination_types')->insert(
                    array_map(fn($typeId) => [
                        'pariwisata_id' => $pariwisata->id,
                        'preference_destination_type_id' => $typeId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ], $attachTypes)
                );
            }

            // 2) Create two sample products per destination
            $productsSpec = [
                [
                    'suffix' => 'paket-a',
                    'titleSuffix' => ' — Paket A',
                    'bg' => 'https://picsum.photos/seed/'.md5($pariwisata->slug.'-a').'/1920/1080',
                    'cta' => 'Lihat Paket A',
                ],
                [
                    'suffix' => 'paket-b',
                    'titleSuffix' => ' — Paket B',
                    'bg' => 'https://picsum.photos/seed/'.md5($pariwisata->slug.'-b').'/1920/1080',
                    'cta' => 'Lihat Paket B',
                ],
            ];

            foreach ($productsSpec as $i => $spec) {
                $product = PariwisataProduct::create([
                    'pariwisata_id' => $pariwisata->id,
                    'title' => $pariwisata->title.$spec['titleSuffix'],
                    'label' => $pariwisata->label,
                    'subtitle' => $pariwisata->subtitle,
                    'slug' => $pariwisata->slug.'-'.$spec['suffix'],
                    'content' => $pariwisata->content,
                    'background_url' => $spec['bg'],
                    'cta_href' => $pariwisata->cta_href,
                    'cta_label' => $spec['cta'],
                    'align' => $pariwisata->align,
                ]);

                // Product-level overlays
                $base = $i + 1;
                PariwisataOverlays::create([
                    'pariwisata_id' => $pariwisata->id,
                    'product_id' => $product->id,
                    'overlay_url' => 'https://picsum.photos/seed/'.md5($product->slug.'-ov1').'/300/200',
                    'position_horizontal' => $i % 2 === 0 ? 'right' : 'left',
                    'position_vertical' => 'top',
                    'object_fit' => 'cover',
                ]);
                PariwisataOverlays::create([
                    'pariwisata_id' => $pariwisata->id,
                    'product_id' => $product->id,
                    'overlay_url' => 'https://picsum.photos/seed/'.md5($product->slug.'-ov2').'/250/300',
                    'position_horizontal' => $i % 2 === 0 ? 'right' : 'center',
                    'position_vertical' => 'bottom',
                    'object_fit' => 'cover',
                ]);

                // Attach product preferences (1 each) for demo
                if ($activityLevels) {
                    DB::table('product_activity_levels')->insert([
                        'product_id' => $product->id,
                        'preference_activity_level_id' => $activityLevels[$i % count($activityLevels)],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                if ($priceRanges) {
                    DB::table('product_price_ranges')->insert([
                        'product_id' => $product->id,
                        'preference_price_range_id' => $priceRanges[$i % count($priceRanges)],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
                if ($visitTimes) {
                    DB::table('product_visit_times')->insert([
                        'product_id' => $product->id,
                        'preference_visit_time_id' => $visitTimes[$i % count($visitTimes)],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}