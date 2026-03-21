@echo off
REM ==============================================================
REM Build Script for Gemlish Android App Bundle (AAB) for Play Store Submission
REM Usage: double-click this file or run from CMD
REM ==============================================================

REM Enable delayed expansion for variable expansion within loops
setlocal EnableDelayedExpansion

REM Store the directory where this script is located
set "SCRIPT_DIR=%~dp0"
echo.
echo =============================================================
echo Gemlish Android App Bundle (AAB) Build Script (Play Store Submission)
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

REM ==== Build Release App Bundle (AAB) ====
echo.
echo Building Release App Bundle (AAB) for Play Store submission...
echo =============================================================
echo Running: gradlew.bat bundleRelease --no-daemon --max-workers=2 -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
echo =============================================================
echo.
gradlew.bat bundleRelease --no-daemon --max-workers=2 -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g"
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
    echo SUCCESS: Release App Bundle (AAB) generated for Play Store submission at:
    echo "%SCRIPT_DIR%android\app\build\outputs\bundle\release\app-release.aab"
    echo.
    if exist "%SCRIPT_DIR%android\app\build\outputs\bundle\release\app-release.aab" (
        for %%F in ("%SCRIPT_DIR%android\app\build\outputs\bundle\release\app-release.aab") do (
            echo File size: %%~zF bytes (%%~zF / 1024 / 1024 MB)
        )
    ) else (
        echo ERROR: AAB file not found at expected location!
        echo Checking directory contents:
        dir "%SCRIPT_DIR%android\app\build\outputs\bundle\release"
    )
    echo.
    echo The AAB is ready for submission to Google Play Store.
    echo.
    echo Next steps:
    echo 1. Verify the signature with VERIFICAR_FIRMA_PLAYSTORE.BAT
    echo 2. Upload the AAB to Google Play Console
    echo 3. Complete store listing (screenshots, description, etc.)
    echo 4. Submit for review
    echo.
    pause
    exit /b 0
)