# J-PIMS API Documentation

Base URL: `http://your-domain.com/api`

## 📍 Wisata API

### Get All Wisata (Destinations)
Get all pariwisata with complete relations (overlays, products, cerita, destination types).

**Endpoint:** `GET /wisata`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Pantai Papuma",
      "label": "Pantai Indah",
      "subtitle": "Keindahan Pantai di Jember",
      "slug": "pantai-papuma",
      "content": "...",
      "background_url": "https://...",
      "cta_href": "#",
      "cta_label": "Kunjungi Sekarang",
      "align": "left",
      "overlays": [
        {
          "id": 1,
          "overlay_url": "https://...",
          "position_horizontal": "right",
          "position_vertical": "top",
          "object_fit": "cover",
          "width": null,
          "height": null
        }
      ],
      "destination_types": [
        {
          "id": 1,
          "icon": "🏖️",
          "title": "Pantai"
        }
      ],
      "products": [
        {
          "id": 1,
          "title": "Pantai Papuma — Paket A",
          "slug": "pantai-papuma-paket-a",
          "overlays": [...],
          "activity_levels": [
            {
              "id": 1,
              "icon": "🛌",
              "title": "Santai",
              "subtitle": "Aktivitas ringan, santai"
            }
          ],
          "price_ranges": [...],
          "visit_times": [...]
        }
      ],
      "cerita": [
        {
          "id": 1,
          "title": "Petualangan di Pantai Papuma",
          "slug": "petualangan-pantai-papuma",
          "overlays": [...]
        }
      ]
    }
  ]
}
```

---

## 🔍 Search API

### Search Destinations and Products
Search across destinations (pariwisata) and products with filtering options.

**Endpoint:** `GET /search`

**Query Parameters:**
- `q` (optional): Search query string
- `destination_type_ids` (optional): Array or comma-separated destination type IDs
- `activity_level_ids` (optional): Array or comma-separated activity level IDs
- `price_range_ids` (optional): Array or comma-separated price range IDs
- `visit_time_ids` (optional): Array or comma-separated visit time IDs

**Example Request:**
```
GET /api/search?q=pantai&destination_type_ids=1,2&activity_level_ids=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "pantai",
    "filters": {
      "destination_type_ids": ["1", "2"],
      "activity_level_ids": ["1"],
      "price_range_ids": [],
      "visit_time_ids": []
    },
    "results": [
      {
        "id": 1,
        "type": "destination",
        "title": "Pantai Papuma",
        "subtitle": "Keindahan Pantai di Jember",
        "label": "Pantai Indah",
        "slug": "pantai-papuma",
        "content": "Deskripsi singkat...",
        "background_url": "https://...",
        "overlays": [...],
        "destination_types": [
          {
            "id": 1,
            "icon": "🏖️",
            "title": "Pantai"
          }
        ]
      },
      {
        "id": 1,
        "type": "product",
        "title": "Pantai Papuma — Paket A",
        "subtitle": "Paket Wisata Hemat",
        "label": "Paket A",
        "slug": "pantai-papuma-paket-a",
        "content": "Deskripsi singkat...",
        "background_url": "https://...",
        "parent_destination": {
          "id": 1,
          "title": "Pantai Papuma",
          "slug": "pantai-papuma"
        },
        "overlays": [...],
        "activity_levels": [...],
        "price_ranges": [...],
        "visit_times": [...],
        "destination_types": [...]
      }
    ],
    "total": 2
  }
}
```

### Get Search Recommendations
Get random recommendations (mix of destinations and products) for users who haven't searched yet.

**Endpoint:** `GET /search/recommendations`

**Query Parameters:**
- `limit` (optional): Number of recommendations to return (default: 12)

**Example Request:**
```
GET /api/search/recommendations?limit=6
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "destination",
      "title": "Pantai Papuma",
      "subtitle": "Keindahan Pantai di Jember",
      "label": "Pantai Indah",
      "slug": "pantai-papuma",
      "content": "Deskripsi singkat...",
      "background_url": "https://...",
      "overlays": [...],
      "destination_types": [...]
    },
    {
      "id": 1,
      "type": "product",
      "title": "Pantai Papuma — Paket A",
      "subtitle": "Paket Wisata Hemat",
      "label": "Paket A",
      "slug": "pantai-papuma-paket-a",
      "content": "Deskripsi singkat...",
      "background_url": "https://...",
      "parent_destination": {...},
      "overlays": [...],
      "activity_levels": [...],
      "price_ranges": [...],
      "visit_times": [...],
      "destination_types": [...]
    }
  ]
}
```

---

## ⚙️ Preferences API

### Get Activity Levels
Get all activity level preferences.

**Endpoint:** `GET /preferences/activity-levels`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "icon": "🛌",
      "title": "Santai",
      "subtitle": "Aktivitas ringan, santai",
      "created_at": "2025-11-07T00:00:00.000000Z",
      "updated_at": "2025-11-07T00:00:00.000000Z"
    },
    {
      "id": 2,
      "icon": "🚶",
      "title": "Sedang",
      "subtitle": "Jalan santai, aktivitas moderat"
    },
    {
      "id": 3,
      "icon": "⛰️",
      "title": "Aktif",
      "subtitle": "Trekking, aktivitas intens"
    }
  ]
}
```

