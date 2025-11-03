<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PariwisataMetadata extends Model
{
    protected $fillable = [
        'pariwisata_id',
        'activity_level',
        'price_range',
        'best_season',
        'tags',
        'duration_hours',
        'target_age_group',
        'view_count',
        'visit_count',
        'facilities',
        'accessibility',
    ];

    protected $casts = [
        'tags' => 'array',
        'target_age_group' => 'array',
        'facilities' => 'array',
        'duration_hours' => 'decimal:2',
        'view_count' => 'integer',
        'visit_count' => 'integer',
    ];

    public function pariwisata(): BelongsTo
    {
        return $this->belongsTo(Pariwisata::class);
    }

    /**
     * Increment view count
     */
    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    /**
     * Increment visit count
     */
    public function incrementVisitCount(): void
    {
        $this->increment('visit_count');
    }
}
