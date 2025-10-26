# Restaurant App - Mobile (React Native)

## Overview

Mobile app for Restaurant App built with React Native CLI for maximum control and native module support.

## Tech Stack

- **React Native** 0.72.6
- **TypeScript** 5.0.4
- **React Navigation** 6.x
- **Axios** for API calls
- **AsyncStorage** for local storage

## Prerequisites

Before running the mobile app, ensure you have:

1. **Node.js** >= 16
2. **JDK** 11 or newer
3. **Android Studio** with Android SDK
4. **Android Emulator** or physical device

### Android Setup

1. Install Android Studio
2. Set up Android SDK (API Level 33)
3. Configure `ANDROID_HOME` environment variable:
   ```bash
   # Windows
   setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
   
   # Mac/Linux
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Installation

```bash
# Navigate to mobile app directory
cd apps/mobile

# Install dependencies
npm install

# Install iOS dependencies (Mac only)
cd ios && pod install && cd ..
```

## Running the App

### Android

```bash
# Start Metro bundler
npm start

# In another terminal, run Android app
npm run android

# Or run on specific device
npx react-native run-android --deviceId=DEVICE_ID
```

### iOS (Mac only)

```bash
# Run on iOS simulator
npm run ios

# Or run on specific device
npx react-native run-ios --device="Device Name"
```

## Development

### Project Structure

```
apps/mobile/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/
│   ├── components/       # Reusable components
│   ├── screens/          # App screens
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── theme/            # Theme (colors, typography)
│   ├── config/           # App configuration
│   └── types/            # TypeScript types
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json
```

### Path Aliases

TypeScript path aliases are configured:

```typescript
import Button from '@components/Button';
import HomeScreen from '@screens/HomeScreen';
import apiClient from '@services/apiClient';
import { colors } from '@theme/colors';
```

### API Integration

The app connects to the backend API running on `http://localhost:5000`.

For Android emulator, use:
- `http://10.0.2.2:5000` (Android Studio emulator)
- `http://YOUR_COMPUTER_IP:5000` (Physical device)

## Features (Planned)

### Phase 1 - Core Features
- [x] Project setup
- [ ] Authentication (OTP login)
- [ ] User registration
- [ ] Home screen with products
- [ ] Product details
- [ ] Cart management

### Phase 2 - Orders
- [ ] Checkout flow
- [ ] Address selection
- [ ] Payment integration
- [ ] Order tracking
- [ ] Order history

### Phase 3 - Subscriptions
- [ ] Subscription flow
- [ ] Duration selection
- [ ] Timeslot selection
- [ ] Subscription management
- [ ] Delivery tracking

### Phase 4 - Additional
- [ ] Google Maps integration
- [ ] Push notifications
- [ ] Image caching
- [ ] Offline support

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Building for Production

### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/app-release.apk
```

### iOS (Mac only)

```bash
# Open Xcode
open ios/RestaurantApp.xcworkspace

# Archive and upload via Xcode
```

## Debugging

### React Native Debugger

1. Install React Native Debugger
2. Run `npm start`
3. Press `Ctrl+M` (Android) or `Cmd+D` (iOS)
4. Select "Debug"

### Logs

```bash
# Android logs
npx react-native log-android

# iOS logs
npx react-native log-ios
```

## Common Issues

### Metro bundler cache issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Port conflicts
```bash
# Kill process on port 8081
npx react-native start --port 8082
```

## Environment Variables

Create `.env` file in the root:

```env
API_URL=http://10.0.2.2:5000
GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Next Steps

1. Run `npm install` to install dependencies
2. Start backend API (`cd apps/api && npm run dev`)
3. Start Metro bundler (`npm start`)
4. Run on Android (`npm run android`)

## Support

For issues, check:
- React Native documentation
- Project GitHub issues
- Backend API documentation in `apps/api/`

---

**Happy Coding! 🚀**



