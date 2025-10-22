# 🍜 Restaurant Web App - Food Delivery & Subscriptions

A modern food ordering web application with phone OTP authentication and location detection.

## ✅ Status: Ready to Run!

All errors fixed! The app is fully functional.

## 🚀 Quick Start

### Prerequisites
- **MongoDB** installed and running
- **Node.js** v18+ installed
- **npm** installed

### Installation & Running

#### 1. Start MongoDB
```bash
mongod
```

#### 2. Start API Server (New Terminal)
```bash
cd apps/api
npm install  # First time only
npm run dev
```

✅ Should show: `✅ MongoDB connected successfully`

#### 3. Start Web App (New Terminal)
```bash
cd apps/web
npm install  # First time only
npm run dev
```

✅ Should show: `✓ Ready in...` and open http://localhost:3000

## 🧪 Testing

1. **Open**: http://localhost:3000
2. **Enter phone**: `9876543210` (any 10-digit Indian number)
3. **Send OTP**: Click the button
4. **Get OTP**: Check the API terminal for:
   ```
   📱 OTP for 9876543210: 123456
   ```
5. **Enter OTP**: Type the 6-digit code
6. **Register**: Enter your name and email (first time only)
7. **Success!**: You'll see your location on the home page

## 📁 Project Structure

```
restaurant-app/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   ├── config/   # Database config
│   │   │   ├── controllers/  # Auth controller
│   │   │   ├── middleware/   # JWT auth
│   │   │   ├── models/   # User model
│   │   │   ├── routes/   # API routes
│   │   │   ├── utils/    # JWT & OTP utils
│   │   │   └── index.ts  # Server entry
│   │   └── package.json
│   │
│   └── web/              # Next.js Web App
│       ├── app/
│       │   ├── auth/     # Login page
│       │   ├── register/ # Registration page
│       │   ├── home/     # Home page
│       │   └── layout.tsx
│       ├── tailwind.config.ts
│       └── package.json
│
└── packages/
    ├── api-client/       # Shared API client
    │   └── src/
    │       ├── api-client.ts
    │       ├── types.ts
    │       └── index.ts
    │
    └── design-tokens/    # Shared design system
        └── index.ts      # Colors, spacing, etc.
```

## ✨ Features

- ✅ **Phone OTP Authentication** - Secure login with OTP
- ✅ **User Registration** - Name and email collection
- ✅ **Location Detection** - Automatic geolocation
- ✅ **JWT Tokens** - Secure authentication
- ✅ **MongoDB Integration** - User data persistence
- ✅ **Responsive Design** - Beautiful Tailwind UI
- ✅ **TypeScript** - Type-safe code throughout

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + OTP |
| **Location** | Geolocation API + OpenStreetMap |

## 🎨 Design System

- **Primary Color**: `#FF6B35` (Orange - appetizing)
- **Secondary Color**: `#4ECDC4` (Teal - fresh)
- **Font**: System fonts (Inter, SF Pro, Segoe UI)
- **Layout**: Responsive, mobile-first

## 📚 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP & login/register
- `POST /api/auth/complete-registration` - Save user details
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /health` - API status

## 🔧 Troubleshooting

### MongoDB Not Connecting
```bash
# Make sure MongoDB is running
mongod

# Or check if service is running
# Windows: services.msc → MongoDB Server
```

### Port Already in Use
```bash
# Kill process on port 3001 (API)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Kill process on port 3000 (Web)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Can't Find OTP
- Check the **API terminal** (where you ran `npm run dev`)
- Look for: `📱 OTP for 9876543210: 123456`

### Module Not Found Errors
```bash
# Clean install
cd apps/web
Remove-Item -Recurse -Force node_modules, .next
npm install
```

### Location Not Working
- Allow location permission in browser
- Check browser console for errors
- Ensure HTTPS or localhost (required for geolocation)

## 🎯 Next Steps / Roadmap

### Phase 2: Restaurant Features
- [ ] Restaurant listings
- [ ] Menu browsing
- [ ] Search and filters
- [ ] Restaurant details page

### Phase 3: Ordering
- [ ] Shopping cart
- [ ] Order placement
- [ ] Order history
- [ ] Order tracking

### Phase 4: Subscriptions
- [ ] Meal plan creation
- [ ] Subscription management
- [ ] Recurring orders
- [ ] Subscription analytics

### Phase 5: Payments
- [ ] Razorpay/Stripe integration
- [ ] Payment methods
- [ ] Wallet system
- [ ] Refunds

### Phase 6: Advanced
- [ ] Real OTP service (Twilio/MSG91)
- [ ] Redis for OTP storage
- [ ] Push notifications
- [ ] Admin dashboard
- [ ] Analytics
- [ ] Reviews & ratings

## 📝 Development

### Adding New Pages
```bash
# In apps/web/app/
mkdir new-page
touch new-page/page.tsx
```

### Adding New API Routes
```bash
# In apps/api/src/
# 1. Create controller in controllers/
# 2. Create routes in routes/
# 3. Import in index.ts
```

### Styling
- Use Tailwind classes
- Colors from design tokens: `text-primary`, `bg-secondary`
- Consistent spacing: `p-4`, `mb-6`, etc.

## 🚀 Deployment

### API Deployment
```bash
cd apps/api
npm run build
# Deploy dist/ folder to your server
```

### Web Deployment
```bash
cd apps/web
npm run build
npm start
# Or deploy to Vercel/Netlify
```

### Environment Variables
Create `.env` files:

**apps/api/.env:**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/restaurant-app
JWT_SECRET=your-secret-key
NODE_ENV=production
```

## 📄 License

MIT

---

## 📞 Support

Check `START.md` for detailed startup instructions.

---

**Built with ❤️ - Ready to scale to production! 🚀**
