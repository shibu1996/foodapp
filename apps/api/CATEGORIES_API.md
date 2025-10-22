# Categories API Documentation

## Base URL
```
http://localhost:5000/api/categories
```

## Endpoints

### 1. Get All Categories (Public)
```http
GET /api/categories
```

**Query Parameters:**
- `isActive` (optional): Filter by active status (default: "true")

**Example:**
```bash
curl http://localhost:5000/api/categories
curl http://localhost:5000/api/categories?isActive=false
```

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789",
      "name": "Dal & Curry",
      "slug": "dal-curry",
      "description": "Delicious lentils and curry dishes",
      "icon": "🍛",
      "image": "https://images.unsplash.com/...",
      "displayOrder": 1,
      "isActive": true,
      "productCount": 4,
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    },
    ...
  ]
}
```

---

### 2. Get Category by Slug/ID (Public)
```http
GET /api/categories/:slug
```

**Parameters:**
- `slug` - Category slug (e.g., "dal-curry") or ObjectId

**Example:**
```bash
curl http://localhost:5000/api/categories/dal-curry
curl http://localhost:5000/api/categories/65a1b2c3d4e5f6789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "_id": "65a1b2c3d4e5f6789",
      "name": "Dal & Curry",
      "slug": "dal-curry",
      ...
    },
    "products": [...],
    "productCount": 4
  }
}
```

---

### 3. Create Category (Admin Only)
```http
POST /api/categories
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Desserts",
  "description": "Sweet treats and desserts",
  "icon": "🍰",
  "image": "https://images.unsplash.com/...",
  "displayOrder": 7
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desserts",
    "description": "Sweet treats and desserts",
    "icon": "🍰",
    "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    "displayOrder": 7
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6790",
    "name": "Desserts",
    "slug": "desserts",
    ...
  }
}
```

---

### 4. Update Category (Admin Only)
```http
PUT /api/categories/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:** (Any fields to update)
```json
{
  "description": "Updated description",
  "displayOrder": 10,
  "icon": "🎂"
}
```

**Example:**
```bash
curl -X PUT http://localhost:5000/api/categories/65a1b2c3d4e5f6789 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayOrder": 10}'
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {...}
}
```

**Note:** If you update the category name, all products in that category will be automatically updated.

---

### 5. Delete Category (Admin Only)
```http
DELETE /api/categories/:id
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/categories/65a1b2c3d4e5f6789 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {...}
}
```

**Note:** Cannot delete a category that has products. You must reassign or delete products first.

**Error Response:**
```json
{
  "success": false,
  "error": "Cannot delete category with 4 products. Please reassign or delete products first."
}
```

---

### 6. Toggle Category Status (Admin Only)
```http
PATCH /api/categories/:id/toggle-status
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/categories/65a1b2c3d4e5f6789/toggle-status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Category activated successfully",
  "data": {...}
}
```

---

### 7. Sync Product Counts (Admin Only)
```http
POST /api/categories/admin/sync-counts
```

Updates product count for all categories by counting active products.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/categories/admin/sync-counts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Product counts synced successfully",
  "data": [...]
}
```

---

### 8. Reorder Categories (Admin Only)
```http
POST /api/categories/admin/reorder
```

Change the display order of categories.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "categoryIds": [
    "65a1b2c3d4e5f6789",
    "65a1b2c3d4e5f6790",
    "65a1b2c3d4e5f6791",
    ...
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/categories/admin/reorder \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryIds": ["id1", "id2", "id3"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Categories reordered successfully",
  "data": [...]
}
```

---

## Category Schema

