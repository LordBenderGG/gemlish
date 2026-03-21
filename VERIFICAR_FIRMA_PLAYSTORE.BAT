@echo off
REM ==============================================================
REM Verificar firma del AAB de liberación de Gemlish (Play Store)
REM ==============================================================

setlocal EnableDelayedExpansion

set "AAB_PATH=E:\opencode\gemlish\android\app\build\outputs\bundle\release\app-release.aab"

if not exist "%AAB_PATH%" (
    echo ERROR: AAB no encontrado en %AAB_PATH%
    echo Primero compile el AAB con COMPILAR_PLAYSTORE.BAT
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
echo VERIFICANDO FIRMA DEL AAB (Play Store Submission)
echo =============================================================
echo AAB: "%AAB_PATH%"
echo.
echo Intentando verificar con keytool (lee certificado del archivo JAR/ZIP)...
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -printcert -jarfile "%AAB_PATH%"
set "KEYTOOL_ERRORLEVEL=%errorlevel%"

echo.
echo =============================================================
if %KEYTOOL_ERRORLEVEL% equ 0 (
    echo.
    echo VERIFICACIÓN CON KEYTOOL COMPLETADA
    echo.
    echo Busque la línea que dice "SHA-1:" en la salida de arriba
    echo El valor debería ser exactamente:
    echo 24:A6:84:49:D6:6C:65:1A:37:D4:B3:7F:DA:EB:07:AD:6A:A4:4A:8F
    echo.
    echo Si los valores coinciden, el AAB está firmado correctamente
    echo y será aceptado por Google Play Store.
) else (
    echo.
    echo WARNING: keytool no pudo leer el certificado (puede que el AAB no tenga un JAR signature directo).
    echo Intentando verificar con apksigner (puede que no funcione con AAB)...
    "!APKSIGNER!" verify --print-certs "%AAB_PATH%"
    set "APKSIGNER_ERRORLEVEL=%errorlevel%"
    echo.
    echo =============================================================
    if %APKSIGNER_ERRORLEVEL% equ 0 (
        echo VERIFICACIÓN CON APKSIGNER COMPLETADA EXITOSAMENTE
        echo.
        echo Busque la línea que dice "SHA-1:" en la salida de arriba
        echo El valor debería ser exactamente:
        echo 24:A6:84:49:D6:6C:65:1A:37:D4:B3:7F:DA:EB:07:AD:6A:A4:4A:8F
        echo.
        echo Si los valores coinciden, el AAB está firmado correctamente
        echo y será aceptado por Google Play Store.
    ) else (
        echo.
        echo ERROR: Tanto keytool como apksigner fallaron.
        echo Esto puede ser porque el AAB necesita ser verificado con bundletool.
        echo.
        echo Para validar el AAB, puede usar:
        echo   java -jar bundletool.jar validate --mode=BUNDLE --app=%AAB_PATH%
        echo (Descargue bundletool.jar desde: https://github.com/google/bundletool/releases)
        echo.
        echo Alternativamente, genere un APK universal desde el AAB y verifíquelo:
        echo   java -jar bundletool.jar build-apks --bundle=%AAB_PATH% --output=test.apks --mode=universal
        echo   rename test.apks test.zip
        echo   descomprima test.zip y busque el archivo universal.apk
        echo   Luego verifique ese APK con apksigner.
    )
)
echo.
echo =============================================================
pause
exit /b 0