# 🧪 Testing Subscription Flow

## ✅ What's Built So Far

### Pages Ready:
1. **Step 1: Duration Selection** (`/subscribe/duration`)
2. **Step 2: Time Slot Selection** (`/subscribe/timeslot`)

### Features Implemented:
- ✅ State management with Context API
- ✅ LocalStorage persistence
- ✅ Progress bar indicator
- ✅ 7/15/30 Days preset options
- ✅ Custom days option (3-90 days)
- ✅ Dynamic price calculation
- ✅ Discount calculation (5%/10%/15%)
- ✅ Skip allowance calculation
- ✅ 3 Time slot options
- ✅ Navigation between steps
- ✅ Back button functionality

## 🧪 How to Test

### Step 1: Start the App

Make sure the web server is running:
```bash
cd apps/web
npm run dev
```

Open: **http://localhost:3000**

### Step 2: Login

1. Go through authentication
2. Login with your credentials
3. Reach home page

### Step 3: Test Subscription Flow

#### Test Case 1: Preset Duration (7 Days)
1. On home page, find "Dal Makhani" product
2. Click "Subscribe (Rs. 72/day)" button
3. **Expected**: Should navigate to `/subscribe/duration`
4. You should see:
   - Progress: "Step 1 of 9" with 11% bar
   - Product info: Dal Makhani, Rs. 72/day
   - 4 duration options
5. Click "7 Days" option
6. **Expected**: 
   - Card highlights in orange
   - Shows: Rs. 72/day × 7 days
   - Skip allowance: 1 day
   - Save 5%
   - Total: Rs. 479 (after 5% discount)
7. Click "Next: Choose Time Slot"
8. **Expected**: Navigate to `/subscribe/timeslot`
9. You should see:
   - Progress: "Step 2 of 9" with 22% bar
   - Selected plan summary: "7 Days Subscription"
   - 3 time slots
10. Select "12:00 PM - 1:00 PM"
11. **Expected**: Card highlights, shows "Selected" badge
12. Click "Next: Select Start Date"
13. **Expected**: Error - page not built yet (normal)

#### Test Case 2: Custom Duration
1. Go back to `/subscribe/duration`
2. Click "Custom Days" option
3. **Expected**: Input field appears
4. Enter "20" in the input
5. **Expected**: Shows:
   - Rs. 72/day × 20 days
   - Skip allowance: 2 days
   - Save 10%
   - Total: Rs. 1,296
6. Try entering "2"
7. **Expected**: Shows error "Please enter between 3 and 90 days"
8. Try entering "100"
9. **Expected**: Shows error
10. Enter "30"
11. **Expected**: 
    - Shows 15% discount
    - Skip allowance: 4 days
    - Total: Rs. 1,836
12. Click Next
13. Should work normally

#### Test Case 3: Back Navigation
1. From time slot page, click "Back" button
2. **Expected**: Returns to duration page
3. Previous selection should be preserved
4. Click Next again
5. Should return to time slot page

#### Test Case 4: State Persistence
1. On duration page, select "15 Days"
2. Click Next
3. On time slot page, select "1:00 PM - 2:00 PM"
4. **Refresh the page** (F5)
5. **Expected**: 
   - Should still be on time slot page
   - "15 Days Subscription" should show in summary
   - Previous time slot selection preserved

#### Test Case 5: Different Products
1. Go back to home page
2. Try subscription on different products:
   - Rajma (Rs. 63/day)
   - Full Thali (Rs. 135/day)
3. **Expected**: Prices should calculate correctly for each

## 🐛 What to Check

### UI/UX:
- [ ] Progress bar animates smoothly
- [ ] Cards highlight properly when selected
- [ ] Radio buttons work correctly
- [ ] Custom input accepts only numbers
- [ ] Back button works
- [ ] "Next" button disabled when nothing selected
- [ ] Loading states (if any)

### Calculations:
- [ ] Price calculation correct
- [ ] Discount percentage correct
- [ ] Skip allowance correct
- [ ] Total price accurate

### State Management:
- [ ] State persists on page refresh
- [ ] Going back preserves selections
- [ ] Different products load correct data

### Responsiveness:
- [ ] Works on mobile (Chrome DevTools mobile view)
- [ ] Cards stack properly on small screens
- [ ] Buttons are tappable on mobile

## 🎯 Expected Behavior Summary

### Duration Page:
- 4 options visible
- Custom option shows input
- Price calculates in real-time
- Can't proceed without valid selection
- Shows benefits based on duration

### Time Slot Page:
- 3 time slots visible
- Can select one
- Shows previous selection (duration) in summary
- Can go back to edit
- Can't proceed without selection

## 🚫 Known Limitations (Expected)

1. **Step 3 onwards not built** - Normal, will show 404
2. **No backend** - All data is mock
3. **No actual payment** - Payment integration pending
4. **No database** - State only in localStorage

## ✅ Success Criteria

If all these work, we're good:
- ✅ Can navigate from home to duration page
- ✅ Can select duration (preset or custom)
- ✅ Prices calculate correctly
- ✅ Can navigate to time slot page
- ✅ Can select time slot
- ✅ State persists on refresh
- ✅ Back navigation works
- ✅ UI looks clean and professional

## 📸 What You Should See

### Duration Page:
```
┌─────────────────────────────────────┐
│ Step 1 of 9        Duration         │
│ ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
├─────────────────────────────────────┤
│ Select Plan Duration                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ● 7 Days      Save 5%  Rs. 479 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ○ 15 Days [Popular] Rs. 972    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ○ 30 Days [Best Value] Rs.1836│ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ○ Custom Days  [____] days     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Back] [Next: Choose Time Slot]    │
└─────────────────────────────────────┘
```

### Time Slot Page:
```
┌─────────────────────────────────────┐
│ Step 2 of 9     Delivery Time       │
│ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░      │
├─────────────────────────────────────┤
│ Choose Your Delivery Time           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ● 🌅 12:00 PM - 1:00 PM        │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ○ ☀️ 1:00 PM - 2:00 PM         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ○ 🌤️ 2:00 PM - 3:00 PM         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Back] [Next: Select Start Date]   │
└─────────────────────────────────────┘
```

## 🔄 Next Steps After Testing

Once testing is successful:
1. Report any bugs found
2. Confirm design looks good
3. Then build remaining 7 pages:
   - Step 3: Start Date
   - Step 4: Skip Rules
   - Step 5: Add-ons
   - Step 6: Meal Selection
   - Step 7: Summary
   - Step 8: Payment
   - Step 9: Success

---

**Ab test karo aur batao kya issues hain!** 🧪

