@echo off
REM ==============================================================
REM Verificar firma del APK de liberación de Gemlish
REM ==============================================================

setlocal EnableDelayedExpansion

set "APK_PATH=E:\opencode\gemlish\android\app\build\outputs\apk\release\app-release.apk"

if not exist "%APK_PATH%" (
    echo ERROR: APK no encontrado en %APK_PATH%
    echo Primero compile el APK con COMPILAR.BAT
    pause
    exit /b 1
)

set "ANDROID_HOME=C:\Users\USUARIO\AppData\Local\Android\Sdk"

REM Try to find apksigner in build-tools folders
set "APKSIGNER="
for /d %%D in ("%ANDROID_HOME%\build-tools\*") do (
    if exist "%%D\apksigner.bat" (
        set "APKSIGNER=%%D\apksigner.bat"
        goto :found_signer
    )
)
:found_signer
if not defined APKSIGNER (
    echo ERROR: No se pudo encontrar apksigner en %ANDROID_HOME%\build-tools\
    echo Por favor instale Android SDK Build-Tools
    pause
    exit /b 1
)

echo.
echo =============================================================
echo VERIFICANDO FIRMA DEL APK
echo =============================================================
echo APK: "!APK_PATH!"
echo.
echo Ejecutando: "!APKSIGNER!" verify --print-certs "!APK_PATH!"
echo.
"!APKSIGNER!" verify --print-certs "!APK_PATH!"
set "VERIFY_ERRORLEVEL=%errorlevel%"

echo.
echo =============================================================
if %VERIFY_ERRORLEVEL% equ 0 (
    echo VERIFICACIÓN COMPLETADA EXITOSAMENTE
    echo.
    echo Busque la línea que dice "SHA-1:" en la salida de arriba
    echo El valor debería ser exactamente:
    echo 24:A6:84:49:D6:6C:65:1A:37:D4:B3:7F:DA:EB:07:AD:6A:A4:4A:8F
    echo.
    echo Si los valores coinciden, el APK está firmado correctamente
    echo y será aceptado por Google Play Store.
) else (
    echo ERROR: La verificación de firma falló (código de error: %VERIFY_ERRORLEVEL%)
    echo Esto indica un problema con la firma del APK.
)
echo.
echo =============================================================
pause
exit /b 0