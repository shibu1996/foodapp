# Complete Testing Guide - Restaurant App

## Setup Instructions

### 1. Google Maps (Already Done)
API key is hardcoded in the code, so maps should work automatically.

### 2. Start the Application

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web App
cd apps/web
npm run dev
```

Open: **http://localhost:3000**

---

## Complete Flow Test (9 Steps)

### Step 0: Login
1. Phone: `9876543210`
2. OTP: `123456`
3. If new user: Enter name & email
4. Should redirect to home page

### Step 1: Home Page
**What to Check:**
- Products display with images
- Categories filter works
- Each product shows:
  - One-time price
  - Subscription price
  - "Add" button
  - "Subscribe" button

**Test:**
1. Click "Subscribe" on "Dal Makhani" (Rs. 72/day)
2. Should navigate to `/subscribe/duration`

---

### Step 2: Duration (Step 1 of 9 - 11.1%)

**What to Check:**
- Progress bar shows "Step 1 of 9"
- Product info shows "Dal Makhani - Rs. 72/day"
- 4 duration options visible:
  - 7 Days
  - 15 Days (Popular badge)
  - 30 Days (Best Value badge)
  - Custom Days

**Price Calculations:**
- 7 Days: Rs. 504 → 5% off → **Rs. 479**
- 15 Days: Rs. 1,080 → 10% off → **Rs. 972**
- 30 Days: Rs. 2,160 → 15% off → **Rs. 1,836**

**Test:**
1. Select "7 Days"
2. Check: Shows Rs. 479
3. Check: Skip allowance = 1 day
4. Try "Custom Days"
5. Enter: 20
6. Check: Shows Rs. 1,296 (10% discount)
7. Enter: 2 (invalid)
8. Check: Error message
9. Select "15 Days"
10. Click "Next: Choose Time Slot"

---

### Step 3: Time Slot (Step 2 of 9 - 22.2%)

**What to Check:**
- Progress bar: 22.2%
- Shows previous selection: "15 Days Subscription"
- 3 time slots with icons

**Test:**
1. Select "12:00 PM - 1:00 PM"
2. Card highlights
3. "Selected" badge appears
4. Click "Next: Select Start Date"

---

### Step 4: Start Date (Step 3 of 9 - 33.3%)

**What to Check:**
- Progress bar: 33.3%
- Calendar shows next 7 days
- Current selection summary shows Duration & Time

**Test:**
1. Click on tomorrow's date
2. Check: End date auto-calculates
3. Should show: Start date + 15 days
4. Info box shows subscription duration
5. Click "Next: Skip Days Option"

---

### Step 5: Skip Rules (Step 4 of 9 - 44.4%)

**What to Check:**
- Progress bar: 44.4%
- Shows skip allowance: 2 days (for 15-day plan)
- Toggle switch for enable/disable

**Test:**
1. Toggle ON
2. Check: Shows "Skipping Enabled"
3. Examples section visible
4. Toggle OFF
5. Check: Yellow warning appears
6. Toggle ON again
7. Click "Next: Add-ons"

---

### Step 6: Add-ons (Step 5 of 9 - 55.5%)

**What to Check:**
- Progress bar: 55.5%
- Base price shows: Rs. 72/day
- 3 add-ons with checkboxes

**Price Calculation:**
- Salad: +Rs. 10
- Curd: +Rs. 15
- Sweet: +Rs. 20

**Test:**
1. Select "Salad" (+Rs. 10)
2. Check: Daily Total = Rs. 82/day
3. Select "Curd" (+Rs. 15)
4. Check: Daily Total = Rs. 97/day
5. Summary shows: Rs. 25/day add-ons
6. For 15 days: Rs. 375 total add-ons
7. Click "Next: Review Summary"

---

### Step 7: Summary (Step 6 of 9 - 66.6%)

**What to Check:**
- Progress bar: 66.6%
- All selections displayed:
  - Duration: 15 Days
  - Delivery Time: 12:00 PM - 1:00 PM
  - Start & End Dates
  - Add-ons: Salad, Curd
- Price breakdown visible
- Coupon code input

**Price Calculation Test:**
```
Base: Rs. 72 × 15 days = Rs. 1,080
Add-ons: Rs. 25 × 15 days = Rs. 375
Subtotal: Rs. 1,455
Discount (10%): -Rs. 145.50
Total: Rs. 1,309.50
```

**Test:**
1. Verify all details correct
2. Enter coupon: "FIRST50"
3. Click "Apply"
4. Check: Shows "Coupon applied!"
5. Check: Additional -Rs. 50
6. Final Total: Rs. 1,259.50
7. Click "Next: Add Delivery Address"

---

### Step 8: Address (Step 7 of 9 - 77.7%)

**What to Check:**
- Progress bar: 77.7%
- Google Maps loads (if not, see troubleshooting below)
- Mock address already exists and selected:
  - A-123, Green Park Society
  - Sector 18, Noida
  - Uttar Pradesh - 201301

**If Maps Load Successfully:**
1. Click "Use Current Location" (if you grant permission)
2. Or click anywhere on map
3. Form auto-fills city, state, pincode
4. Fill: House No, Street, Area
5. Add landmark
6. Click "Save Address"

**If Maps DON'T Load:**
- Don't worry! Mock address is already selected
- Just click "Next: Payment"

**Test:**
1. Check: Default address is selected (Green Park Society)
2. Try "Edit" button
3. Change house number
4. Save
5. Select the address
6. Click "Next: Payment"

---

### Step 9: Payment (Step 8 of 9 - 88.8%)

**What to Check:**
- Progress bar: 88.8%
- Delivery address displayed (read-only)
- "Change" button to edit address
- Order summary shows:
  - Duration: 15 days
  - Add-ons: 2 items
  - Discount: Rs. 50
  - Total: Rs. 1,259.50
- 4 payment methods visible

**Test:**
1. Verify address is correct
2. Click "Change" - should go back to address page
3. Return to payment
4. Select "UPI"
5. Enter UPI ID: "test@paytm"
6. Check "Accept Terms & Conditions"
7. Click "Pay Rs. 1,259"
8. Shows "Processing..." for 2 seconds
9. Redirects to success page

---

### Step 10: Success (Step 9 of 9 - 100%)

**What to Check:**
- Green checkmark animation
- Subscription ID generated
- "Active" badge
- Complete details displayed:
  - **Product:** Dal Makhani (Rs. 72/day)
  - **Duration:** 15 Days
  - **Total Paid:** Rs. 1,260
  - **Start Date:** (selected date)
  - **End Date:** (calculated)
  - **Delivery Time:** 12:00 PM - 1:00 PM
  - **Active Days:** 15 days
  - **Add-ons:** Salad, Curd
  - **Coupon:** FIRST50 (-Rs. 50)
  - **Delivery Address:** Full address
- First delivery info
- "What's Next" section
- Action buttons

**Test:**
1. Verify all details are correct
2. Check product name shows
3. Check add-ons display
4. Check coupon shows
5. Check address shows with landmark
6. Click "View My Subscriptions" → goes to home
7. Or "Order More" → goes to home

---

## Price Calculation Formula

### Base Calculation:
```
Active Days = Total Days - Skipped Days
Base Total = Base Price × Active Days
Add-on Total = Add-on Price × Active Days
Subtotal = Base Total + Add-on Total
```

### Discount:
```
If Duration >= 30 days: 15% discount
If Duration >= 15 days: 10% discount
If Duration >= 7 days: 5% discount
Otherwise: 0% discount