```javascript
{
  name: String (required, unique, 2-50 chars),
  slug: String (auto-generated from name),
  description: String (max 200 chars),
  icon: String (emoji, default: '🍛'),
  image: String (required),
  displayOrder: Number (default: 0),
  isActive: Boolean (default: true),
  productCount: Number (default: 0, auto-synced),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Default Categories

1. **Dal & Curry** 🍛 - Delicious lentils and curry dishes
2. **Rice Dishes** 🍚 - Aromatic rice and biryani
3. **Breads** 🥖 - Freshly made rotis and parathas
4. **Thalis** 🍱 - Complete meal combos
5. **Snacks** 🍟 - Quick bites and snacks
6. **Beverages** 🥤 - Refreshing drinks

---

## Seed Data

Run these commands to populate categories:

```bash
# Seed categories only
npm run seed:categories

# Seed both categories and products
npm run seed:all
```

**Order matters:** Categories should be seeded before products for proper linking.

---

## Features

### Auto-generated Slug
When you create a category with name "Dal & Curry", slug is automatically generated as "dal-curry".

### Product Count Sync
The `productCount` field is automatically updated when you:
- Run `POST /api/categories/admin/sync-counts`
- Seed categories with `npm run seed:categories`

### Smart Category Deletion
You cannot delete a category that has products. This prevents orphaned products.

### Category Name Change Cascade
When you update a category name, all products in that category are automatically updated with the new category name.

---

## Integration with Products API

### Get Products by Category
```bash
# Using category name
curl http://localhost:5000/api/products?category=Dal%20%26%20Curry

# Get category with products
curl http://localhost:5000/api/categories/dal-curry
```

### Display Order
Categories are returned in `displayOrder` ascending order (1, 2, 3...).

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Category with this name already exists"
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
  "error": "Category not found"
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

### Collection Setup
1. Create folder "Categories API"
2. Add environment variables:
   - `base_url`: http://localhost:5000
   - `admin_token`: (Get from login)
3. Import all endpoints

### Test Flow
1. Seed categories: `npm run seed:categories`
2. Get all categories (Public)
3. Get single category with products (Public)
4. Login as admin
5. Create new category (Admin)
6. Update category (Admin)
7. Reorder categories (Admin)
8. Sync product counts (Admin)
9. Toggle status (Admin)
10. Try to delete category with products (Should fail)

---

## Use Cases

### Customer App (Frontend)
```javascript
// Get all categories for navigation
const response = await fetch('http://localhost:5000/api/categories');
const { data: categories } = await response.json();

// Get category with products
const response = await fetch('http://localhost:5000/api/categories/thalis');
const { data } = await response.json();
console.log(data.category, data.products);
```

### Admin Panel
```javascript
// Create category
await fetch('http://localhost:5000/api/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'New Category',
    description: 'Description',
    icon: '🍜',
    image: 'https://...'
  })
});

// Sync product counts
await fetch('http://localhost:5000/api/categories/admin/sync-counts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
```

---

## Best Practices

1. **Always sync product counts** after bulk product operations
2. **Use slugs** for URLs (SEO-friendly)
3. **Set displayOrder** to control category order in UI
4. **Seed categories first** before products
5. **Don't delete** categories with products
6. **Use icons** for better UI experience

---

## Performance

### Indexes
- `slug` (unique, faster lookups)
- `displayOrder + isActive` (optimized listing)

### Optimizations
- Categories are cached-friendly (rarely change)
- Product count is denormalized for faster queries
- Slug-based URLs are SEO-friendly

---

## Next Steps

After Categories API:
1. **Orders API** - Place and manage orders
2. **Subscriptions API** - Subscription management
3. **Admin Dashboard** - Complete admin panel

---

## Quick Reference

```bash
# Public Endpoints
GET    /api/categories              # List all
GET    /api/categories/:slug        # Get one with products

# Admin Endpoints (require auth)
POST   /api/categories              # Create
PUT    /api/categories/:id          # Update
DELETE /api/categories/:id          # Delete
PATCH  /api/categories/:id/toggle-status
POST   /api/categories/admin/sync-counts
POST   /api/categories/admin/reorder
```

---

**Categories API is ready!** 🎉

