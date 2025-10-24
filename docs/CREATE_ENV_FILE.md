# 📝 Create .env File

## Location
`apps/api/.env`

## Content to Copy-Paste

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant-app

# Redis Configuration (Optional - app works without it)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345

# Logging Configuration
LOG_LEVEL=debug

# OTP Configuration (for development)
OTP_EXPIRY_MINUTES=10
```

## How to Create

### Method 1: Using Notepad
```powershell
# Open Notepad
notepad apps\api\.env

# Paste the content above
# Save and close
```

### Method 2: Using PowerShell
```powershell
# Copy this entire command
@"
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant-app

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345

# Logging Configuration
LOG_LEVEL=debug

# OTP Configuration
OTP_EXPIRY_MINUTES=10
"@ | Out-File -FilePath apps\api\.env -Encoding utf8
```

### Method 3: Using VS Code / Cursor
1. Right-click on `apps/api` folder
2. Select "New File"
3. Name it `.env`
4. Paste the content above
5. Save

## Verify

```powershell
# Check if file exists
Test-Path apps\api\.env

# Should return: True
```

## Done!

Once `.env` file is created, you can start the backend:

```powershell
cd apps\api
npm run dev
```

