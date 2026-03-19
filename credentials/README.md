# Credenciales de firma de Gemlish

## Archivos en esta carpeta

| Archivo | Descripción |
|---------|-------------|
| `gemlish-upload-key.jks` | **Keystore permanente** para firmar todos los builds de Android |
| `gemlish-upload-cert.pem` | Certificado público (usado para registrar la clave en Play Console) |
| `gemlish-upload-cert.der` | Certificado en formato DER (copia binaria del PEM) |

## Datos del keystore

| Campo | Valor |
|-------|-------|
| Alias | `gemlish-upload` |
| Contraseña del keystore | `Gemlish2024Secure!` |
| Contraseña de la clave | `Gemlish2024Secure!` |
| Algoritmo | RSA 2048 bits |
| Validez | 10.000 días (hasta 2053) |
| SHA-1 | `24:A6:84:49:D6:6C:65:1A:37:D4:B3:7F:DA:EB:07:AD:6A:A4:4A:8F` |
| SHA-256 | `B3:C9:E4:DF:FE:9B:B7:59:5D:05:74:97:CF:E1:87:72:51:B5:EE:69:EE:82:0C:48:66:90:6F:26:56:08:76:D9` |

## Cómo funciona

El archivo `eas.json` está configurado con `"credentialsSource": "local"` para el perfil `production`.
EAS Build lee `credentials.json` en la raíz del proyecto, que apunta a este keystore.

**Todos los builds futuros usarán SIEMPRE este mismo keystore.** No se generará uno nuevo automáticamente.

## Si pierdes estos archivos

1. Recupera el keystore desde el repositorio de GitHub (está commiteado)
2. Si GitHub también se pierde, contacta a Google Play Console para restablecer la clave de carga
   - Ve a: Play Console → Tu app → Prueba y lanza → Integridad de la app → Firma de apps
   - Usa el botón "Cómo solicitar que se restablezca la clave de carga"
   - Sube el nuevo certificado PEM generado con: `keytool -export -rfc -keystore gemlish-upload-key.jks -alias gemlish-upload -file nuevo-cert.pem`
