# 📱 How to Run Restaurant Mobile App (Android)

## 🎯 Quick Start

```bash
# 1. Start Backend API
cd apps/api
npm run dev

# 2. Install Mobile Dependencies (first time only)
cd apps/mobile
npm install

# 3. Run on Android
npm run android
```

---

## 📋 Prerequisites

### Required Software

1. **Node.js** >= 16
   ```bash
   node --version  # Should be >= 16
   ```

2. **Java Development Kit (JDK)** 11 or newer
   ```bash
   java -version
   ```

3. **Android Studio** with:
   - Android SDK
   - Android SDK Platform 33
   - Android Emulator OR physical device

4. **Environment Variables** (Windows):
   ```bash
   # Add to System Environment Variables
   ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   
   # Add to PATH
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   %ANDROID_HOME%\emulator
   ```

---

## 🚀 Step-by-Step Setup

### Step 1: Backend API Setup

The mobile app requires the backend API to be running.

```bash
# Navigate to API directory
cd apps/api

# Install dependencies (if not done)
npm install

# Start the server
npm run dev

# Should see: Server running on http://localhost:5000
```

### Step 2: Mobile App Setup

```bash
# Navigate to mobile directory
cd apps/mobile

# Install dependencies
npm install

# Note: This will download React Native, navigation libraries, etc.
# First install may take 5-10 minutes
```

### Step 3: Start Android Emulator

**Option A: Using Android Studio**
1. Open Android Studio
2. Click "AVD Manager" (Android Virtual Device)
3. Create a new device if needed (Pixel 5 recommended)
4. Click ▶️ to start emulator

**Option B: Command Line**
```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33
```

### Step 4: Run the App

```bash
# From apps/mobile directory

# Option 1: One command to start Metro and build
npm run android

# Option 2: Start Metro separately (for debugging)
npm start
# Then in another terminal:
npx react-native run-android
```

**First build takes 5-10 minutes** (downloads dependencies, builds native code)

---

## 📱 Using the App

### First Launch

1. **Login Screen** appears
   - Enter phone: `1234567890`
   - Tap "Send OTP"

2. **Check backend console** for OTP (usually `123456`)

3. **Enter OTP** and tap "Verify OTP"

4. **Registration** (for new users)
   - Enter your name
   - Optionally add email
   - Tap "Complete Registration"

5. **Home Screen** loads with:
   - Categories
   - Products grid
   - Search functionality

### Testing Features

**Browse Products:**
- Scroll through product grid
- Tap category tabs to filter
- Use search bar to find products

**View Product Details:**
- Tap any product card
- See full details
- Adjust quantity
- Tap "Add to Cart"

**Profile Menu:**
- Tap profile avatar in header
- See user info
- Logout option

**Refresh Data:**
- Pull down on home screen to refresh

---

## 🔧 Troubleshooting

### Metro Bundler Issues

```bash
# Clear Metro cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

### Build Errors

```bash
# Clean build
cd android
./gradlew clean
cd ..
npm run android
```

### Port Already in Use

```bash
# Kill process on port 8081 (Metro)
# Windows:
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or start on different port
npm start -- --port 8082
```

### Emulator Not Detected

```bash
# Check connected devices
adb devices

# If emulator doesn't show:
adb kill-server
adb start-server
adb devices
```

### API Connection Issues

**Android Emulator:**
- API URL is set to `http://10.0.2.2:5000` (localhost for emulator)
- Make sure backend is running on port 5000

**Physical Device:**
- Update `apps/mobile/src/config/api.ts`:
  ```typescript
  export const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';
  ```
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Ensure device and computer are on same WiFi

---

## 🐛 Common Errors & Fixes

### Error: "SDK location not found"

**Fix:**
Create `apps/mobile/android/local.properties`:
```
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Error: "Unable to load script"

**Fix:**
```bash
# Ensure Metro is running
npm start

# In another terminal
npm run android
```

### Error: "Could not connect to development server"

**Fix:**
```bash
# Reload Metro
adb reverse tcp:8081 tcp:8081
npm start
```

### Error: "Task :app:installDebug FAILED"

**Fix:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## 📊 Development Tips

### Hot Reload

- **Fast Refresh** enabled by default
- Changes auto-reload when you save files
- Press `R` twice in Metro console to manually reload

### Debug Menu

**On Emulator:**
- Press `Ctrl + M` (Windows) or `Cmd + M` (Mac)

**On Device:**
- Shake the device

**Options:**
- Reload
- Debug (opens Chrome DevTools)
- Toggle Inspector
- Change Bundle Location

### Logs

```bash
# View all logs
npx react-native log-android

# Or use adb
adb logcat

# Filter React Native logs
adb logcat | findstr "ReactNative"
```

### Development Server Info

- **Metro Bundler:** http://localhost:8081
- **Backend API:** http://localhost:5000 (or http://10.0.2.2:5000 in emulator)

---

## 🎨 Project Structure

```
apps/mobile/
├── android/              # Android native code
├── src/
│   ├── components/       # Reusable UI components
│   ├── config/           # API & app configuration
│   ├── navigation/       # React Navigation setup
│   ├── screens/          # App screens
│   ├── services/         # API client
│   ├── theme/            # Colors, typography, spacing
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions (storage)
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json
```

---

## ✅ Verification Checklist

Before testing, ensure:

- ✅ Backend API running on port 5000
- ✅ Android emulator or device connected
- ✅ Metro bundler running (port 8081)
- ✅ Environment variables set (ANDROID_HOME)
- ✅ Java & Android SDK installed

---

## 📞 Support

**Common Issues:**
1. Backend not running → `cd apps/api && npm run dev`
2. Emulator not detected → `adb devices`
3. Build errors → `cd android && ./gradlew clean`
4. Metro cache issues → `npm start -- --reset-cache`

**Check Logs:**
- Backend: Terminal running `npm run dev`
- Metro: Terminal running `npm start`
- Android: `npx react-native log-android`

---

## 🚀 Next Steps

After successful run:

1. ✅ Test authentication flow
2. ✅ Browse products
3. ✅ View product details
4. ⏳ Wait for Cart feature (next phase)
5. ⏳ Wait for Orders feature (next phase)

---

**Happy Coding! 🎉**

For detailed progress, see `PROGRESS.md`


