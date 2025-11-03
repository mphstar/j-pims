<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PariwisataProduct extends Model
{
    use HasFactory;

    protected $table = 'pariwisata_products';

    protected $fillable = [
        'pariwisata_id',
        'title','label','subtitle','slug','content','background_url','cta_href','cta_label','align'
    ];

    public function pariwisata()
    {
        return $this->belongsTo(Pariwisata::class);
    }

    public function overlays()
    {
        return $this->hasMany(PariwisataOverlays::class, 'product_id');
    }

    public function metadata()
    {
        return $this->hasOne(PariwisataProductMetadata::class, 'product_id');
    }
}
