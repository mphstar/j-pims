<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PariwisataProductMetadata extends Model
{
    protected $table = 'pariwisata_products_metadata';
    
    protected $fillable = [
        'product_id',
        'activity_level',
        'price_range',
        'best_season',
        'tags',
        'duration_hours',
        'target_age_group',
        'view_count',
        'visit_count',
        'includes',
        'requirements',
        'group_size',
    ];

    protected $casts = [
        'tags' => 'array',
        'target_age_group' => 'array',
        'includes' => 'array',
        'requirements' => 'array',
        'group_size' => 'array',
        'duration_hours' => 'decimal:2',
        'view_count' => 'integer',
        'visit_count' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(PariwisataProduct::class, 'product_id');
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
