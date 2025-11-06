<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * DestinationResource represents a pariwisata item with nested products.
 * @mixin \App\Models\Pariwisata
 */
class DestinationResource extends JsonResource
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
        
        // Destination Types
        if ($this->relationLoaded('destinationTypes')) {
            $metadata->destination_types = $this->destinationTypes->map(function($dt) {
                return [
                    'id' => $dt->id,
                    'icon' => $dt->icon,
                    'title' => $dt->title,
                    'key' => \Illuminate\Support\Str::slug($dt->title),
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
            'products' => ProductResource::collection($this->whenLoaded('products', $this->products ?? [])),
            'metadata' => $metadata,
        ];
    }
}
