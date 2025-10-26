@echo off
echo ====================================
echo Mobile App Setup and Run
echo ====================================
echo.

REM Set environment variables
set "PATH=%PATH%;C:\Users\Admin\AppData\Local\Android\Sdk\platform-tools"
set "ANDROID_HOME=C:\Users\Admin\AppData\Local\Android\Sdk"

echo [1/5] Environment variables set
echo.

REM Check device
echo [2/5] Checking device connection...
adb devices
echo.

REM Download gradle wrapper if missing
if not exist "android\gradle\wrapper\gradle-wrapper.jar" (
    echo [3/5] Downloading gradle-wrapper.jar...
    powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/gradle/gradle/master/gradle/wrapper/gradle-wrapper.jar' -OutFile 'android\gradle\wrapper\gradle-wrapper.jar' -UseBasicParsing"
    echo Gradle wrapper downloaded
) else (
    echo [3/5] Gradle wrapper already exists
)
echo.

REM Clean build
echo [4/5] Cleaning previous builds...
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\build" rmdir /s /q "android\build"
echo Build directories cleaned
echo.

REM Run app
echo [5/5] Building and running app...
echo This may take 5-10 minutes on first build...
echo.
npx react-native run-android

echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================
    echo App launched successfully!
    echo Check your device for the app
    echo ====================================
) else (
    echo ====================================
    echo Failed to launch app
    echo Check errors above for details
    echo ====================================
)

pause

