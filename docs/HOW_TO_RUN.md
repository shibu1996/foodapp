# 🚀 How to Run - Backend & Frontend

## 📋 Pre-requisites

### 1. Install MongoDB
**Windows:**
- Download: https://www.mongodb.com/try/download/community
- Install with default settings
- MongoDB will run as a Windows service automatically

**Verify:**
```powershell
mongod --version
```

### 2. Install Redis (Optional but Recommended)
**Windows:**
- Download: https://github.com/microsoftarchive/redis/releases
- Download `Redis-x64-3.0.504.zip`
- Extract to `C:\Redis`

**Verify:**
```powershell
cd C:\Redis
.\redis-server.exe
```

### 3. Install Node.js Dependencies
```powershell
cd C:\Users\Admin\restaurant-app

# Install backend dependencies
cd apps\api
npm install

# Install frontend dependencies
cd ..\web
npm install
```

---

## 🔧 Setup Environment

### Backend (.env)

Create `apps/api/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/restaurant-app

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Logging
LOG_LEVEL=debug
```

### Frontend (.env.local)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

---

## 🚀 Running the Application

### Option 1: Run Backend & Frontend Separately (Recommended)

#### Terminal 1: Start MongoDB (if not running as service)
```powershell
# If MongoDB is not running as a service, start it:
mongod
```

#### Terminal 2: Start Redis (Optional)
```powershell
cd C:\Redis
.\redis-server.exe
```

#### Terminal 3: Start Backend API
```powershell
cd C:\Users\Admin\restaurant-app\apps\api
npm run dev
```

**Wait for:**
```
✅ MongoDB connected successfully
📊 Connection pool size: 100
✅ Redis client connected
✅ Cache system initialized
🔄 Starting queue workers...
✅ orderQueue worker started with 5 workers
✅ emailQueue worker started with 3 workers
✅ smsQueue worker started with 2 workers
✅ subscriptionQueue worker started with 5 workers
✅ cleanupQueue worker started with 1 workers
✅ paymentQueue worker started with 3 workers
✅ All queue workers started successfully!
🚀 Server is running on http://localhost:5000
📊 Health check: http://localhost:5000/health/detailed
📊 Queue health: http://localhost:5000/health/queues
```

✅ **Backend is ready!**

#### Terminal 4: Start Frontend Web App
```powershell
cd C:\Users\Admin\restaurant-app\apps\web
npm run dev
```

**Wait for:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

✅ **Frontend is ready!**

**Open browser:** http://localhost:3000

---

### Option 2: Run Backend Without Redis

If Redis is not available:

```powershell
cd C:\Users\Admin\restaurant-app\apps\api
npm run dev
```

**Expected warnings:**
```
⚠️ Redis not available - running without cache
   (App will work fine, but may be slower under high load)
⚠️ Queue workers not available - running without background jobs
   (Some features like emails will be processed synchronously)
```

App will still work! ✅

---

## 🧪 Verify Everything is Working

### Test Backend API

**Terminal 5:**
```powershell
# Health check
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products

# Get categories
curl http://localhost:5000/api/categories

# Detailed health
curl http://localhost:5000/health/detailed
```

### Test Frontend

1. Open browser: http://localhost:3000/food/home
2. You should see the home page (no login required! ✅)
3. Browse products, search, filter categories
4. Click "Subscribe Now" → Should start subscription flow
5. At payment page → Redirected to /auth for login
6. Try OTP login with any phone number
7. Complete subscription payment successfully

---

## 📊 Seed Test Data (Optional)

**To add sample products and categories:**

```powershell
cd C:\Users\Admin\restaurant-app\apps\api

# Seed categories
npm run seed:categories

# Seed products
npm run seed:products

# Or seed both
npm run seed:all
```

**Expected:**
```
✅ 10 categories seeded successfully
✅ 50+ products seeded successfully
```

---

## 🐛 Troubleshooting

### Backend won't start

#### Error: "MongoDB connection failed"
```powershell
# Check if MongoDB is running
net start MongoDB

# Or start manually
mongod
```

#### Error: "Port 5000 already in use"
**Option 1:** Kill the process using port 5000
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Option 2:** Change port in `.env`
```env
PORT=5001
```

#### Error: "Cannot find module 'XXX'"
```powershell
# Reinstall dependencies
cd apps\api
rm -rf node_modules
npm install
```

#### Error: "Redis connection failed"
**Option 1:** Install and start Redis

**Option 2:** App works without Redis (ignore the warning)

---

### Frontend won't start

#### Error: "Port 3000 already in use"
**Option 1:** Kill the process
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Option 2:** Run on different port
```powershell
# Edit package.json scripts:
"dev": "next dev -p 3001"
```

