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

    public function activityLevels()
    {
        return $this->belongsToMany(PreferenceActivityLevel::class, 'product_activity_levels', 'product_id', 'preference_activity_level_id');
    }

    public function priceRanges()
    {
        return $this->belongsToMany(PreferencePriceRange::class, 'product_price_ranges', 'product_id', 'preference_price_range_id');
    }

    public function visitTimes()
    {
        return $this->belongsToMany(PreferenceVisitTime::class, 'product_visit_times', 'product_id', 'preference_visit_time_id');
    }
}
