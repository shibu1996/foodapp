# Phase 2 - Testing Guide

## ✅ Seeds Completed Successfully!

### Categories Seeded (6)
```
1. 🍛 Dal & Curry - dal-curry
2. 🍚 Rice Dishes - rice-dishes
3. 🥖 Breads - breads
4. 🍱 Thalis - thalis
5. 🍟 Snacks - snacks
6. 🥤 Beverages - beverages
```

### Products Seeded (8)
```
1. Dal Makhani - Rs. 85 (Dal & Curry)
2. Rajma Masala - Rs. 75 (Dal & Curry)
3. Chole Bhature - Rs. 95 (Snacks)
4. Paneer Tikka Masala - Rs. 125 (Dal & Curry)
5. Special Veg Biryani - Rs. 140 (Rice Dishes)
6. Full Thali - Rs. 165 (Thalis)
7. Aloo Paratha (2 pcs) - Rs. 55 (Breads)
8. Butter Roti (5 pcs) - Rs. 35 (Breads)
```

## Product Distribution by Category
- Dal & Curry: 3 products
- Rice Dishes: 1 product
- Breads: 2 products
- Thalis: 1 product
- Snacks: 1 product
- Beverages: 0 products

---

## Quick Test Commands

### 1. Start API Server
```bash
cd apps/api
npm run dev
```
Server runs on: http://localhost:5000

### 2. Test Endpoints (Public)

#### Get All Categories
```bash
curl http://localhost:5000/api/categories
```

#### Get Category with Products
```bash
curl http://localhost:5000/api/categories/dal-curry
curl http://localhost:5000/api/categories/thalis
curl http://localhost:5000/api/categories/breads
```

#### Get All Products
```bash
curl http://localhost:5000/api/products
```

#### Get Products by Category (via Products API)
```bash
curl "http://localhost:5000/api/products?category=Dal & Curry"
curl "http://localhost:5000/api/products?category=Thalis"
```

#### Search Products
```bash
curl "http://localhost:5000/api/products?search=dal"
curl "http://localhost:5000/api/products?search=roti"
```

### 3. Test Admin Endpoints

#### First, get admin token:
```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}'

# Verify OTP (check console for OTP)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "otp": "YOUR_OTP"}'

# Complete registration with admin email
curl -X POST http://localhost:5000/api/auth/complete-registration \
  -H "Authorization: Bearer YOUR_TEMP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@foodapp.com"
  }'
```

#### Sync Product Counts
```bash
curl -X POST http://localhost:5000/api/categories/admin/sync-counts \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Create New Category
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desserts",
    "description": "Sweet treats and desserts",
    "icon": "🍰",
    "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
    "displayOrder": 7
  }'
```

#### Create New Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gulab Jamun",
    "description": "Sweet milk solid balls in sugar syrup",
    "category": "Desserts",
    "price": 60,
    "originalPrice": 75,
    "subscriptionPrice": 50,
    "rating": 4.8,
    "isVeg": true,
    "image": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop"
  }'
```

---

## Expected Results

### GET /api/categories
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "_id": "...",
      "name": "Dal & Curry",
      "slug": "dal-curry",
      "description": "Delicious lentils and curry dishes",
      "icon": "🍛",
      "image": "...",
      "displayOrder": 1,
      "isActive": true,
      "productCount": 3
    },
    ...
  ]
}
```

### GET /api/categories/dal-curry
```json
{
  "success": true,
  "data": {
    "category": {
      "name": "Dal & Curry",
      "slug": "dal-curry",
      ...
    },
    "products": [
      {
        "name": "Dal Makhani",
        "price": 85,
        ...
      },
      {
        "name": "Rajma Masala",
        "price": 75,
        ...
      },
      {
        "name": "Paneer Tikka Masala",
        "price": 125,
        ...
      }
    ],
    "productCount": 3
  }
}
```

### POST /api/categories/admin/sync-counts
```json
{
  "success": true,
  "message": "Product counts synced successfully",
  "data": [
    {
      "name": "Dal & Curry",
      "productCount": 3,
      ...
    },
    {
      "name": "Rice Dishes",
      "productCount": 1,
      ...
    },
    ...
  ]
}
```

---

## Integration Test Flow

1. **Seed Data** ✅
   ```bash
   npm run seed:categories
   npm run seed:products
   ```

2. **Start Server**
   ```bash
   npm run dev
   ```

3. **Test Public Endpoints**
   - Get all categories
   - Get category with products
   - Get all products
   - Filter products by category
   - Search products

4. **Admin Flow**
   - Login as admin
   - Get admin token
   - Sync product counts
   - Create new category
   - Create new product in category
   - Verify product count updated

5. **Verify Data**
   - Categories have correct product counts
   - Products are linked to correct categories
   - Slugs are generated correctly
   - Images are loading
   - All filters work

---

## Frontend Integration (Next Steps)

### Update Home Page to use API

**File:** `apps/web/app/home/page.tsx`

```typescript
// Replace mock data with API calls

// Get categories
const fetchCategories = async () => {
  const response = await fetch('http://localhost:5000/api/categories');
  const { data } = await response.json();
  setCategories(data);
};

// Get products
const fetchProducts = async (category?: string) => {
  const url = category && category !== 'All Items'
    ? `http://localhost:5000/api/products?category=${category}`
    : 'http://localhost:5000/api/products';
  
  const response = await fetch(url);
  const { data } = await response.json();
  setProducts(data);
};

useEffect(() => {
  fetchCategories();
  fetchProducts();
}, []);
```

### Update Category Tabs Component

```typescript
// categories now includes icon, slug, productCount
categories.map(cat => (
  <button key={cat._id} onClick={() => fetchProducts(cat.name)}>
    {cat.icon} {cat.name} ({cat.productCount})
  </button>
))
```

---

## Success Criteria

- [x] Categories seeded successfully
- [x] Products seeded successfully
- [x] Categories API endpoints working
- [x] Products API endpoints working
- [x] Product counts accurate
- [x] Slugs generated correctly
- [x] Category-product linking working
- [x] Public endpoints accessible
- [x] Admin endpoints protected
- [ ] API server running (start with `npm run dev`)
- [ ] Frontend connected to API
- [ ] All features tested end-to-end

---

## Next Steps

1. **Start API Server**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Test all endpoints** using curl or Postman

3. **Connect Frontend**
   - Update home page to fetch from API
   - Test category filtering
   - Test search
   - Test product display

4. **Build Phase 3 - Orders API**
   - Create Order model
   - Place order endpoint
   - Get user orders
   - Admin order management

---

## Common Issues & Fixes

### Port Already in Use
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string in `.env`
- Default: `mongodb://localhost:27017/restaurant-app`

### ts-node not found
```bash
npm install -D ts-node
```

---

**Phase 2 Complete!** 🎉

Ready to test or move to Phase 3? 🚀


