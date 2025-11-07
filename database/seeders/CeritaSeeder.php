<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cerita;
use App\Models\CeritaOverlays;
use App\Models\Pariwisata;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CeritaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate cerita tables for clean seeding (dev/demo)
        Schema::disableForeignKeyConstraints();
        DB::table('cerita_overlays')->truncate();
        DB::table('cerita')->truncate();
        Schema::enableForeignKeyConstraints();

        $destinations = Pariwisata::orderBy('id')->get();
        $count = 0;

        foreach ($destinations as $dIdx => $dest) {
            // Minimal 3 cerita per destinasi
            for ($n = 1; $n <= 3; $n++) {
                $data = [
                    'pariwisata_id' => $dest->id,
                    'title' => 'Cerita ' . $dest->title . ' #' . $n,
                    'label' => strtoupper(Str::slug($dest->label ?: 'cerita', ' ')),
                    'subtitle' => $dest->subtitle,
                    'content' => $dest->content,
                    'background_url' => 'https://picsum.photos/seed/'.md5($dest->slug.'-cerita-'.$n).'/1920/1080',
                    'cta_href' => '#',
                    'cta_label' => 'Lihat Produk',
                    'align' => ($dIdx + $n) % 2 === 0 ? 'left' : 'right',
                ];

                $data['slug'] = $dest->slug . '-cerita-' . $n;

                // Ensure unique slug just in case
                $originalSlug = $data['slug'];
                $i = 1;
                while (Cerita::where('slug', $data['slug'])->exists()) {
                    $data['slug'] = $originalSlug . '-' . $i++;
                }

                $cerita = Cerita::create($data);
                $count++;

                // Seed one sample overlay per cerita for demo
                CeritaOverlays::create([
                    'cerita_id' => $cerita->id,
                    'overlay_url' => 'https://picsum.photos/seed/'.md5($cerita->slug.'-ov').'/360/240',
                    'position_horizontal' => ($dIdx + $n) % 2 === 0 ? 'right' : 'left',
                    'position_vertical' => 'center',
                    'object_fit' => 'cover',
                    'width' => 360,
                    'height' => 240,
                ]);
            }
        }

        $this->command->info('Cerita seeder completed! Created ' . $count . ' cerita entries linked to destinasi (>=3 per destinasi).');
    }
}