Auto Discount = Subtotal × Discount %
Coupon Discount = Fixed amount (e.g., Rs. 50)
Total Discount = Auto Discount + Coupon Discount
```

### Final Price:
```
Final Total = Subtotal - Total Discount
```

---

## Example Calculations

### Example 1: 7 Days, No Add-ons
```
Base: Rs. 72 × 7 = Rs. 504
Discount (5%): -Rs. 25.20
Total: Rs. 478.80 ≈ Rs. 479
```

### Example 2: 15 Days, Salad + Curd
```
Base: Rs. 72 × 15 = Rs. 1,080
Add-ons: Rs. 25 × 15 = Rs. 375
Subtotal: Rs. 1,455
Discount (10%): -Rs. 145.50
Total: Rs. 1,309.50
```

### Example 3: 30 Days, All Add-ons, Coupon
```
Base: Rs. 72 × 30 = Rs. 2,160
Add-ons: Rs. 45 × 30 = Rs. 1,350
Subtotal: Rs. 3,510
Auto Discount (15%): -Rs. 526.50
Coupon (FIRST50): -Rs. 50
Total: Rs. 2,933.50
```

---

## Mock Data

### Products (Home Page):
- Dal Makhani: Rs. 85 (one-time), Rs. 72/day (subscription)
- Rajma: Rs. 75 (one-time), Rs. 63/day
- Chole Bhature: Rs. 95 (one-time), Rs. 80/day
- Full Thali: Rs. 165 (one-time), Rs. 135/day
- Paneer Tikka: Rs. 125 (one-time), Rs. 105/day
- Aloo Paratha: Rs. 55 (one-time), Rs. 45/day

### Mock Address (Auto-created):
```
House: A-123
Street: Green Park Society
Area: Sector 18
City: Noida
State: Uttar Pradesh
Pincode: 201301
Landmark: Near Metro Station
Label: Home
Default: Yes
```

### Coupon Codes:
- **FIRST50** → Rs. 50 off
- **SAVE100** → Rs. 100 off

---

## Troubleshooting

### Issue 1: Google Maps Not Loading

**Error:** "This page can't load Google Maps correctly"

**Fix:**
1. API is hardcoded, so should work
2. Check browser console for errors
3. Try hard refresh: `Ctrl + F5`
4. If still issues, use mock address (already selected)

### Issue 2: Price Showing Rs. 0 or NaN

**Fix:**
1. Make sure you selected a product from home page
2. Don't directly visit `/subscribe/duration`
3. Start from home → Click "Subscribe"

### Issue 3: Success Page Shows "N/A"

**Fix:**
1. Complete all steps in order
2. Don't skip steps
3. Make sure you selected values in each step

### Issue 4: Address Not Auto-Filling

**Fix:**
1. Click on map (anywhere)
2. Wait 2-3 seconds for geocoding
3. Or manually fill the form
4. Or use the mock address already selected

### Issue 5: State Not Persisting

**Fix:**
1. Check localStorage in browser DevTools
2. Look for:
   - `subscriptionState`
   - `savedAddresses`
3. Clear and try again if corrupted

---

## State Persistence

### What's Saved:
- All subscription selections (localStorage)
- Saved addresses (localStorage)
- Current progress through steps

### How to Test:
1. Complete first 3 steps
2. Close browser completely
3. Reopen and go to home
4. Click subscribe again
5. Should resume from where you left

### How to Reset:
Clear localStorage:
```javascript
// Open browser console
localStorage.clear();
location.reload();
```

---

## Quick Test Checklist

- [ ] Login works
- [ ] Home page loads products
- [ ] Can subscribe to a product
- [ ] Duration selection works
- [ ] Price calculates correctly
- [ ] Custom days validation works
- [ ] Time slot selection works
- [ ] Date picker works
- [ ] Skip toggle works
- [ ] Add-ons selection works
- [ ] Price updates with add-ons
- [ ] Summary shows all details
- [ ] Coupon codes work
- [ ] Address loads (or mock address selected)
- [ ] Can proceed to payment
- [ ] Payment page shows address
- [ ] Payment processing works
- [ ] Success page shows ALL details:
  - [ ] Product name
  - [ ] Duration & dates
  - [ ] Price paid
  - [ ] Add-ons
  - [ ] Coupon
  - [ ] Address
  - [ ] Delivery info
- [ ] Back navigation works
- [ ] State persists on refresh

---

## Success Criteria

✅ All 9 steps complete
✅ Price calculations accurate
✅ Mock data loads
✅ Address shows (maps or mock)
✅ Success page shows complete details
✅ No errors in console
✅ Responsive on mobile

---

## Ready to Test!

Start from **Step 0: Login** and go through all 9 steps.

Report any issues you find! 🚀

