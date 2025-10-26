# Orders API Documentation

## Base URL
```
http://localhost:5000/api/orders
```

## Overview

The Orders API handles one-time food orders with complete order lifecycle management, from placing to delivery tracking.

---

## Endpoints

### User Endpoints (Require Authentication)

#### 1. Place Order
```http
POST /api/orders
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "productId": "65a1b2c3d4e5f6789",
      "quantity": 2
    },
    {
      "productId": "65a1b2c3d4e5f6790",
      "quantity": 1
    }
  ],
  "deliveryAddress": {
    "houseNo": "123",
    "street": "MG Road",
    "area": "Sector 15",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "landmark": "Near Metro Station",
    "latitude": 28.5355,
    "longitude": 77.3910
  },
  "deliverySlot": "12:00 PM - 1:00 PM",
  "deliveryDate": "2024-01-15",
  "paymentMethod": "online",
  "couponCode": "FIRST10",
  "specialInstructions": "Please ring the bell twice"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "userId": "65a1b2c3d4e5f6788",
    "orderNumber": "ORD123456789",
    "items": [
      {
        "productId": "65a1b2c3d4e5f6789",
        "productName": "Dal Makhani",
        "price": 85,
        "quantity": 2,
        "total": 170
      }
    ],
    "subtotal": 295,
    "tax": 15,
    "deliveryFee": 0,
    "discount": 30,
    "totalAmount": 280,
    "deliveryAddress": {...},
    "deliverySlot": "12:00 PM - 1:00 PM",
    "deliveryDate": "2024-01-15",
    "status": "pending",
    "paymentMethod": "online",
    "paymentStatus": "paid",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

**Pricing Logic:**
- Subtotal = Sum of (price × quantity) for all items
- Tax = 5% GST on subtotal
- Delivery Fee = ₹30 (Free if subtotal >= ₹200)
- Discount = Applied from coupon code
- Total Amount = Subtotal + Tax + Delivery Fee - Discount

**Coupon Codes (Mock):**
- `FIRST10` - 10% off on order
- `SAVE50` - Flat ₹50 off

---

#### 2. Get My Orders
```http
GET /api/orders/my-orders
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, preparing, out_for_delivery, delivered, cancelled)
- `limit` (optional): Results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Example:**
```bash
curl http://localhost:5000/api/orders/my-orders?status=delivered&limit=5&page=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 12,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789",
      "orderNumber": "ORD123456789",
      "items": [...],
      "totalAmount": 280,
      "status": "delivered",
      "deliveryDate": "2024-01-10",
      "deliveredAt": "2024-01-10T13:30:00.000Z",
      ...
    },
    ...
  ]
}
```

---

#### 3. Get Single Order
```http
GET /api/orders/:id
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Example:**
```bash
curl http://localhost:5000/api/orders/65a1b2c3d4e5f6789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "orderNumber": "ORD123456789",
    "items": [
      {
        "productId": {
          "_id": "...",
          "name": "Dal Makhani",
          "image": "...",
          "category": "Dal & Curry"
        },
        "productName": "Dal Makhani",
        "price": 85,
        "quantity": 2,
        "total": 170
      }
    ],
    "subtotal": 295,
    "tax": 15,
    "deliveryFee": 0,
    "discount": 30,
    "totalAmount": 280,
    "deliveryAddress": {...},
    "deliverySlot": "12:00 PM - 1:00 PM",
    "deliveryDate": "2024-01-10",
    "status": "delivered",
    "paymentMethod": "online",
    "paymentStatus": "paid",
    "specialInstructions": "Please ring the bell twice",
    "confirmedAt": "2024-01-10T10:05:00.000Z",
    "preparedAt": "2024-01-10T11:30:00.000Z",
    "outForDeliveryAt": "2024-01-10T12:00:00.000Z",
    "deliveredAt": "2024-01-10T13:30:00.000Z",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

---

#### 4. Cancel Order
```http
PATCH /api/orders/:id/cancel
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Change of plans"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/orders/65a1b2c3d4e5f6789/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Change of plans"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "status": "cancelled",
    "cancelReason": "Change of plans",
    "cancelledAt": "2024-01-10T10:30:00.000Z",
    "paymentStatus": "refunded",
    ...
  }
}
```

**Rules:**
- Cannot cancel delivered orders
- Cannot cancel already cancelled orders
- Online payments are automatically refunded on cancellation

---

### Admin Endpoints (Require Admin Authentication)

