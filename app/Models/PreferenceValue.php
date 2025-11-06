<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreferenceValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'key', 'label', 'sort', 'active'
    ];
}
