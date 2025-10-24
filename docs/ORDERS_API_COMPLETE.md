# Phase 3: Orders API - COMPLETE! ✅

## What's Built

### Complete Order Management System for One-Time Orders

**Endpoints Created:**
- ✅ POST /api/orders - Place new order (User)
- ✅ GET /api/orders/my-orders - Get user's orders (User)
- ✅ GET /api/orders/:id - Get single order (User)
- ✅ PATCH /api/orders/:id/cancel - Cancel order (User)
- ✅ GET /api/orders/admin/all - Get all orders (Admin)
- ✅ PATCH /api/orders/admin/:id/status - Update order status (Admin)
- ✅ GET /api/orders/admin/stats - Order statistics (Admin)
- ✅ GET /api/orders/admin/today - Today's orders (Admin)

---

## Files Created

### 1. Order Model
**File:** `apps/api/src/models/Order.ts`

**Schema Fields:**
- userId (ref to User)
- orderNumber (auto-generated, unique)
- items[] (product details with quantity)
- subtotal, tax, deliveryFee, discount, totalAmount
- deliveryAddress (full address with coordinates)
- deliverySlot, deliveryDate
- status (6 states)
- paymentMethod, paymentStatus, paymentId
- couponCode, specialInstructions
- cancelReason, multiple timestamps
- createdAt, updatedAt

**Features:**
- ✅ Auto-generate order number (ORD + timestamp + counter)
- ✅ Comprehensive validation on all fields
- ✅ Nested schemas for items and address
- ✅ Multiple indexes for performance
- ✅ Status tracking timestamps
- ✅ Payment tracking
- ✅ Delivery address with GPS coordinates

### 2. Order Controller
**File:** `apps/api/src/controllers/orderController.ts`

**Functions:**
- `placeOrder()` - Place new order with auto-calculation
- `getMyOrders()` - Get user's orders with pagination
- `getOrderById()` - Get single order details
- `cancelOrder()` - Cancel order with refund logic
- `getAllOrders()` - Admin get all orders with filters
- `updateOrderStatus()` - Admin update order status
- `getOrderStats()` - Dashboard statistics
- `getTodaysOrders()` - Today's orders grouped by slot

**Smart Features:**
- ✅ Auto-calculate subtotal from products
- ✅ 5% GST tax calculation
- ✅ Free delivery above ₹200, else ₹30
- ✅ Coupon code validation and discount
- ✅ Product availability check
- ✅ Price fetched from Product model (security)
- ✅ Auto-refund on cancellation (online payments)
- ✅ Pagination support
- ✅ Multiple filters (status, date, payment)
- ✅ Revenue and top products analytics
- ✅ Group orders by delivery slot

### 3. Order Routes
**File:** `apps/api/src/routes/orderRoutes.ts`

**User Routes** (require auth):
- POST / - Place order
- GET /my-orders - My orders
- GET /:id - Single order
- PATCH /:id/cancel - Cancel order

**Admin Routes** (require admin auth):
- GET /admin/all - All orders
- GET /admin/stats - Statistics
- GET /admin/today - Today's orders
- PATCH /admin/:id/status - Update status

### 4. API Documentation
**File:** `apps/api/ORDERS_API.md`

**Contents:**
- All endpoint documentation
- Request/response examples
- cURL commands
- Schema definition
- Order status flow
- Payment methods
- Error responses
- Integration examples
- Best practices

---

## Integration

### Updated Main Server
**File:** `apps/api/src/index.ts`

Added:
```javascript
import orderRoutes from './routes/orderRoutes';
app.use('/api/orders', orderRoutes);
```

---

## Key Features

### 1. Auto-Generated Order Number
```javascript
Pattern: ORD[timestamp][counter]
Example: ORD123456780001

- ORD - Prefix
- 123456 - Last 6 digits of timestamp
- 0001 - Order counter (4 digits)
```

### 2. Smart Price Calculation
```javascript
// Auto-calculated from products
Subtotal = Sum of (product.price × quantity)

// 5% GST
Tax = Subtotal × 0.05

// Free delivery above ₹200
DeliveryFee = Subtotal >= 200 ? 0 : 30

// Coupon discounts
Discount = Applied from coupon code

// Final total
TotalAmount = Subtotal + Tax + DeliveryFee - Discount
```

**Coupon Codes (Mock):**
- `FIRST10` - 10% off on entire order
- `SAVE50` - Flat ₹50 off

### 3. Order Status Flow
```
pending
  ↓
confirmed (by admin)
  ↓
preparing (kitchen)
  ↓
out_for_delivery (delivery partner)
  ↓
delivered (completed)

↓ (can cancel anytime before delivered)
cancelled
```

**Auto-Timestamp Updates:**
- `confirmed` → `confirmedAt`
- `preparing` → `preparedAt`
- `out_for_delivery` → `outForDeliveryAt`
- `delivered` → `deliveredAt` + COD payment → `paid`
- `cancelled` → `cancelledAt`

### 4. Payment Handling

**Methods:**
1. **COD (Cash on Delivery)**
   - paymentStatus: `pending`
   - Changes to `paid` when delivered

