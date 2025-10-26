# Subscriptions API Documentation

## Base URL
```
http://localhost:5000/api/subscriptions
```

## Overview

The Subscriptions API handles recurring food delivery subscriptions with duration-based plans, pause/resume functionality, skip days, add-ons, and comprehensive subscription management.

---

## Endpoints

### User Endpoints (Require Authentication)

#### 1. Create Subscription
```http
POST /api/subscriptions
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "productId": "65a1b2c3d4e5f6789",
  "duration": 30,
  "startDate": "2024-01-15",
  "deliverySlot": "12:00 PM - 1:00 PM",
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
  "addons": [
    {
      "name": "Salad",
      "price": 10
    },
    {
      "name": "Curd",
      "price": 15
    }
  ],
  "dailyMeals": [
    {
      "date": "2024-01-15",
      "productId": "65a1b2c3d4e5f6789",
      "productName": "Dal Makhani"
    }
  ],
  "paymentMethod": "online",
  "couponCode": "SUB20",
  "specialInstructions": "Please ring the bell twice",
  "autoRenewal": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "userId": "65a1b2c3d4e5f6788",
    "subscriptionNumber": "SUB123456780001",
    "productId": "65a1b2c3d4e5f6789",
    "productName": "Dal Makhani",
    "basePrice": 72,
    "duration": 30,
    "startDate": "2024-01-15",
    "endDate": "2024-02-13",
    "deliverySlot": "12:00 PM - 1:00 PM",
    "deliveryAddress": {...},
    "addons": [...],
    "skipDays": [],
    "dailyMeals": [...],
    "maxSkipDays": 5,
    "status": "active",
    "subtotal": 2160,
    "addonsTotal": 750,
    "discount": 437,
    "totalAmount": 2473,
    "paidAmount": 2473,
    "pendingAmount": 0,
    "paymentMethod": "online",
    "paymentStatus": "paid",
    "autoRenewal": false,
    "deliveryCount": 30,
    "completedDeliveries": 0,
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

**Pricing Logic:**
```javascript
basePrice = product.subscriptionPrice (from Product model)
subtotal = basePrice × duration

// Addons (applied per day)
addonsTotal = sum of (addon.price × duration)

// Duration-based discount
if (duration === 7) discount = 5%
if (duration === 15) discount = 10%
if (duration === 30) discount = 15%
else discount = 0% (custom duration)

// Coupon codes
if (couponCode === 'SUB20') additional 20% off
if (couponCode === 'SAVE100') flat ₹100 off

totalAmount = subtotal + addonsTotal - discount
```

**Max Skip Days (Auto-calculated):**
- 7 days → 2 skip days
- 15 days → 3 skip days
- 30 days → 5 skip days
- Custom → 15% of duration

---

#### 2. Get My Subscriptions
```http
GET /api/subscriptions/my-subscriptions
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (active, paused, cancelled, completed, expired)
- `limit` (optional): Results per page (default: 10)
- `page` (optional): Page number (default: 1)

**Example:**
```bash
curl http://localhost:5000/api/subscriptions/my-subscriptions?status=active&limit=5 \
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
      "subscriptionNumber": "SUB123456780001",
      "productName": "Dal Makhani",
      "duration": 30,
      "status": "active",
      "startDate": "2024-01-15",
      "endDate": "2024-02-13",
      "totalAmount": 2473,
      "deliverySlot": "12:00 PM - 1:00 PM",
      ...
    },
    ...
  ]
}
```

---

#### 3. Get Single Subscription
```http
GET /api/subscriptions/:id
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Example:**
```bash
curl http://localhost:5000/api/subscriptions/65a1b2c3d4e5f6789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "subscriptionNumber": "SUB123456780001",
    "productId": {
      "_id": "...",
      "name": "Dal Makhani",
      "image": "...",
      "category": "Dal & Curry",
      "description": "..."
    },
    "productName": "Dal Makhani",
    "duration": 30,
    "startDate": "2024-01-15",
    "endDate": "2024-02-13",
    "deliverySlot": "12:00 PM - 1:00 PM",
    "deliveryAddress": {...},
    "addons": [...],
    "skipDays": [...],
    "maxSkipDays": 5,
    "status": "active",
    "subtotal": 2160,
    "addonsTotal": 750,
    "discount": 437,
    "totalAmount": 2473,
    "paidAmount": 2473,
    "pendingAmount": 0,
    "deliveryCount": 30,
    "completedDeliveries": 5,
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

