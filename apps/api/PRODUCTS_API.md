# Products API Documentation

## Base URL
```
http://localhost:5000/api/products
```

## Endpoints

### 1. Get All Products (Public)
```http
GET /api/products
```

**Query Parameters:**
- `category` (optional): Filter by category (e.g., "Dal & Curry", "Rice Dishes")
- `search` (optional): Search by name, description, or tags
- `isActive` (optional): Filter by active status (default: "true")

**Example:**
```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/products?category=Dal%20%26%20Curry
curl http://localhost:5000/api/products?search=dal
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [...]
}
```

---

### 2. Get Single Product (Public)
```http
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:5000/api/products/65a1b2c3d4e5f6789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "name": "Dal Makhani",
    "price": 85,
    ...
  }
}
```

---

### 3. Create Product (Admin Only)
```http
POST /api/products
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Paneer Butter Masala",
  "description": "Cottage cheese in rich creamy tomato gravy",
  "category": "Dal & Curry",
  "price": 130,
  "originalPrice": 160,
  "subscriptionPrice": 110,
  "rating": 4.7,
  "isVeg": true,
  "isBestSeller": true,
  "isPopular": false,
  "image": "https://images.unsplash.com/...",
  "tags": ["paneer", "curry", "butter"],
  "stock": 100
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Paneer Butter Masala",
    "description": "Cottage cheese in rich creamy tomato gravy",
    "category": "Dal & Curry",
    "price": 130,
    "originalPrice": 160,
    "subscriptionPrice": 110,
    "image": "https://example.com/image.jpg"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {...}
}
```

---

### 4. Update Product (Admin Only)
```http
PUT /api/products/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:** (Any fields to update)
```json
{
  "price": 140,
  "originalPrice": 170,
  "isBestSeller": true
}
```

**Example:**
```bash
curl -X PUT http://localhost:5000/api/products/65a1b2c3d4e5f6789 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 140, "isBestSeller": true}'
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {...}
}
```

---

### 5. Delete Product (Admin Only)
```http
DELETE /api/products/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/products/65a1b2c3d4e5f6789 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {...}
}
```

---

### 6. Toggle Product Status (Admin Only)
```http
PATCH /api/products/:id/toggle-status
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/products/65a1b2c3d4e5f6789/toggle-status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Product activated successfully",
  "data": {...}
}
```

---

### 7. Get Product Stats (Admin Only)
```http
GET /api/products/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl http://localhost:5000/api/products/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 8,
    "activeProducts": 8,
    "inactiveProducts": 0,
    "bestSellers": 4,
    "popularProducts": 2,
    "productsByCategory": [
      { "_id": "Dal & Curry", "count": 4 },
      { "_id": "Rice Dishes", "count": 1 },
      ...
    ]
  }
}
```

---

## Product Schema

```javascript
{
  name: String (required, 3-100 chars),
  description: String (required, max 500 chars),
  category: String (required, enum: ['Dal & Curry', 'Rice Dishes', 'Breads', 'Thalis', 'Snacks', 'Beverages']),
  price: Number (required, min: 1),
  originalPrice: Number (optional),
  subscriptionPrice: Number (required, min: 1),
  discount: Number (0-100, default: 0),
  rating: Number (0-5, default: 4.0),
  isVeg: Boolean (default: true),
  isBestSeller: Boolean (default: false),
  isPopular: Boolean (default: false),
  image: String (required),
  tags: [String] (default: []),
  isActive: Boolean (default: true),
  stock: Number (min: 0, default: 100),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Categories

1. Dal & Curry
2. Rice Dishes
3. Breads
4. Thalis
5. Snacks
6. Beverages

---

## Seed Data

Run this command to populate sample products:
```bash
npm run seed:products
```

Or:
```bash
cd apps/api
npx ts-node src/utils/seedProducts.ts
```

---

## Admin Authentication

To test admin endpoints, you need a JWT token from an admin user.

**Admin Email:** `admin@foodapp.com`

1. Register/Login with admin email
2. Get the JWT token
3. Use it in Authorization header

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No authentication token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Server error message"
}
```

---

## Testing with Postman

1. Create a new collection "Restaurant API"
2. Add environment variables:
   - `base_url`: http://localhost:5000
   - `admin_token`: (Get from login)
3. Import endpoints from this documentation
4. Test each endpoint

---

## Next Steps

After Products API:
1. Categories API
2. Orders API
3. Subscriptions API
4. Admin Dashboard API