#### Error: "Cannot find module"
```powershell
cd apps\web
rm -rf node_modules .next
npm install
npm run dev
```

#### Error: "API calls failing"
**Check:**
1. Backend is running on port 5000
2. `.env.local` has correct `NEXT_PUBLIC_API_URL=http://localhost:5000`

---

## 🔥 Production Mode (PM2 Clustering)

### Build & Start with PM2

```powershell
cd C:\Users\Admin\restaurant-app\apps\api

# Build TypeScript
npm run build

# Install PM2 globally (if not installed)
npm install -g pm2

# Start in cluster mode (8 instances)
npm run pm2:start
```

**Expected:**
```
[PM2] Spawning PM2 daemon
[PM2] PM2 Successfully daemonized
[PM2] Starting restaurant-api in cluster_mode (8 instances)
┌─────┬──────────────────┬─────────┬──────┬────────┬─────────┬────────┐
│ id  │ name             │ mode    │ ↺    │ status │ cpu     │ memory │
├─────┼──────────────────┼─────────┼──────┼────────┼─────────┼────────┤
│ 0   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 1   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 2   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 3   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 4   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 5   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 6   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
│ 7   │ restaurant-api   │ cluster │ 0    │ online │ 0%      │ 50 MB  │
└─────┴──────────────────┴─────────┴──────┴────────┴─────────┴────────┘
```

### PM2 Commands

```powershell
# View list
pm2 list

# View logs
pm2 logs restaurant-api

# Monitor (real-time dashboard)
pm2 monit

# Restart
pm2 restart restaurant-api

# Reload (zero-downtime)
pm2 reload restaurant-api

# Stop
pm2 stop restaurant-api

# Delete
pm2 delete restaurant-api
```

---

## 📱 Access URLs

### Backend API:
- **API Base:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **Detailed Health:** http://localhost:5000/health/detailed
- **Queue Health:** http://localhost:5000/health/queues
- **Products:** http://localhost:5000/api/products
- **Categories:** http://localhost:5000/api/categories

### Frontend Web:
- **Home:** http://localhost:3000/food/home (Guest browsing enabled ✅)
- **Auth:** http://localhost:3000/auth
- **Subscribe:** http://localhost:3000/food/subscribe/duration
- **Orders:** http://localhost:3000/food/orders (Login required 🔒)
- **Subscriptions:** http://localhost:3000/food/subscriptions (Login required 🔒)
- **Admin:** http://localhost:3000/admin (Admin login required 🔐)

---

## 🧪 Run Tests

```powershell
# Automated test suite
cd C:\Users\Admin\restaurant-app\apps\api
powershell -ExecutionPolicy Bypass -File test-suite.ps1
```

**Expected:**
```
✅ PASS: Server is running
✅ PASS: Connection pool = 100
✅ PASS: Redis connected
✅ PASS: Caching working (Miss → Hit)
✅ PASS: Response time 45ms (< 200ms)
✅ PASS: Pagination working
✅ PASS: Queue system healthy
✅ PASS: Monitoring active
✅ PASS: Compression enabled

🎉 App is ready for production!
```

---

## 📝 Summary: Quick Start

**Minimal setup (without Redis):**

```powershell
# Terminal 1: Backend
cd C:\Users\Admin\restaurant-app\apps\api
npm install
npm run dev

# Terminal 2: Frontend
cd C:\Users\Admin\restaurant-app\apps\web
npm install
npm run dev
```

**Open:** http://localhost:3000/food/home ✅

**Full setup (with Redis & all features):**

```powershell
# Terminal 1: Redis
cd C:\Redis
.\redis-server.exe

# Terminal 2: Backend
cd C:\Users\Admin\restaurant-app\apps\api
npm install
npm run dev

# Terminal 3: Frontend
cd C:\Users\Admin\restaurant-app\apps\web
npm install
npm run dev
```

**Open:** http://localhost:3000/food/home ✅

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Redis running (optional)
- [ ] Backend started on port 5000
- [ ] Frontend started on port 3000
- [ ] Can access http://localhost:3000/food/home
- [ ] Can browse products without login (guest browsing)
- [ ] Can login with OTP when needed
- [ ] Products loading on home page
- [ ] Subscribe flow works end-to-end
- [ ] No errors in terminal

**All checked? You're ready to go! 🎉**

---

## 🚀 Next Steps

1. **Add Test Data:** `npm run seed:all`
2. **Test Features:** Try login, subscribe, orders
3. **Run Tests:** `test-suite.ps1`
4. **Deploy:** Follow deployment guide
5. **Monitor:** Use PM2 dashboard

**Happy Coding! 🎉**