---

#### 4. Pause Subscription
```http
PATCH /api/subscriptions/:id/pause
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Going on vacation"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/subscriptions/65a1b2c3d4e5f6789/pause \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Going on vacation"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription paused successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "status": "paused",
    "pausedAt": "2024-01-20T10:00:00.000Z",
    "pauseReason": "Going on vacation",
    ...
  }
}
```

**Rules:**
- Can only pause active subscriptions
- Deliveries will not be made during pause period
- Can resume anytime before expiry

---

#### 5. Resume Subscription
```http
PATCH /api/subscriptions/:id/resume
```

**Headers:**
```
Authorization: Bearer <user_token>
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/subscriptions/65a1b2c3d4e5f6789/resume \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription resumed successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "status": "active",
    "resumedAt": "2024-01-25T10:00:00.000Z",
    ...
  }
}
```

**Rules:**
- Can only resume paused subscriptions
- Cannot resume if subscription has expired

---

#### 6. Cancel Subscription
```http
PATCH /api/subscriptions/:id/cancel
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Not satisfied with quality"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/subscriptions/65a1b2c3d4e5f6789/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Not satisfied with quality"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "status": "cancelled",
    "cancelledAt": "2024-01-20T10:00:00.000Z",
    "cancelReason": "Not satisfied with quality",
    "paymentStatus": "refunded",
    ...
  }
}
```

**Refund Logic:**
```javascript
// Calculate remaining days
remainingDays = endDate - today

// Calculate per-day cost
perDayCost = totalAmount / duration

// Refund amount (for online payments only)
refund = perDayCost × remainingDays

// Payment status → refunded
```

**Rules:**
- Cannot cancel completed subscriptions
- Online payments are refunded for remaining days
- COD subscriptions have no refund

---

#### 7. Skip a Day
```http
PATCH /api/subscriptions/:id/skip-day
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "date": "2024-01-20",
  "reason": "Out of town"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/subscriptions/65a1b2c3d4e5f6789/skip-day \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-20", "reason": "Out of town"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Day skipped successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "skipDays": [
      {
        "date": "2024-01-20",
        "reason": "Out of town"
      }
    ],
    "endDate": "2024-02-14",
    ...
  }
}
```

**Rules:**
- Can skip up to `maxSkipDays` (2, 3, or 5 depending on duration)
- Date must be within subscription period
- Cannot skip same day twice
- End date automatically extended by 1 day for each skip

---

#### 8. Modify Subscription
```http
PATCH /api/subscriptions/:id/modify
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Body:**
```json
{
  "deliverySlot": "1:00 PM - 2:00 PM",
  "deliveryAddress": {
    "houseNo": "456",
    "street": "New Street",
    "area": "Sector 20",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110002"
  },
  "addons": [
    {
      "name": "Salad",
      "price": 10
    }
  ],
  "specialInstructions": "Leave at door"
}
```

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/subscriptions/65a1b2c3d4e5f6789/modify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deliverySlot": "1:00 PM - 2:00 PM"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription modified successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "deliverySlot": "1:00 PM - 2:00 PM",
    "addons": [...],
    "totalAmount": 2300,
    ...
  }
}
```

**Modifiable Fields:**
- deliverySlot
- deliveryAddress
- addons (recalculates total)
- specialInstructions

**Rules:**
- Can only modify active subscriptions
- Changing addons recalculates total amount
- Cannot modify product or duration

---

### Admin Endpoints (Require Admin Authentication)

