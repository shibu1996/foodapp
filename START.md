# 🚀 Restaurant App - Quick Start

## 📋 What's Built

### ✅ **Complete Features:**

1. **Authentication System**
   - Phone OTP login
   - Registration (name, email)
   - JWT authentication
   - Auto location fetch

2. **Home Page**
   - Product categories
   - Product grid (individual items + ready meals)
   - One-time order (Add to cart)
   - Subscription plans display
   - Cart badge

3. **Subscription Flow (9 Steps)** 🆕
   - Step 1: Duration (7/15/30 + custom days)
   - Step 2: Time Slot selection
   - Step 3: Start Date picker
   - Step 4: Skip Days option
   - Step 5: Add-ons (Salad, Curd, Sweet)
   - Step 6: Daily Meal selection
   - Step 7: Summary & Coupon
   - Step 8: Payment (4 methods)
   - Step 9: Success page

---

## 🏃 How to Run

### **1. Start API Server**

```bash
cd apps/api
npm install
npm run dev
```

**Important:** Create `.env` file in `apps/api/`:
```
MONGODB_URI=mongodb://localhost:27017/restaurant-app
JWT_SECRET=your-secret-key-here
PORT=5000
```

API runs on: **http://localhost:5000**

---

### **2. Start Web App**

```bash
cd apps/web
npm install
npm run dev
```

Web runs on: **http://localhost:3000**

---

## 🧪 Test the App

### **Step 1: Authentication**
1. Open: http://localhost:3000
2. Enter phone: `9876543210`
3. Enter OTP: `123456`
4. If new user: Enter name & email
5. Redirects to home page

### **Step 2: Browse Products**
- See different categories
- View products with prices
- One-time price vs Subscription price

### **Step 3: Test Subscription Flow** 🔥

1. **Click "Subscribe" on any product**
2. **Select Duration:**
   - Try preset: 7/15/30 days
   - Try custom: 20 days
3. **Choose Time Slot:**
   - 12:00 PM - 1:00 PM (recommended)
4. **Pick Start Date:**
   - Select tomorrow or any available date
5. **Enable Skip Days:**
   - Toggle ON to allow skipping
6. **Add-ons (Optional):**
   - Select Salad, Curd, or Sweet
7. **Select Daily Meals:**
   - Use "Quick Fill" for all days
   - Customize individual days
   - Skip specific days if needed
8. **Review Summary:**
   - Check all details
   - Apply coupon: `FIRST50` or `SAVE100`
9. **Payment:**
   - Choose payment method
   - Fill details
   - Accept terms
   - Click Pay
10. **Success!**
    - See confirmation
    - Get subscription ID

---

## 🎯 What Works

### **Frontend (Web):**
✅ Authentication pages
✅ Home page with products
✅ Complete 9-step subscription flow
✅ State management with Context API
✅ LocalStorage persistence
✅ Price calculation
✅ Coupon system
✅ Responsive design

### **Backend (API):**
✅ User authentication
✅ OTP system (mock)
✅ JWT tokens
✅ User registration
✅ Get current user

### **Not Implemented Yet:**
❌ Product APIs (using mock data)
❌ Cart APIs
❌ Order APIs
❌ Subscription APIs (frontend ready)
❌ Payment gateway (Razorpay)
❌ View/Manage subscriptions
❌ Mobile app

---

## 💡 Tips

### **Testing Subscription:**
- Use product: "Dal Makhani" (Rs. 72/day)
- Try 7-day plan first
- Enable skip days to see full features
- Use coupon `FIRST50` for Rs. 50 off

### **Coupons Available:**
- `FIRST50` - Rs. 50 discount
- `SAVE100` - Rs. 100 discount

### **Navigation:**
- Use Back button to go back
- State is preserved
- Edit any step from summary
- Data persists on refresh

---

## 📂 Project Structure

```
restaurant-app/
├── apps/
│   ├── api/                    # Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── web/                    # Next.js Web App
│       ├── app/
│       │   ├── auth/           # Login/Signup
│       │   ├── register/       # Registration
│       │   ├── home/           # Home page
│       │   └── subscribe/      # 9-step flow
│       │       ├── context/
│       │       ├── duration/
│       │       ├── timeslot/
│       │       ├── start-date/
│       │       ├── skip-rules/
│       │       ├── addons/
│       │       ├── meals/
│       │       ├── summary/
│       │       ├── payment/
│       │       └── success/
│       └── package.json
│
└── packages/
    ├── api-client/             # Shared API client
    └── design-tokens/          # Shared design tokens
```

---

## 🎨 Design System

**Colors:**
- Primary: Orange (#FF6B35)
- Secondary: Teal (#4ECDC4)
- Success: Green
- Background: Gray-50

**Typography:**
- Font: System default
- Headings: Bold
- Body: Regular

---

## 🐛 Common Issues

### **Port Already in Use:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **MongoDB Connection Error:**
- Install MongoDB locally
- Or use MongoDB Atlas (cloud)
- Update MONGODB_URI in .env

### **Module Not Found:**
```bash
# Reinstall dependencies
cd apps/web
rm -rf node_modules
npm install
```

---

## 📚 Documentation

- **SUBSCRIPTION_COMPLETE.md** - Complete subscription flow guide
- **TESTING_SUBSCRIPTION.md** - Detailed testing instructions
- **DESIGN_GUIDE.md** - Visual design specifications

---

## 🎯 Next Steps

### **Immediate:**
1. Test complete subscription flow
2. Report any bugs
3. Verify all calculations

### **Backend APIs to Build:**
1. Product CRUD APIs
2. Cart APIs
3. Order APIs
4. Subscription CRUD APIs
5. Payment integration (Razorpay)

### **Additional Features:**
1. View active subscriptions
2. Manage subscriptions (pause/cancel)
3. Order history
4. User profile
5. Address management
6. Mobile app

---

## ✅ Testing Checklist

- [ ] Login with phone number
- [ ] Register new user
- [ ] Browse products
- [ ] Click subscribe button
- [ ] Complete all 9 steps
- [ ] Apply coupon code
- [ ] Complete payment
- [ ] See success page
- [ ] Test back navigation
- [ ] Test page refresh (state persists)
- [ ] Test on mobile view

---

## 🎊 Ready!

**Everything is set up and ready to test!**

1. Start API server
2. Start Web app
3. Open http://localhost:3000
4. Test subscription flow
5. Enjoy! 🚀

---

**Questions? Check the docs or start testing!** 🎉
