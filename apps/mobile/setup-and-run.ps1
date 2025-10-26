# Mobile App Setup and Run Script
# This script will fix Gradle wrapper and run the app

Write-Host "Setting up Mobile App Environment..." -ForegroundColor Cyan

# Set environment variables
$env:Path += ";C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools"
$env:ANDROID_HOME = "C:\Users\Admin\AppData\Local\Android\Sdk"

Write-Host "Environment variables set" -ForegroundColor Green

# Check device connection
Write-Host ""
Write-Host "Checking device connection..." -ForegroundColor Cyan
adb devices

# Download gradle-wrapper.jar if missing
$wrapperPath = "android\gradle\wrapper\gradle-wrapper.jar"
if (-not (Test-Path $wrapperPath)) {
    Write-Host ""
    Write-Host "Downloading gradle-wrapper.jar..." -ForegroundColor Yellow
    $url = "https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $wrapperPath -UseBasicParsing
        Write-Host "gradle-wrapper.jar downloaded successfully" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download gradle-wrapper.jar" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "gradle-wrapper.jar already exists" -ForegroundColor Green
}

# Clean build
Write-Host ""
Write-Host "Cleaning previous builds..." -ForegroundColor Cyan
if (Test-Path "android\app\build") {
    Remove-Item -Recurse -Force "android\app\build"
}
if (Test-Path "android\build") {
    Remove-Item -Recurse -Force "android\build"
}
Write-Host "Build directories cleaned" -ForegroundColor Green

# Run the app
Write-Host ""
Write-Host "Building and running app on device..." -ForegroundColor Cyan
Write-Host "This may take 5-10 minutes on first build..." -ForegroundColor Yellow
Write-Host ""

npx react-native run-android

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "App launched successfully!" -ForegroundColor Green
    Write-Host "Check your device for the app" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Failed to launch app" -ForegroundColor Red
    Write-Host "Check errors above for details" -ForegroundColor Yellow
}