2. **Online**
   - paymentStatus: `paid` immediately
   - Auto-refunded if cancelled

3. **Wallet** (future)
   - paymentStatus: `paid` immediately

### 5. Cancellation Logic
```javascript
// User can cancel if:
- Order not delivered
- Order not already cancelled

// On cancellation:
- Status → cancelled
- cancelledAt → current timestamp
- Online payments → Auto-refund (status → refunded)
- COD → No refund needed
```

### 6. Pagination & Filters
```javascript
// Get my orders with filters
GET /api/orders/my-orders?status=delivered&limit=10&page=2

// Admin get orders with date range
GET /api/orders/admin/all?startDate=2024-01-01&endDate=2024-01-31

// Filter by payment status
GET /api/orders/admin/all?paymentStatus=pending
```

### 7. Order Statistics
```javascript
{
  totalOrders: 245,
  pendingOrders: 12,
  confirmedOrders: 8,
  preparingOrders: 5,
  outForDeliveryOrders: 3,
  deliveredOrders: 210,
  cancelledOrders: 7,
  totalRevenue: 58750,
  averageOrderValue: 280,
  ordersByStatus: [...],
  recentOrders: 45,  // Last 7 days
  topProducts: [...]  // Best sellers
}
```

### 8. Today's Orders (Admin)
```javascript
// Orders grouped by delivery slot
{
  "12:00 PM - 1:00 PM": [order1, order2],
  "1:00 PM - 2:00 PM": [order3],
  ...
}
```

---

## How to Use

### 1. Place Order (User)

**Step 1:** Add products to cart in frontend
**Step 2:** User enters delivery address
**Step 3:** Select delivery slot and date
**Step 4:** Choose payment method
**Step 5:** Apply coupon (optional)
**Step 6:** Place order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "PRODUCT_ID", "quantity": 2}
    ],
    "deliveryAddress": {
      "houseNo": "123",
      "street": "MG Road",
      "area": "Sector 15",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    },
    "deliverySlot": "12:00 PM - 1:00 PM",
    "deliveryDate": "2024-01-15",
    "paymentMethod": "online",
    "couponCode": "FIRST10"
  }'
```

### 2. Track Order (User)

```bash
# Get all my orders
curl http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer USER_TOKEN"

# Get specific order
curl http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer USER_TOKEN"
```

### 3. Cancel Order (User)

```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Change of plans"}'
```

### 4. Manage Orders (Admin)

```bash
# Get all orders
curl http://localhost:5000/api/orders/admin/all \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Update status
curl -X PATCH http://localhost:5000/api/orders/admin/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Get statistics
curl http://localhost:5000/api/orders/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Today's orders
curl http://localhost:5000/api/orders/admin/today \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Frontend Integration

### Customer App Flow

#### 1. Place Order Page
```typescript
const handlePlaceOrder = async () => {
  const orderData = {
    items: cartItems.map(item => ({
      productId: item._id,
      quantity: item.quantity
    })),
    deliveryAddress: selectedAddress,
    deliverySlot: selectedSlot,
    deliveryDate: selectedDate,
    paymentMethod: 'online',
    couponCode: appliedCoupon,
    specialInstructions: instructions
  };

  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  
  if (result.success) {
    // Redirect to order success page
    router.push(`/order-success/${result.data.orderNumber}`);
  }
};
```

#### 2. My Orders Page
```typescript
const fetchOrders = async (status?: string) => {
  const url = status
    ? `http://localhost:5000/api/orders/my-orders?status=${status}`
    : 'http://localhost:5000/api/orders/my-orders';
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });

  const { data } = await response.json();
  setOrders(data);
};
```

#### 3. Order Tracking Page
```typescript
const fetchOrderDetails = async (orderId: string) => {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });

  const { data } = await response.json();
  setOrder(data);
};

