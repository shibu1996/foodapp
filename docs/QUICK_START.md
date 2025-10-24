# ⚡ QUICK START - 2 Minutes

## Method 1: Automated Script (Easiest) ⭐

```powershell
cd C:\Users\Admin\restaurant-app
powershell -ExecutionPolicy Bypass -File start-all.ps1
```

**Follow the prompts:**
1. Choose option `3` (Both backend & frontend)
2. Wait for windows to open
3. Browser will auto-open to http://localhost:3000

**Done! ✅**

---

## Method 2: Manual Start (Simple)

### Step 1: Start Backend

```powershell
cd C:\Users\Admin\restaurant-app\apps\api
npm run dev
```

**Wait for:** `🚀 Server is running on http://localhost:5000`

✅ **Leave this terminal open!**

---

### Step 2: Start Frontend (New Terminal)

**Open a NEW PowerShell window:**

```powershell
cd C:\Users\Admin\restaurant-app\apps\web
npm run dev
```

**Wait for:** `▲ Next.js - Ready on http://localhost:3000`

✅ **Leave this terminal open!**

---

### Step 3: Open Browser

Go to: **http://localhost:3000**

---

## ⚠️ If Backend Won't Start

### Error: "logger already declared"

**This is already fixed!** Just pull latest code or restart:

```powershell
cd C:\Users\Admin\restaurant-app\apps\api
npm run dev
```

### Error: "MongoDB connection failed"

**Start MongoDB:**

```powershell
# Option 1: As service
net start MongoDB

# Option 2: Manual
mongod
```

### Error: "Port 5000 already in use"

**Kill the process:**

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace 1234 with actual PID)
taskkill /PID 1234 /F

# Then restart backend
npm run dev
```

---

## ⚠️ If Frontend Won't Start

### Error: "Port 3000 already in use"

**Kill the process:**

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
npm run dev
```

---

## 🎯 Success Checklist

After starting:

✅ Backend terminal shows: `Server is running on http://localhost:5000`  
✅ Frontend terminal shows: `Ready on http://localhost:3000`  
✅ Browser opens to http://localhost:3000  
✅ You see the home page with products  
✅ No red errors in terminals  

**All checked? You're good to go! 🎉**

---

## 🧪 Quick Test

Once both are running:

**Test 1: Health Check**
```powershell
curl http://localhost:5000/health
```

**Expected:** `{"status":"OK","message":"Restaurant API is running"}`

**Test 2: Get Products**
```powershell
curl http://localhost:5000/api/products
```

**Expected:** JSON with products list

**Test 3: Frontend**

Open http://localhost:3000 and you should see:
- Products on home page
- Navigation bar
- "Sign In" button

---

## 📚 Full Documentation

For detailed setup, troubleshooting, and advanced features:
- **Complete Guide:** `HOW_TO_RUN.md`
- **Testing Guide:** `docs/TESTING_GUIDE.md`
- **Quick Test:** `QUICK_TEST.md`

---

## 💡 What to Do After Starting?

1. **Add Test Data:**
   ```powershell
   cd apps\api
   npm run seed:all
   ```

2. **Test Login:**
   - Click "Sign In"
   - Enter any phone number
   - Enter OTP: `123456`

3. **Browse Products:**
   - Filter by category
   - Search products
   - View details

4. **Test Subscription:**
   - Click "Subscribe Now"
   - Follow the flow

5. **Admin Panel:**
   - Login with email containing "admin"
   - Go to http://localhost:3000/admin

---

## 🚀 Ready to Test Everything?

Run the automated test suite:

```powershell
cd C:\Users\Admin\restaurant-app\apps\api
powershell -ExecutionPolicy Bypass -File test-suite.ps1
```

---

## ✅ All Working?

**Congratulations! 🎉**

Your app is now running and ready for development!

**Next Steps:**
1. Start building features
2. Test on mobile (React Native app)
3. Deploy to production
4. Scale to 1 lakh users! 🚀

**Happy Coding! 😊**

