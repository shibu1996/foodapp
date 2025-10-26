# 🚀 Start All Services - Restaurant App
# Run with: powershell -ExecutionPolicy Bypass -File start-all.ps1

Write-Host "`n🚀 Starting Restaurant App...`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoRunning = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoRunning) {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB not running. Starting..." -ForegroundColor Yellow
    try {
        Start-Service MongoDB -ErrorAction SilentlyContinue
        Write-Host "✅ MongoDB started" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not start MongoDB service" -ForegroundColor Red
        Write-Host "   Please start MongoDB manually: mongod" -ForegroundColor Yellow
        Read-Host "Press Enter to continue anyway (app may not work without MongoDB)"
    }
}

Write-Host ""

# Check if Redis is available
Write-Host "📊 Checking Redis..." -ForegroundColor Yellow
$redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
if ($redisProcess) {
    Write-Host "✅ Redis is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis not running (optional - app works without it)" -ForegroundColor Yellow
    Write-Host "   To start Redis: cd C:\Redis && .\redis-server.exe" -ForegroundColor Gray
}

Write-Host ""

# Check if .env exists
Write-Host "📊 Checking .env file..." -ForegroundColor Yellow
$envPath = "apps\api\.env"
if (Test-Path $envPath) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Creating default .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# MongoDB
MONGODB_URI=mongodb://localhost:27017/restaurant-app

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=super-secret-key-change-in-production

# Logging
LOG_LEVEL=debug
"@
    
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ .env file created at $envPath" -ForegroundColor Green
}

Write-Host ""

# Check if node_modules exist
Write-Host "📊 Checking dependencies..." -ForegroundColor Yellow

if (!(Test-Path "apps\api\node_modules")) {
    Write-Host "⚠️  Backend dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location "apps\api"
    npm install
    Set-Location "..\..\"
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
}

if (!(Test-Path "apps\web\node_modules")) {
    Write-Host "⚠️  Frontend dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location "apps\web"
    npm install
    Set-Location "..\..\"
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ All checks complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Ask user what to start
Write-Host "What would you like to start?" -ForegroundColor Cyan
Write-Host "1. Backend only (API)" -ForegroundColor White
Write-Host "2. Frontend only (Web)" -ForegroundColor White
Write-Host "3. Both (Recommended)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter your choice (1/2/3)"

Write-Host ""

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "🔄 Starting Backend API on http://localhost:5000..." -ForegroundColor Cyan
    Write-Host ""
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\api'; Write-Host '🚀 Backend API Starting...' -ForegroundColor Cyan; npm run dev"
    
    Write-Host "✅ Backend API started in new window" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host "🔄 Starting Frontend Web on http://localhost:3000..." -ForegroundColor Cyan
    Write-Host ""
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\web'; Write-Host '🚀 Frontend Web Starting...' -ForegroundColor Cyan; npm run dev"
    
    Write-Host "✅ Frontend Web started in new window" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Application Started!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($choice -eq "1" -or $choice -eq "3") {
    Write-Host "📊 Backend API:" -ForegroundColor Yellow
    Write-Host "   - API: http://localhost:5000" -ForegroundColor White
    Write-Host "   - Health: http://localhost:5000/health/detailed" -ForegroundColor White
    Write-Host ""
}

if ($choice -eq "2" -or $choice -eq "3") {
    Write-Host "🌐 Frontend Web:" -ForegroundColor Yellow
    Write-Host "   - App: http://localhost:3000" -ForegroundColor White
    Write-Host ""
}

Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Both apps are running in separate windows" -ForegroundColor Gray
Write-Host "   - Close the windows to stop the apps" -ForegroundColor Gray
Write-Host "   - Check the windows for logs and errors" -ForegroundColor Gray
Write-Host ""

if ($choice -eq "3") {
    Write-Host "🧪 To test, open your browser:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    
    $openBrowser = Read-Host "Open browser now? (y/n)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
        Start-Process "http://localhost:3000"
    }
}

Write-Host ""
Write-Host "✅ Done! Happy coding! 🎉" -ForegroundColor Green
Write-Host ""





