<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pariwisata extends Model
{
    use HasFactory;
    protected $table = 'pariwisata';

    protected $fillable = [
        'title','label','subtitle','slug','content','background_url','cta_href','cta_label','align'
    ];

    public function overlays()
    {
        // Destination-level overlays (not tied to a specific product)
        return $this->hasMany(PariwisataOverlays::class, 'pariwisata_id')->whereNull('product_id');
    }

    public function products()
    {
        return $this->hasMany(PariwisataProduct::class, 'pariwisata_id');
    }

    public function metadata()
    {
        return $this->hasOne(PariwisataMetadata::class);
    }
    
    public function preferenceValues()
    {
        return $this->belongsToMany(\App\Models\PreferenceValue::class, 'pariwisata_preference_values');
    }

    public function destinationTypes()
    {
        return $this->belongsToMany(PreferenceDestinationType::class, 'pariwisata_preference_destination_types', 'pariwisata_id', 'preference_destination_type_id');
    }
}
