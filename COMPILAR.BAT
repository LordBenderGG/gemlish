@echo off
REM ==============================================================
REM Build Script for Gemlish Android Release APK
REM Usage: double-click this file or run from CMD
REM ==============================================================

REM Enable delayed expansion for variable expansion within loops
setlocal EnableDelayedExpansion

REM Store the directory where this script is located
set "SCRIPT_DIR=%~dp0"
echo.
echo =============================================================
echo Gemlish Android Release APK Build Script
echo =============================================================
echo Script directory: "%SCRIPT_DIR%"
echo.

REM Change to the script directory
pushd "%SCRIPT_DIR%" >nul
if errorlevel 1 (
    echo ERROR: Failed to change to script directory
    echo.
    echo Current directory: %cd%
    echo.
    pause
    exit /b 1
)

echo Current directory: %cd%
echo.

REM ==== Set Java 21 from Android Studio ====
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
echo Java home: "%JAVA_HOME%"
if not exist "%JAVA_HOME%\bin\java.exe" (
    echo.
    echo ERROR: Java 21 not found at %JAVA_HOME%
    echo Please install Android Studio or JDK 21 and update the path in this script.
    echo.
    pause
    popd
    exit /b 1
)

REM ==== Android SDK paths ====
set "ANDROID_HOME=C:\Users\USUARIO\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
echo Android home: "%ANDROID_HOME%"
if not exist "%ANDROID_HOME%\platforms\android-36" (
    echo WARNING: Android SDK platform 36 not found at %ANDROID_HOME%\platforms\android-36
    echo The build might still work if you have a different platform version installed.
)

REM ==== Build environment ====
set "NODE_ENV=production"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"
echo.
echo Environment variables set:
echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo NODE_ENV=%NODE_ENV%
echo.

REM ==== Check for gradlew.bat in the android directory ====
if not exist "android\gradlew.bat" (
    echo.
    echo ERROR: gradlew.bat not found at android\gradlew.bat
    echo Current directory contents:
    dir
    echo.
    pause
    popd
    exit /b 1
)
echo Found gradlew.bat at: android\gradlew.bat
echo.

REM ==== Change to the android directory to run the Gradle build ====
pushd android >nul
if errorlevel 1 (
    echo ERROR: Failed to change to android directory
    echo.
    pause
    popd
    exit /b 1
)

REM ==== Optional: clean previous build (uncomment if you want a clean build) ====
REM echo Cleaning previous build...
REM call gradlew.bat clean
REM if errorlevel 1 (
REM     echo WARNING: Clean failed, continuing anyway...
REM )

REM ==== Build Release APK ====
echo.
echo Building Release APK...
echo =============================================================
echo Running: gradlew.bat assembleRelease --no-daemon --max-workers=2 -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
echo =============================================================
echo.
gradlew.bat assembleRelease --no-daemon --max-workers=2 -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
set "BUILD_ERRORLEVEL=%errorlevel%"
echo.
echo =============================================================
echo Build completed with errorlevel: %BUILD_ERRORLEVEL%
echo =============================================================
echo.

REM Return to the script directory
popd >nul

if %BUILD_ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Build failed. See output above for details.
    echo.
    echo Common issues:
    echo 1. Missing Java 21 (check JAVA_HOME)
    echo 2. Missing Android SDK components
    echo 3. Network issues downloading dependencies
    echo 4. Insufficient memory (try increasing -Xmx value in script)
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo SUCCESS: Release APK build completed.
    echo.
    set "APK_PATH=%SCRIPT_DIR%android\app\build\outputs\apk\release\app-release.apk"
    if exist "%APK_PATH%" (
        for %%F in ("%APK_PATH%") do (
            echo File size: %%~zF bytes (%%~zF / 1024 / 1024 MB)
        )
        echo.
        echo Verifying APK signature...
        echo =============================================================
        set "APKSIGNER=%ANDROID_HOME%\build-tools\36.0.0\apksigner.bat"
        if not exist "%APKSIGNER%" (
            echo WARNING: Could not find apksigner at %APKSIGNER%
            echo Trying to locate apksigner in build-tools folder...
            for /d %%D in ("%ANDROID_HOME%\build-tools\*") do (
                if exist "%%D\apksigner.bat" set "APKSIGNER=%%D\apksigner.bat"
            )
        )
        if exist "%APKSIGNER%" (
            echo Running: "%APKSIGNER%" verify --print-certs "%APK%"
            "%APKSIGNER%" verify --print-certs "%APK%"
            if errorlevel 1 (
                echo.
                echo WARNING: Signature verification failed or apksigner returned an error.
            ) else (
                echo.
                echo Signature verification completed successfully.
                echo Look for the SHA-1 line in the output above.
                echo Expected SHA-1: 24:A6:84:49:D6:6C:65:1A:37:D4:B3:7F:DA:EB:07:AD:6A:A4:4A:8F
            )
        ) else (
            echo.
            echo WARNING: apksigner not found; skipping signature verification.
            echo Please ensure Android SDK Build-tools is installed.
            echo You can verify manually later with:
            echo   "%ANDROID_HOME%\build-tools\*\apksigner.bat" verify --print-certs "%APK%"
        )
    ) else (
        echo ERROR: APK file not found at expected location!
        echo Expected: %APK_PATH%
        echo.
        echo Checking directory contents:
        dir "%SCRIPT_DIR%android\app\build\outputs\apk\release"
    )
    echo.
    echo The APK is ready for installation on your Android device.
    echo.
    echo To install:
    echo 1. Copy the APK to your Android device
    echo 2. Enable "Install from unknown sources" in Settings > Security
    echo 3. Open the APK file to install
    echo.
    pause
    exit /b 0
)