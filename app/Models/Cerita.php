<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cerita extends Model
{
    use HasFactory;

    protected $table = 'cerita';

    protected $fillable = [
        'title',
        'label',
        'subtitle',
        'slug',
        'content',
        'background_url',
        'cta_href',
        'cta_label',
        'align',
    ];

    public function overlays()
    {
        return $this->hasMany(CeritaOverlays::class, 'cerita_id');
    }
}
