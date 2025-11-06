<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Cerita;
use App\Models\CeritaOverlays;
use Illuminate\Support\Str;

class CeritaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ceritaData = [
            [
                'title' => 'Petualangan di Gunung Bromo',
                'label' => 'ADVENTURE',
                'subtitle' => 'Menyaksikan Sunrise Spektakuler',
                'content' => 'Rasakan pengalaman tak terlupakan menyaksikan matahari terbit dari puncak Gunung Bromo. Pemandangan kawah yang megah dan lautan pasir yang luas akan membuat perjalanan Anda semakin berkesan.',
                'background_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                'cta_href' => '#',
                'cta_label' => 'Lihat Detail',
                'align' => 'left',
            ],
            [
                'title' => 'Keindahan Pantai Nusa Penida',
                'label' => 'BEACH',
                'subtitle' => 'Surga Tersembunyi di Bali',
                'content' => 'Jelajahi keindahan pantai-pantai eksotis di Nusa Penida. Dari Kelingking Beach yang ikonik hingga Crystal Bay yang jernih, setiap sudut pulau ini menawarkan pemandangan yang memukau.',
                'background_url' => 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop',
                'cta_href' => '#',
                'cta_label' => 'Explore',
                'align' => 'right',
            ],
            [
                'title' => 'Wisata Budaya Yogyakarta',
                'label' => 'CULTURE',
                'subtitle' => 'Jejak Sejarah Kerajaan Mataram',
                'content' => 'Telusuri kekayaan budaya dan sejarah Yogyakarta. Kunjungi Candi Borobudur, Prambanan, dan Keraton untuk merasakan kemegahan peradaban Jawa kuno.',
                'background_url' => 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&h=1080&fit=crop',
                'cta_href' => '#',
                'cta_label' => 'Pelajari Lebih Lanjut',
                'align' => 'left',
            ],
            [
                'title' => 'Diving di Raja Ampat',
                'label' => 'MARINE',
                'subtitle' => 'Surga Bawah Laut Indonesia',
                'content' => 'Selami keindahan bawah laut Raja Ampat yang terkenal sebagai salah satu spot diving terbaik di dunia. Nikmati keanekaragaman hayati laut yang luar biasa dengan terumbu karang yang masih sangat terjaga.',
                'background_url' => 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop',
                'cta_href' => '#',
                'cta_label' => 'Book Now',
                'align' => 'right',
            ],
            [
                'title' => 'Hiking di Gunung Rinjani',
                'label' => 'TREKKING',
                'subtitle' => 'Tantangan untuk Pendaki Sejati',
                'content' => 'Taklukkan puncak Gunung Rinjani dan saksikan keindahan Danau Segara Anak dari ketinggian. Perjalanan penuh tantangan ini akan memberikan pengalaman mendaki yang tak terlupakan.',
                'background_url' => 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
                'cta_href' => '#',
                'cta_label' => 'Start Journey',
                'align' => 'left',
            ],
        ];

        foreach ($ceritaData as $data) {
            $slug = Str::slug($data['title']);
            
            // Ensure unique slug
            $originalSlug = $slug;
            $i = 1;
            while (Cerita::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $i++;
            }
            
            $data['slug'] = $slug;
            
            $cerita = Cerita::create($data);

            // Optional: Add some sample overlays
            // You can uncomment this if you want to add default overlays
            /*
            CeritaOverlays::create([
                'cerita_id' => $cerita->id,
                'overlay_url' => 'https://via.placeholder.com/400x400.png?text=Overlay',
                'position_horizontal' => 'center',
                'position_vertical' => 'center',
                'object_fit' => 'contain',
                'width' => 400,
                'height' => 400,
            ]);
            */
        }

        $this->command->info('Cerita seeder completed! Created ' . count($ceritaData) . ' cerita entries.');
    }
}
