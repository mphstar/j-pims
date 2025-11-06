<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CeritaOverlays extends Model
{
    use HasFactory;

    protected $table = 'cerita_overlays';

    protected $fillable = [
        'cerita_id',
        'overlay_url',
        'position_horizontal',
        'position_vertical',
        'object_fit',
        'width',
        'height',
    ];

    public function cerita()
    {
        return $this->belongsTo(Cerita::class, 'cerita_id');
    }
}
