# 🧪 Complete Testing Guide - All Phases

## Pre-requisites

### 1. Install Dependencies
```bash
cd apps/api
npm install
```

### 2. Setup MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
# Or update MONGODB_URI in .env
```

### 3. Setup Redis (Optional but Recommended)
```bash
# Install Redis
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server
```

### 4. Create .env File
```bash
cd apps/api
```

Create `.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/restaurant-app

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Logging
LOG_LEVEL=debug
```

---

## 🚀 Start the Server

### Option 1: Development Mode
```bash
cd apps/api
npm run dev
```

### Option 2: PM2 Cluster Mode (Production)
```bash
cd apps/api
npm run build
npm run prod
```

**Wait for:**
```
✅ MongoDB connected successfully
📊 Connection pool size: 100
✅ Redis connected successfully (if Redis installed)
✅ Cache system initialized
🔄 Starting queue workers...
✅ All queue workers started successfully!
🚀 Server is running on http://localhost:5000
```

---

## ✅ Phase 1: Database Optimization Tests

### Test 1: Connection Pool
```bash
curl http://localhost:5000/health/detailed
```

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": {
      "connected": true,
      "poolSize": 100,
      "currentConnections": 1
    }
  }
}
```

✅ **Pass:** poolSize = 100

### Test 2: Indexed Query Performance
```bash
# Time this request (should be fast)
time curl http://localhost:5000/api/products
```

**Expected:** Response time < 100ms

### Test 3: Seed Data
```bash
cd apps/api
npm run seed:all
```

**Expected Output:**
```
✅ Categories seeded successfully
✅ Products seeded successfully
```

---

## ✅ Phase 2: Redis Caching Tests

### Test 1: Cache Status
```bash
curl http://localhost:5000/health/detailed
```

**Expected:**
```json
{
  "services": {
    "redis": {
      "connected": true,
      "status": "ready"
    },
    "cache": {
      "available": true,
      "keysCount": 0
    }
  }
}
```

✅ **Pass:** Redis connected = true

### Test 2: Cache Miss → Cache Hit
```bash
# First request (cache MISS)
curl http://localhost:5000/api/products | jq '.cached'
# Output: false

# Second request (cache HIT)
curl http://localhost:5000/api/products | jq '.cached'
# Output: true
```

✅ **Pass:** Second request returns `"cached": true`

### Test 3: Cache Invalidation
```bash
# Create a product (invalidates cache)
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "Test",
    "category": "Snacks",
    "price": 100,
    "subscriptionPrice": 90,
    "image": "https://example.com/image.jpg"
  }'

# Next request should be cache MISS
curl http://localhost:5000/api/products | jq '.cached'
# Output: false (cache was invalidated)
```

---

## ✅ Phase 3: Security & Rate Limiting Tests

### Test 1: Rate Limiting (100 req/15min)
```bash
# Send 101 requests quickly
for i in {1..101}; do 
  echo "Request $i"
  curl -s http://localhost:5000/api/products > /dev/null
done
```

**Expected:** Request 101 should return:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

✅ **Pass:** Rate limit triggers at 101st request

### Test 2: OTP Rate Limiting (3 req/5min)
```bash
# Try to send OTP 4 times
for i in {1..4}; do
  echo "OTP Request $i"
  curl -X POST http://localhost:5000/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"phone": "9876543210"}'
done
```

**Expected:** 4th request fails with:
```json
{
  "success": false,
  "error": "Too many requests for this operation. Please wait 5 minutes."
}
```

### Test 3: Input Validation (SQL Injection)
```bash
# Try SQL injection
curl "http://localhost:5000/api/products?search='; DROP TABLE products--"
```

**Expected:** Request blocked or sanitized (no error, returns empty results)

### Test 4: Compression
```bash
curl -H "Accept-Encoding: gzip" -I http://localhost:5000/api/products
```

**Expected Headers:**
```
Content-Encoding: gzip
Content-Type: application/json
```

---

## ✅ Phase 4: Background Jobs Tests

### Test 1: Queue Health
```bash
curl http://localhost:5000/health/queues | jq
```

**Expected:**
```json
{
  "status": "healthy",
  "queues": [
    {
      "name": "order",
      "waiting": 0,
      "active": 0,
      "completed": 0,
      "failed": 0
    }
  ],
  "workers": {
    "orderQueue": {
      "concurrency": 5,
      "running": true
    }
  }
}
```

### Test 2: Job Processing (Create Order)
```bash
# Create an order (triggers background jobs)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"productId": "PRODUCT_ID", "quantity": 2}],
    "deliveryAddress": {...},
    "paymentMethod": "cod"
  }'

# Check logs - should show:
# ✅ [Order] Job completed
# 📧 Notifications queued
```

---

## ✅ Phase 5: Winston Logging Tests

### Test 1: Log Files Created
```bash
cd apps/api
ls -la logs/
```

**Expected Files:**
```
application-2025-10-23.log
error-2025-10-23.log
http-2025-10-23.log
exceptions-2025-10-23.log
rejections-2025-10-23.log
```

### Test 2: HTTP Request Logging
```bash
# Make a request
curl http://localhost:5000/api/products

# Check logs
tail -f logs/http-2025-10-23.log
```

**Expected Log Entry:**
```json
{
  "level": "http",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/products",
  "status": 200,
  "responseTime": "45ms"
}
```

### Test 3: Error Logging
```bash
# Trigger an error (invalid ID)
curl http://localhost:5000/api/products/invalid-id

# Check error logs
tail logs/error-2025-10-23.log
```

---

## ✅ Phase 6: Pagination Tests

### Test 1: Default Pagination
```bash
curl http://localhost:5000/api/products | jq '.pagination'
```