#### 9. Get All Subscriptions
```http
GET /api/subscriptions/admin/all
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (optional): Filter by status
- `startDate` (optional): Start date filter (YYYY-MM-DD)
- `endDate` (optional): End date filter (YYYY-MM-DD)
- `limit` (optional): Results per page (default: 20)
- `page` (optional): Page number (default: 1)

**Example:**
```bash
curl "http://localhost:5000/api/subscriptions/admin/all?status=active&limit=10" \
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
      "subscriptionNumber": "SUB123456780001",
      "productName": "Dal Makhani",
      "duration": 30,
      "status": "active",
      "totalAmount": 2473,
      ...
    },
    ...
  ]
}
```

---

#### 10. Update Subscription Status
```http
PATCH /api/subscriptions/admin/:id/status
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "completed"
}
```

**Valid Statuses:**
- `active` - Subscription is active
- `paused` - Temporarily paused
- `cancelled` - Cancelled by user/admin
- `completed` - Successfully completed
- `expired` - Expired (end date passed)

**Example:**
```bash
curl -X PATCH http://localhost:5000/api/subscriptions/admin/65a1b2c3d4e5f6789/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription status updated to completed",
  "data": {
    "_id": "65a1b2c3d4e5f6789",
    "status": "completed",
    "completedAt": "2024-02-13T10:00:00.000Z",
    ...
  }
}
```

---

#### 11. Get Subscription Statistics
```http
GET /api/subscriptions/admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl http://localhost:5000/api/subscriptions/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubscriptions": 150,
    "activeSubscriptions": 85,
    "pausedSubscriptions": 12,
    "cancelledSubscriptions": 18,
    "completedSubscriptions": 35,
    "totalRevenue": 187500,
    "pendingRevenue": 45000,
    "averageSubscriptionValue": 2500,
    "subscriptionsByDuration": [
      {
        "_id": 7,
        "count": 30,
        "totalRevenue": 45000
      },
      {
        "_id": 15,
        "count": 45,
        "totalRevenue": 90000
      },
      {
        "_id": 30,
        "count": 75,
        "totalRevenue": 187500
      }
    ],
    "popularProducts": [
      {
        "_id": "Dal Makhani",
        "subscriptionCount": 45,
        "totalRevenue": 90000
      },
      ...
    ],
    "upcomingRenewals": 12
  }
}
```

---

#### 12. Get Today's Deliveries
```http
GET /api/subscriptions/admin/today
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl http://localhost:5000/api/subscriptions/admin/today \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 65,
  "data": {
    "subscriptions": [...],
    "groupedBySlot": {
      "12:00 PM - 1:00 PM": [
        {
          "_id": "...",
          "userId": {
            "name": "John Doe",
            "phoneNumber": "+919876543210"
          },
          "productName": "Dal Makhani",
          "deliveryAddress": {...}
        },
        ...
      ],
      "1:00 PM - 2:00 PM": [...],
      ...
    }
  }
}
```

**Features:**
- Filters active subscriptions for today
- Excludes skipped days
- Groups by delivery slot
- Includes user and product details

---

## Subscription Schema

```javascript
{
  userId: ObjectId (ref: User, required),
  subscriptionNumber: String (unique, auto-generated),
  productId: ObjectId (ref: Product, required),
  productName: String (required),
  basePrice: Number (subscription price per day),
  duration: Number (days, required),
  startDate: Date (required),
  endDate: Date (auto-calculated),
  deliverySlot: String (required),
  deliveryAddress: {
    houseNo, street, area, city, state, pincode,
    landmark, latitude, longitude
  },
  addons: [
    {
      name: String,
      price: Number
    }
  ],
  skipDays: [
    {
      date: Date,
      reason: String
    }
  ],
  dailyMeals: [
    {
      date: Date,
      productId: ObjectId,
      productName: String
    }
  ],
  maxSkipDays: Number (auto-calculated),
  status: Enum (active, paused, cancelled, completed, expired),
  pausedAt: Date,
  pauseReason: String,
  resumedAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  completedAt: Date,
  subtotal: Number,
  addonsTotal: Number,
  discount: Number,
  totalAmount: Number,
  paidAmount: Number,
  pendingAmount: Number (auto-calculated),
  couponCode: String,
  paymentMethod: Enum (cod, online, wallet),
  paymentStatus: Enum (pending, partial, paid, refunded),
  paymentId: String,
  autoRenewal: Boolean (default: false),
  deliveryCount: Number (total deliveries),
  completedDeliveries: Number (delivered so far),
  specialInstructions: String (max 500 chars),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Subscription Number Format

**Pattern:** `SUB[timestamp][counter]`

**Example:** `SUB123456780001`
- SUB - Prefix
- 123456 - Last 6 digits of timestamp
- 0001 - Subscription counter (padded to 4 digits)

---

## Pricing Calculation

### Base Calculation
```javascript
basePrice = product.subscriptionPrice
subtotal = basePrice × duration
```

### Addons (Per Day)
```javascript
addon1Total = addon1.price × duration
addon2Total = addon2.price × duration
addonsTotal = addon1Total + addon2Total + ...
```

### Duration Discounts
```javascript
if (duration === 7) discount = 5% of (subtotal + addonsTotal)
if (duration === 15) discount = 10% of (subtotal + addonsTotal)
if (duration === 30) discount = 15% of (subtotal + addonsTotal)
```

### Coupon Codes
```javascript
if (couponCode === 'SUB20') additional 20% off
if (couponCode === 'SAVE100') flat ₹100 off
```

### Final Amount
```javascript
totalAmount = subtotal + addonsTotal - discount
```

---

## Status Flow

```
active
  ↓
paused (temporary) → resume → active
  ↓
cancelled (permanent)
  ↓
completed (end date reached)
  ↓
expired (auto-marked after end date)
```

---

## Skip Days Logic

### Max Skip Days
- 7 days → 2 skips
- 15 days → 3 skips
- 30 days → 5 skips
- Custom → 15% of duration

### Skip Day Effects
1. Delivery not made on skipped date
2. End date extended by 1 day
3. Counted towards max skip limit
4. Cannot skip same day twice

---

## Auto-Renewal

If `autoRenewal: true`:
- System checks subscriptions ending in next 7 days
- Sends renewal notification
- Auto-creates new subscription on end date
- Uses same settings (product, slot, address)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "You can only skip 5 days in this subscription"
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
  "error": "Subscription not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Failed to create subscription"
}
```

---

## Integration Examples

### Frontend (Customer App)

```typescript
// Create subscription
const createSubscription = async (data: any) => {
  const response = await fetch('http://localhost:5000/api/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// Pause subscription
const pauseSubscription = async (id: string, reason: string) => {
  const response = await fetch(`http://localhost:5000/api/subscriptions/${id}/pause`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  return response.json();
};

// Skip a day
const skipDay = async (id: string, date: string, reason: string) => {
  const response = await fetch(`http://localhost:5000/api/subscriptions/${id}/skip-day`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ date, reason })
  });
  return response.json();
};
```

### Admin Panel

```typescript
// Get all subscriptions
const getAllSubscriptions = async (filters: any) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`http://localhost:5000/api/subscriptions/admin/all?${params}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};

// Get statistics
const getStats = async () => {
  const response = await fetch('http://localhost:5000/api/subscriptions/admin/stats', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};
```

---

## Best Practices

1. **Duration Selection** - Encourage longer durations with better discounts
2. **Skip Days** - Allow flexibility but limit abuse
3. **Pause/Resume** - Better than cancellation for temporary issues
4. **Auto-Renewal** - Improve retention with easy renewal
5. **Refund Policy** - Fair refunds for cancelled subscriptions
6. **Daily Meals** - Allow customization for variety
7. **Addons** - Increase revenue with optional extras

---

## Performance

### Indexes
- userId + status (user's active subscriptions)
- subscriptionNumber (unique lookup)
- status + endDate (admin filters, auto-expiry)
- startDate (date range queries)

### Optimizations
- Pagination for large datasets
- Selective field population
- Aggregation for statistics
- Auto-calculated fields (maxSkipDays, pendingAmount)

---

**Subscriptions API is ready!** 🎉