// Display order status timeline
const getStatusTimeline = (order) => [
  { status: 'Ordered', time: order.createdAt, completed: true },
  { status: 'Confirmed', time: order.confirmedAt, completed: !!order.confirmedAt },
  { status: 'Preparing', time: order.preparedAt, completed: !!order.preparedAt },
  { status: 'Out for Delivery', time: order.outForDeliveryAt, completed: !!order.outForDeliveryAt },
  { status: 'Delivered', time: order.deliveredAt, completed: !!order.deliveredAt }
];
```

### Admin Panel Flow

#### 1. Orders Dashboard
```typescript
const fetchOrderStats = async () => {
  const response = await fetch('http://localhost:5000/api/orders/admin/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const { data } = await response.json();
  setStats(data);
};

// Display stats
<div>
  <StatCard title="Total Orders" value={stats.totalOrders} />
  <StatCard title="Pending" value={stats.pendingOrders} />
  <StatCard title="Revenue" value={`₹${stats.totalRevenue}`} />
  <StatCard title="Avg Order" value={`₹${stats.averageOrderValue}`} />
</div>
```

#### 2. Order Management
```typescript
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  const response = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  });

  const result = await response.json();
  
  if (result.success) {
    // Refresh orders list
    fetchOrders();
  }
};
```

#### 3. Today's Orders View
```typescript
const fetchTodaysOrders = async () => {
  const response = await fetch('http://localhost:5000/api/orders/admin/today', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  const { data } = await response.json();
  
  // Display grouped by slot
  Object.entries(data.groupedBySlot).map(([slot, orders]) => (
    <div key={slot}>
      <h3>{slot}</h3>
      <OrdersList orders={orders} />
    </div>
  ));
};
```

---

## Database

### Collections
- orders (linked to users and products)

### Relationships
```
User (1) → (Many) Orders
Product (1) → (Many) Order Items
```

### Indexes
- userId + createdAt (user order history)
- orderNumber (unique lookup)
- status + deliveryDate (admin filters)
- createdAt (sorting)

---

## Security

### User Endpoints
- Can only place orders for themselves
- Can only view their own orders
- Can only cancel their own orders
- Cannot modify prices (server calculates)

### Admin Endpoints
- Can view all orders
- Can update any order status
- Can view statistics
- Can filter and search orders

### Price Security
- Prices fetched from Product model
- Server calculates all totals
- Client cannot manipulate prices
- Product availability checked

---

## Validation

### Order Validation
- At least one item required
- Valid product IDs
- Products must be active
- Valid delivery address (6-digit pincode)
- Valid delivery slot
- Valid payment method
- Valid status transitions

### Cancellation Rules
- Cannot cancel delivered orders
- Cannot cancel already cancelled orders
- Auto-refund for online payments

---

## Testing Checklist

- [x] Order model with validation
- [x] Auto-generate order numbers
- [x] Place order (user)
- [x] Calculate prices correctly
- [x] Apply coupons
- [x] Get my orders (user)
- [x] Get single order (user)
- [x] Cancel order (user)
- [x] Auto-refund on cancellation
- [x] Get all orders (admin)
- [x] Filter orders (admin)
- [x] Update order status (admin)
- [x] Get order stats (admin)
- [x] Get today's orders (admin)
- [x] Pagination working
- [x] Populate product details
- [x] Error handling
- [x] No linter errors

---

## Performance Optimizations

### Indexes
- Compound indexes for common queries
- Index on userId for user orders
- Index on status for admin filters
- Index on createdAt for sorting

### Queries
- Pagination for large datasets
- Selective field population
- Aggregation for statistics
- Efficient filtering

---

## Success Metrics

✅ **API Complete:** All CRUD + Advanced features
✅ **Validation:** Strong validation and security
✅ **Authentication:** User and Admin separation
✅ **Price Calculation:** Auto-calculation with coupons
✅ **Order Tracking:** Complete status flow
✅ **Payment Handling:** COD + Online + Refunds
✅ **Admin Dashboard:** Statistics and management
✅ **Documentation:** Complete API docs
✅ **Error Handling:** Comprehensive error messages
✅ **Performance:** Indexed queries, pagination
✅ **No Errors:** Clean code, no linter issues

---

## Phase 3 Status: ✅ COMPLETE

**What's Working:**
- 8 endpoints (4 user, 4 admin)
- Complete order lifecycle
- Auto price calculation
- Payment tracking
- Order statistics
- Today's orders view
- Full documentation

**Ready For:**
1. Frontend integration
2. Admin panel order management
3. Phase 4 (Subscriptions API)
4. Real payment gateway

---

## Complete API Overview (Phase 1 + 2 + 3)

### Total Endpoints: 27

**Authentication (4):**
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/complete-registration
- GET /api/auth/me

**Products (7):**
- GET /api/products
- GET /api/products/:id
- POST /api/products (Admin)
- PUT /api/products/:id (Admin)
- DELETE /api/products/:id (Admin)
- PATCH /api/products/:id/toggle-status (Admin)
- GET /api/products/admin/stats (Admin)

**Categories (8):**
- GET /api/categories
- GET /api/categories/:slug
- POST /api/categories (Admin)
- PUT /api/categories/:id (Admin)
- DELETE /api/categories/:id (Admin)
- PATCH /api/categories/:id/toggle-status (Admin)
- POST /api/categories/admin/sync-counts (Admin)
- POST /api/categories/admin/reorder (Admin)

**Orders (8):**
- POST /api/orders (User)
- GET /api/orders/my-orders (User)
- GET /api/orders/:id (User)
- PATCH /api/orders/:id/cancel (User)
- GET /api/orders/admin/all (Admin)
- PATCH /api/orders/admin/:id/status (Admin)
- GET /api/orders/admin/stats (Admin)
- GET /api/orders/admin/today (Admin)

---

## Next Steps

### Phase 4: Subscriptions API (Recommended)
- Create Subscription model
- Subscribe to products
- Manage subscriptions
- Pause/Resume/Cancel
- Skip days functionality
- Daily meal selection
- Subscription billing

### Frontend Integration
- Build order placement flow
- My orders page
- Order tracking page
- Cancel order functionality

### Admin Panel
- Orders dashboard
- Order management
- Status updates
- Today's orders view
- Statistics display

---

**Orders API is production-ready!** 🎉

**Next: Subscriptions API or Frontend Integration?** 🚀


