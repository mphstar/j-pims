<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\PariwisataOverlays */
class OverlayResource extends JsonResource
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
            'pariwisata_id' => $this->pariwisata_id,
            'product_id' => $this->product_id,
            'overlay_url' => $this->overlay_url,
            'position_horizontal' => $this->position_horizontal,
            'position_vertical' => $this->position_vertical,
            'object_fit' => $this->object_fit,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
