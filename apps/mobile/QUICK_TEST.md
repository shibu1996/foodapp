# 🚀 Quick Test Guide - Mobile App

**5-Minute End-to-End Test**

---

## ⚡ Prerequisites

```bash
# Terminal 1: Start Backend
cd apps/api
npm run dev
# ✅ Wait for "Server running on http://localhost:5000"

# Terminal 2: Start Mobile App
cd apps/mobile
npm run android
# ✅ Wait for app to launch on emulator/device
```

---

## 🧪 5-Minute Test Flow

### 1️⃣ Login (30 seconds)
```
1. Enter phone: 1234567890
2. Tap "Send OTP"
3. Enter OTP: 123456
4. Tap "Verify OTP"
5. If new user → Enter name & email → Register
```
**✅ Expected:** Navigate to Home screen

---

### 2️⃣ Browse Products (30 seconds)
```
1. See products in 2-column grid
2. Tap "Meals" category
3. Type "milk" in search
4. Tap any product card
5. View product details
```
**✅ Expected:** All products load, search works, details show

---

### 3️⃣ Shopping Cart (1 minute)
```
1. Product detail → Set quantity to 2
2. Tap "Add to Cart"
3. Choose "View Cart"
4. Tap + to increase quantity
5. Tap - to decrease
6. Check cart badge updates
```
**✅ Expected:** Cart works, badge shows count, total calculates

---

### 4️⃣ Place Order (1 minute)
```
1. Cart → Tap "Proceed to Checkout"
2. Tap "Add New Address"
3. Fill:
   - Street: 123 Main St
   - City: Noida
   - State: Uttar Pradesh
   - Pincode: 201301
4. Choose "Home"
5. Tap "Save Address"
6. Select address → Proceed
```
**✅ Expected:** Order placed successfully

---

### 5️⃣ View & Track Order (30 seconds)
```
1. Profile avatar → "My Orders"
2. See your order in list
3. Tap order to track
4. View timeline
```
**✅ Expected:** Order appears, timeline shows status

---

### 6️⃣ Create Subscription (1.5 minutes)
```
1. Home → Find subscription product
2. Tap product → "Subscribe Now"
3. Select "2 Weeks" → Continue
4. Select "Morning Delivery" → Continue
5. Select "Tomorrow" → Continue
6. Review summary
7. Tap "Confirm Subscription"
```
**✅ Expected:** Subscription created

---

### 7️⃣ Manage Subscription (30 seconds)
```
1. Profile → "My Subscriptions"
2. See your subscription
3. Tap "Pause"
4. Tap "Resume"
```
**✅ Expected:** Pause/Resume works, status updates

---

### 8️⃣ Edit Profile (30 seconds)
```
1. Profile avatar → "Profile"
2. Tap "Edit"
3. Change name
4. Tap "Save Changes"
```
**✅ Expected:** Name updates successfully

---

## ✅ All Working?

**If all 8 steps passed:** 🎉 **App is perfect!**

---

## 🐛 Quick Troubleshooting

### Backend Not Starting?
```bash
cd apps/api
npm install
npm run dev
```

### App Not Installing?
```bash
cd apps/mobile
npm install
# Clean build
cd android && ./gradlew clean && cd ..
npm run android
```

### Metro Bundler Issues?
```bash
# Kill Metro
npx react-native start --reset-cache
```

### Can't Login?
- Check backend logs for OTP
- Default OTP is usually: `123456`

---

## 📊 Feature Checklist

Quick check of all major features:

- [ ] Login with OTP works
- [ ] Registration works
- [ ] Products load on home
- [ ] Search & filter work
- [ ] Product details show
- [ ] Add to cart works
- [ ] Cart badge updates
- [ ] Checkout flow works
- [ ] Address save works
- [ ] Order placed successfully
- [ ] My Orders shows list
- [ ] Order tracking works
- [ ] Subscription flow completes
- [ ] My Subscriptions shows list
- [ ] Pause/Resume subscription works
- [ ] Profile edit saves
- [ ] Logout works

**All checked?** ✅ **Ready for users!**

---

## 🎯 Test Data

### Test Phone Numbers
- `1234567890`
- `9876543210`
- `5555555555`

### Test OTP
- Usually: `123456`
- Check backend logs if different

### Test Addresses
- Street: `123 Main St, Apt 4`
- City: `Noida`
- State: `Uttar Pradesh`
- Pincode: `201301`

---

## 📱 Quick Commands

```bash
# Run app
npm run android

# View logs
npx react-native log-android

# Reload app
Press 'r' in Metro terminal

# Debug menu
Shake device OR Ctrl+M (emulator)

# Clear cache
npm start -- --reset-cache
```

---

**Happy Testing! 🚀**






