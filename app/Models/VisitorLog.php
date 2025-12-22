<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    protected $fillable = [
        'session_id',
        'ip_address',
        'user_agent',
        'page_url',
        'referrer',
        'pariwisata_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function pariwisata()
    {
        return $this->belongsTo(Pariwisata::class);
    }
}