### Get Price Ranges
Get all price range preferences.

**Endpoint:** `GET /preferences/price-ranges`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "icon": "💸",
      "title": "Hemat",
      "subtitle": "Budget friendly"
    },
    {
      "id": 2,
      "icon": "💰",
      "title": "Sedang",
      "subtitle": "Mid-range"
    },
    {
      "id": 3,
      "icon": "💎",
      "title": "Premium",
      "subtitle": "High-end experience"
    }
  ]
}
```

### Get Visit Times
Get all visit time preferences.

**Endpoint:** `GET /preferences/visit-times`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "icon": "🌅",
      "title": "Pagi",
      "subtitle": "06:00 - 10:00"
    },
    {
      "id": 2,
      "icon": "🌤️",
      "title": "Siang",
      "subtitle": "10:00 - 14:00"
    },
    {
      "id": 3,
      "icon": "🌇",
      "title": "Sore",
      "subtitle": "14:00 - 18:00"
    },
    {
      "id": 4,
      "icon": "🌃",
      "title": "Malam",
      "subtitle": "18:00 - 22:00"
    }
  ]
}
```

### Get Destination Types
Get all destination type preferences.

**Endpoint:** `GET /preferences/destination-types`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "icon": "🏖️",
      "title": "Pantai"
    },
    {
      "id": 2,
      "icon": "⛰️",
      "title": "Gunung"
    },
    {
      "id": 3,
      "icon": "🌳",
      "title": "Alam & Hutan"
    },
    {
      "id": 4,
      "icon": "🏛️",
      "title": "Budaya & Sejarah"
    },
    {
      "id": 5,
      "icon": "🎡",
      "title": "Taman Hiburan"
    },
    {
      "id": 6,
      "icon": "🏙️",
      "title": "Kota"
    }
  ]
}
```

### Get All Preferences (Combined)
Get all preference types in a single request.

**Endpoint:** `GET /preferences/all`

**Response:**
```json
{
  "success": true,
  "data": {
    "activity_levels": [...],
    "price_ranges": [...],
    "visit_times": [...],
    "destination_types": [...]
  }
}
```

---

## 📝 Notes

### Relations Structure
All wisata/destination data includes:
- **overlays**: Array of overlay images with positioning
- **destination_types**: Array of destination type preferences
- **products**: Array of product packages with:
  - **overlays**: Product-specific overlays
  - **activity_levels**: Activity level preferences
  - **price_ranges**: Price range preferences
  - **visit_times**: Visit time preferences
- **cerita**: Array of stories/articles related to the destination with:
  - **overlays**: Story-specific overlay images

### Personalization
Use preference APIs to:
1. Get available options for user selection
2. Match user preferences with product metadata
3. Calculate personalization scores
4. Filter and recommend destinations

### Example Use Case
```javascript
// Search for destinations and products
const searchResponse = await fetch('/api/search?q=pantai&destination_type_ids=1')
  .then(r => r.json());

console.log(searchResponse.data.results); // Array of destinations and products
console.log(searchResponse.data.total); // Total results count

// Get recommendations when page loads
const recommendationsResponse = await fetch('/api/search/recommendations?limit=8')
  .then(r => r.json());

console.log(recommendationsResponse.data); // Array of random destinations and products

// Get all wisata with complete relations
const response = await fetch('/api/wisata').then(r => r.json());

// Access the data
response.data.forEach(wisata => {
  console.log(wisata.title); // "Pantai Papuma"
  console.log(wisata.overlays); // Array of overlay images
  console.log(wisata.destination_types); // Array of destination types
  console.log(wisata.products); // Array of products with preferences
  console.log(wisata.cerita); // Array of stories
  
  // Access product preferences
  wisata.products.forEach(product => {
    console.log(product.activity_levels); // Santai, Sedang, Aktif
    console.log(product.price_ranges); // Hemat, Sedang, Premium
    console.log(product.visit_times); // Pagi, Siang, Sore, Malam
  });
});
```

---

## 🐛 Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `404` - Not Found
- `401` - Unauthorized
- `500` - Server Error