#### 5. Get All Orders
```http
GET /api/orders/admin/all
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `paymentStatus` (optional): Filter by payment status
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `limit` (optional): Results per page (default: 20)
- `page` (optional): Page number (default: 1)

**Example:**
```bash
curl "http://localhost:5000/api/orders/admin/all?status=pending&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6789",
      "userId": {
        "_id": "...",
        "name": "John Doe",
        "phoneNumber": "+919876543210",
        "email": "john@example.com"
      },
      "orderNumber": "ORD123456789",
      "items": [...],
      "totalAmount": 280,
      "status": "pending",
      "deliveryDate": "2024-01-15",
      ...
    },
    ...
  ]
}
```

---

#### 6. Update Order Status
```http
PATCH /api/orders/admin/:id/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `pending` - Order placed, waiting confirmation
- `confirmed` - Order confirmed by restaurant
- `preparing` - Food is being prepared
- `out_for_delivery` - Order out for delivery
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/orders/admin/65a1b2c3d4e5f6789/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated to confirmed",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "status": "confirmed",
    "confirmedAt": "2024-01-10T10:05:00.000Z",
    ...
  }
}
```

**Automatic Timestamp Updates:**
- `confirmed` → Sets `confirmedAt`
- `preparing` → Sets `preparedAt`
- `out_for_delivery` → Sets `outForDeliveryAt`
- `delivered` → Sets `deliveredAt` + Updates COD payment to 'paid'
- `cancelled` → Sets `cancelledAt`

---

#### 7. Get Order Statistics
```http
GET /api/orders/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl http://localhost:5000/api/orders/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 245,
    "pendingOrders": 12,
    "confirmedOrders": 8,
    "preparingOrders": 5,
    "outForDeliveryOrders": 3,
    "deliveredOrders": 210,
    "cancelledOrders": 7,
    "totalRevenue": 58750,
    "averageOrderValue": 280,
    "ordersByStatus": [
      {
        "_id": "delivered",
        "count": 210,
        "totalAmount": 58750
      },
      ...
    ],
    "recentOrders": 45,
    "topProducts": [
      {
        "_id": "Dal Makhani",
        "totalQuantity": 120,
        "totalRevenue": 10200
      },
      ...
    ]
  }
}
```

---

#### 8. Get Today's Orders
```http
GET /api/orders/admin/today
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl http://localhost:5000/api/orders/admin/today \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": {
    "orders": [...],
    "groupedBySlot": {
      "12:00 PM - 1:00 PM": [
        {...order1},
        {...order2}
      ],
      "1:00 PM - 2:00 PM": [
        {...order3}
      ],
      ...
    }
  }
}
```

---

## Order Schema

```javascript
{
  userId: ObjectId (ref: User, required),
  orderNumber: String (unique, auto-generated),
  items: [
    {
      productId: ObjectId (ref: Product),
      productName: String,
      price: Number,
      quantity: Number,
      total: Number
    }
  ],
  subtotal: Number,
  tax: Number (5% GST),
  deliveryFee: Number (₹30 or free),
  discount: Number,
  totalAmount: Number,
  deliveryAddress: {
    houseNo: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String (6 digits),
    landmark: String (optional),
    latitude: Number (optional),
    longitude: Number (optional)
  },
  deliverySlot: String,
  deliveryDate: Date,
  status: Enum (pending, confirmed, preparing, out_for_delivery, delivered, cancelled),
  paymentMethod: Enum (cod, online, wallet),
  paymentStatus: Enum (pending, paid, failed, refunded),
  paymentId: String (optional),
  couponCode: String (optional),
  specialInstructions: String (max 500 chars),
  cancelReason: String (optional),
  cancelledAt: Date (optional),
  confirmedAt: Date (optional),
  preparedAt: Date (optional),
  outForDeliveryAt: Date (optional),
  deliveredAt: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Order Number Format

**Pattern:** `ORD[timestamp][counter]`

**Example:** `ORD123456780001`
- ORD - Prefix
- 123456 - Last 6 digits of timestamp
- 0001 - Order counter (padded to 4 digits)

Auto-generated on order creation.

---

## Payment Methods

1. **COD (Cash on Delivery)**
   - Payment status: `pending`
   - Changes to `paid` when status → `delivered`

2. **Online**
   - Payment status: `paid` (immediately)
   - Refunded if order cancelled

3. **Wallet**
   - Payment status: `paid` (immediately)
   - Future implementation

---

## Order Status Flow

```
pending → confirmed → preparing → out_for_delivery → delivered
   ↓
cancelled (any time before delivered)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Order must have at least one item"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No authentication token provided"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found: 65a1b2c3d4e5f6789"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Failed to place order"
}
```

---

## Testing with cURL

### Place Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "PRODUCT_ID_1", "quantity": 2},
      {"productId": "PRODUCT_ID_2", "quantity": 1}
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
    "paymentMethod": "cod"
  }'
```

### Get My Orders
```bash
curl http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer USER_TOKEN"
```

### Cancel Order
```bash
curl -X PATCH http://localhost:5000/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Change of plans"}'
```

### Update Status (Admin)
```bash
curl -X PATCH http://localhost:5000/api/orders/admin/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## Integration Examples

### Frontend (Customer App)

```typescript
// Place order
const placeOrder = async (orderData: any) => {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  return response.json();
};

// Get my orders
const getMyOrders = async () => {
  const response = await fetch('http://localhost:5000/api/orders/my-orders', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  return response.json();
};

// Cancel order
const cancelOrder = async (orderId: string, reason: string) => {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  return response.json();
};
```

### Admin Panel

```typescript
// Get all orders
const getAllOrders = async (filters: any) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:5000/api/orders/admin/all?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};

// Update order status
const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};

// Get stats
const getOrderStats = async () => {
  const response = await fetch('http://localhost:5000/api/orders/admin/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};
```

---

## Best Practices

1. **Validate Products** - Always check product availability before placing order
2. **Calculate Totals** - Server calculates all prices, don't trust client
3. **Track Status** - Update order status at each stage
4. **Handle Cancellations** - Refund online payments automatically
5. **Delivery Slots** - Group orders by time slots
6. **Error Handling** - Provide clear error messages
7. **Pagination** - Use pagination for order lists
8. **Filters** - Filter orders by status, date, payment

---

## Performance

### Indexes
- `userId + createdAt` (user order history)
- `orderNumber` (unique lookup)
- `status + deliveryDate` (admin dashboard)
- `createdAt` (sorting)

### Optimizations
- Populate only required fields
- Pagination for large datasets
- Aggregate for statistics
- Index frequently queried fields

---

## Next Steps

- Real payment gateway integration (Razorpay)
- Order notifications (SMS/Email)
- Real-time order tracking
- Delivery partner assignment
- Order ratings and reviews

---

**Orders API is ready!** 🎉






