<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ProductResource mirrors destination attributes for each product variant.
 * For now, it uses the same fields as Pariwisata.
 * @mixin \App\Models\Pariwisata
 */
class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Map preference relationships to metadata format for frontend
        $metadata = (object)[];
        
        // Activity Levels
        if ($this->relationLoaded('activityLevels')) {
            $metadata->activity_levels = $this->activityLevels->map(function($al) {
                return [
                    'id' => $al->id,
                    'icon' => $al->icon,
                    'title' => $al->title,
                    'key' => \Illuminate\Support\Str::slug($al->title),
                ];
            })->toArray();
        }
        
        // Price Ranges
        if ($this->relationLoaded('priceRanges')) {
            $metadata->price_ranges = $this->priceRanges->map(function($pr) {
                return [
                    'id' => $pr->id,
                    'icon' => $pr->icon,
                    'title' => $pr->title,
                    'key' => \Illuminate\Support\Str::slug($pr->title),
                ];
            })->toArray();
        }
        
        // Visit Times
        if ($this->relationLoaded('visitTimes')) {
            $metadata->visit_times = $this->visitTimes->map(function($vt) {
                return [
                    'id' => $vt->id,
                    'icon' => $vt->icon,
                    'title' => $vt->title,
                    'key' => \Illuminate\Support\Str::slug($vt->title),
                ];
            })->toArray();
        }
        
        return [
            'id' => $this->id,
            'title' => $this->title,
            'label' => $this->label,
            'subtitle' => $this->subtitle,
            'slug' => $this->slug,
            'content' => $this->content,
            'background_url' => $this->background_url,
            'cta_href' => $this->cta_href,
            'cta_label' => $this->cta_label,
            'align' => $this->align,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'overlays' => OverlayResource::collection($this->whenLoaded('overlays', $this->overlays)),
            'metadata' => $metadata,
        ];
    }
}
