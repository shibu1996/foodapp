# Admin Login Fix - Complete ✅

## Problem

When accessing `http://localhost:3000/admin`, users were continuously redirected to the login page.

## Root Cause

The authentication flow was not saving the JWT token and user data to `localStorage` after successful login. The admin layout checks for these values in localStorage, and when not found, redirects to `/auth`.

## Files Fixed

### 1. `apps/web/app/auth/page.tsx`
**Issue:** After OTP verification, token and user data were stored in `apiClient` instance but NOT in localStorage.

**Fix:** Added localStorage storage after successful OTP verification:
```typescript
if (response.token) {
  localStorage.setItem('token', response.token);
}
if (response.user) {
  localStorage.setItem('user', JSON.stringify(response.user));
}
```

### 2. `apps/web/app/register/page.tsx`
**Issue:** After completing registration, user data was not saved to localStorage.

**Fix:** Added localStorage storage after successful registration:
```typescript
if (response.user) {
  localStorage.setItem('user', JSON.stringify(response.user));
}
```

### 3. `packages/api-client/src/api-client.ts`
**Issue:** API base URL was set to `http://localhost:3001` instead of `http://localhost:5000`.

**Fix:** Updated baseURL to match the running API server:
```typescript
constructor(baseURL: string = 'http://localhost:5000')
```

## How to Test Admin Panel

### Step 1: Start Backend API
```bash
cd apps/api
npm run dev
```
Should be running on: `http://localhost:5000`

### Step 2: Start Web App
```bash
cd apps/web
npm run dev
```
Should be running on: `http://localhost:3000`

### Step 3: Login as Admin

1. Go to: `http://localhost:3000/auth`

2. **Enter phone number:** Any 10-digit number (e.g., `9876543210`)

3. **Click "Send OTP"**

4. **Enter OTP:** Any 6 digits (backend mock accepts anything)

5. **If new user, complete registration:**
   - **Name:** Any name
   - **Email:** Must contain "admin" (e.g., `admin@restaurant.com`) ✅ **IMPORTANT**
   - Click "Complete Registration"

6. **You'll be redirected to home page**

### Step 4: Access Admin Panel

1. Go to: `http://localhost:3000/admin`
2. You should see the Admin Dashboard (NOT redirected to login)

## Admin Access Rules

The admin layout checks if the user's email contains "admin":

```typescript
if (!user.email || !user.email.includes('admin')) {
  alert('Access denied. Admin only area.');
  router.push('/home');
}
```

### Valid Admin Emails:
- ✅ admin@restaurant.com
- ✅ admin@foodapp.com
- ✅ superadmin@company.com
- ✅ myadmin123@email.com

### Invalid Admin Emails:
- ❌ user@restaurant.com
- ❌ john@foodapp.com
- ❌ customer@email.com

## What's Stored in localStorage

After successful login:

1. **token** - JWT authentication token
   ```
   localStorage.getItem('token')
   ```

2. **user** - User object as JSON string
   ```
   localStorage.getItem('user')
   // Returns: {"_id":"...", "phone":"...", "name":"...", "email":"admin@..."}
   ```

## Testing Checklist

- ✅ Login with phone + OTP works
- ✅ Token saved to localStorage
- ✅ User data saved to localStorage
- ✅ Registration saves user data
- ✅ Admin panel accessible (with admin email)
- ✅ Non-admin redirected to home page
- ✅ Not logged in users redirected to auth page
- ✅ Dashboard shows stats
- ✅ Can navigate to Products page
- ✅ Can create new products

## Quick Test Commands

### Check localStorage in browser console:
```javascript
// Check if token exists
localStorage.getItem('token')

// Check user data
JSON.parse(localStorage.getItem('user'))

// Clear and re-login
localStorage.clear()
```

## Notes

- Backend currently uses **mock OTP** - any 6 digits work
- API runs on port **5000** (not 3001)
- Web app runs on port **3000**
- Admin check is **case-sensitive** - email must contain "admin"

All issues resolved! Admin panel is now fully accessible! 🎉