**Expected:**
```json
{
  "page": 1,
  "limit": 20,
  "totalPages": 5,
  "totalItems": 100,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### Test 2: Custom Pagination
```bash
curl "http://localhost:5000/api/products?page=2&limit=10" | jq '.pagination'
```

**Expected:**
```json
{
  "page": 2,
  "limit": 10,
  "hasNextPage": true,
  "hasPrevPage": true
}
```

### Test 3: Field Filtering
```bash
curl "http://localhost:5000/api/products?fields=name,price,category" | jq '.data[0]'
```

**Expected:** Only requested fields:
```json
{
  "name": "Dal Makhani",
  "price": 120,
  "category": "Dal & Curry"
}
```

---

## ✅ Phase 7: PM2 Clustering Tests

### Test 1: Start with PM2
```bash
cd apps/api
npm run build
npm run pm2:start
```

**Expected:**
```
[PM2] Spawning PM2 daemon
[PM2] PM2 Successfully daemonized
[PM2] Starting restaurant-api in cluster_mode (8 instances)
```

### Test 2: Check Running Instances
```bash
pm2 list
```

**Expected:**
```
│ restaurant-api │ 0  │ cluster │ 12345 │ online │
│ restaurant-api │ 1  │ cluster │ 12346 │ online │
│ restaurant-api │ 2  │ cluster │ 12347 │ online │
│ restaurant-api │ 3  │ cluster │ 12348 │ online │
```

### Test 3: Monitor
```bash
npm run pm2:monit
```

**Expected:** Real-time dashboard showing CPU, memory usage

### Test 4: Zero-Downtime Reload
```bash
# Make code change, then:
npm run build
npm run pm2:reload
```

**Expected:** App reloads without downtime

### Test 5: View Logs
```bash
npm run pm2:logs
```

---

## 🔥 Performance Tests

### Test 1: Response Time
```bash
# Install httpstat (optional)
# npm install -g httpstat

httpstat http://localhost:5000/api/products
```

**Expected:**
```
Total time: 50-100ms (first request)
Total time: 2-5ms (cached request)
```

### Test 2: Concurrent Requests
```bash
# Install Apache Bench
# sudo apt-get install apache2-utils (Linux)
# brew install ab (Mac)

# Test with 100 concurrent users, 1000 requests
ab -n 1000 -c 100 http://localhost:5000/api/products
```

**Expected:**
```
Requests per second: 500-1000+
Time per request: 100-200ms (avg)
Failed requests: 0
```

### Test 3: Memory Usage
```bash
# With PM2
pm2 monit

# Or
curl http://localhost:5000/health/detailed | jq '.memory'
```

**Expected:**
```json
{
  "used": "150 MB",
  "total": "250 MB"
}
```

---

## ✅ Complete Health Check

```bash
curl http://localhost:5000/health/detailed | jq
```

**Expected ALL GREEN:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T...",
  "uptime": 3600,
  "services": {
    "database": {
      "connected": true,
      "poolSize": 100,
      "currentConnections": 5
    },
    "redis": {
      "connected": true,
      "status": "ready"
    },
    "cache": {
      "available": true,
      "keysCount": 25
    }
  },
  "performance": {
    "totalRequests": 1000,
    "averageResponseTime": "75ms",
    "slowRequests": 5,
    "slowRequestPercentage": "0.50%"
  },
  "memory": {
    "used": "150 MB",
    "total": "250 MB"
  }
}
```

---

## 🎯 Success Criteria

### ✅ Phase 1: Database
- [ ] Connection pool = 100
- [ ] Query time < 100ms
- [ ] Indexes working

### ✅ Phase 2: Caching
- [ ] Redis connected
- [ ] Cache hit rate > 50%
- [ ] Cached responses < 10ms

### ✅ Phase 3: Security
- [ ] Rate limiting works
- [ ] Input validation works
- [ ] Compression enabled

### ✅ Phase 4: Queues
- [ ] All 6 queues running
- [ ] 29 workers active
- [ ] Jobs processing

### ✅ Phase 5: Logging
- [ ] Log files created
- [ ] HTTP requests logged
- [ ] Errors logged

### ✅ Phase 6: Pagination
- [ ] Pagination metadata present
- [ ] Field filtering works
- [ ] Page size respected

### ✅ Phase 7: PM2
- [ ] Multiple instances running
- [ ] Auto-restart works
- [ ] Reload without downtime

---

## 🐛 Common Issues & Fixes

### Issue 1: Redis Not Connected
**Fix:**
```bash
# Install and start Redis
redis-server

# Or comment out Redis in code (app works without it)
```

### Issue 2: PM2 Not Starting
**Fix:**
```bash
# Install PM2 globally
npm install -g pm2

# Or use npm scripts
npm run prod
```

### Issue 3: MongoDB Connection Failed
**Fix:**
```bash
# Start MongoDB
mongod

# Or update .env with correct MONGODB_URI
```

### Issue 4: Port Already in Use
**Fix:**
```bash
# Change PORT in .env
PORT=5001

# Or kill existing process
lsof -ti:5000 | xargs kill
```

---

## 📊 Expected Results Summary

**Response Times:**
- First request: 50-100ms
- Cached request: 2-5ms
- Database query: 10-50ms

**Throughput:**
- Requests/second: 500-1000+
- Concurrent users: 100+
- Failed requests: 0%

**Resources:**
- Memory per instance: 100-300 MB
- CPU usage: 10-30% (cluster mode)
- Disk usage: < 1 GB

---

## ✅ All Tests Pass?

**Congratulations! Your app is ready for 1 lakh users! 🎉**

**Next Steps:**
1. Deploy to production server
2. Setup monitoring (PM2 dashboard)
3. Configure production .env
4. Setup SSL/HTTPS
5. Configure domain
6. Launch! 🚀



