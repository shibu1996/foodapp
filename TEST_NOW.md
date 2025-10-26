# 📱 MOBILE APP - TEST NOW!

## ✅ Status
- ✅ Backend API: Starting...
- ✅ Mobile App: Building & Installing...

---

## 🧪 5-Minute Test Flow

### 1️⃣ Login (30 seconds)
```
Phone: 1234567890
OTP: 123456 (check backend logs)
```

**Expected:** 
- If new user → Registration screen
- If existing user → Home screen

---

### 2️⃣ Register (if new user)
```
Name: Test User
Email: test@example.com (optional)
```

**Expected:** Navigate to Home

---

### 3️⃣ Home Screen (30 seconds)
**Check:**
- ✅ Products loading in 2-column grid
- ✅ Search bar at top
- ✅ Category tabs (All, Meals, etc.)
- ✅ Cart icon with badge
- ✅ Profile avatar

**Test:**
- Tap "Meals" category → See only meal products
- Type "milk" in search → Products filter
- Tap any product → See details

---

### 4️⃣ Add to Cart (1 minute)
**Steps:**
1. Product Details → Set quantity to 2
2. Tap "Add to Cart"
3. Choose "View Cart"
4. Check cart badge shows "2"
5. Tap + button → Quantity increases
6. Tap - button → Quantity decreases
7. Check total amount updates

**Expected:** Cart works perfectly!

---

### 5️⃣ Checkout & Order (1 minute)
**Steps:**
1. Cart → "Proceed to Checkout"
2. "Add New Address"
3. Fill:
   - Street: `123 Main St`
   - City: `Noida`
   - State: `Uttar Pradesh`
   - Pincode: `201301`
4. Type: Home
5. Save Address
6. Select address
7. Proceed to payment/order

**Expected:** Order created!

---

### 6️⃣ View Orders (30 seconds)
**Steps:**
1. Profile Avatar → "My Orders"
2. See your order
3. Tap order → View tracking
4. See timeline with status

**Expected:** Order tracking works!

---

### 7️⃣ Create Subscription (1.5 minutes)
**Steps:**
1. Home → Find subscription product
2. Tap product → "Subscribe Now"
3. Select "2 Weeks" → Continue
4. Select "Morning Delivery" → Continue
5. Select "Tomorrow" → Continue
6. Review summary
7. "Confirm Subscription"

**Expected:** Subscription created!

---

### 8️⃣ Manage Subscription (30 seconds)
**Steps:**
1. Profile → "My Subscriptions"
2. See subscription
3. Tap "Pause"
4. Tap "Resume"

**Expected:** Status changes!

---

### 9️⃣ Edit Profile (30 seconds)
**Steps:**
1. Profile Avatar → "Profile"
2. Tap "Edit"
3. Change name
4. "Save Changes"

**Expected:** Name updates!

---

### 🔟 Logout & Login Again (30 seconds)
**Steps:**
1. Profile → "Logout"
2. Confirm
3. Login again with same phone
4. Check cart persisted

**Expected:** Cart items still there!

---

## 🐛 Common Issues & Fixes

### Backend not responding?
```bash
# Check if backend is running
# Look for "Server running on http://localhost:5000"

# If not, restart:
cd apps/api
npm run dev
```

### App not installing?
```bash
# Check Android emulator/device is connected
adb devices

# If no devices, start emulator from Android Studio
```

### Metro bundler error?
```bash
# In apps/mobile terminal, press:
r   # Reload app
c   # Clear cache
```

### Can't see products?
- Check backend is running
- Check backend has seed data
- Pull down to refresh on Home screen

---

## ✅ Quick Checklist

Test and check:

- [ ] Login works
- [ ] Registration works
- [ ] Products load
- [ ] Search works
- [ ] Category filter works
- [ ] Product details show
- [ ] Add to cart works
- [ ] Cart badge updates
- [ ] Cart calculations correct
- [ ] Address save works
- [ ] Order placement works
- [ ] My Orders shows list
- [ ] Order tracking works
- [ ] Subscription flow completes
- [ ] My Subscriptions shows
- [ ] Pause/Resume works
- [ ] Profile edit saves
- [ ] Logout works
- [ ] Cart persists after logout/login

---

## 🎯 Expected Behavior

### All Features Should Work:
✅ Authentication (Login, Register)  
✅ Product Browsing (Search, Filter)  
✅ Shopping Cart (Add, Remove, Persist)  
✅ Checkout (Address, Order)  
✅ Orders (List, Track)  
✅ Subscriptions (Create, Manage)  
✅ Profile (View, Edit)  

---

## 📞 Need Help?

### Check Logs
```bash
# Android logs
npx react-native log-android

# Backend logs
# Check the terminal where API is running
```

### Restart Everything
```bash
# Kill all
Ctrl+C on both terminals

# Restart backend
cd apps/api
npm run dev

# Restart mobile
cd apps/mobile
npm run android
```

---

## 🎉 All Working?

**If all features work → APP IS READY! 🚀**

You've successfully built and tested a complete mobile app!

---

**Happy Testing! 📱**





