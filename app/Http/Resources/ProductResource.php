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
        ];
    }
}
