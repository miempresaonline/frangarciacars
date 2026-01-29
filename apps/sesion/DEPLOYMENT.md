# Guía de Despliegue para Plesk - Subdirectorio

## Archivos a Subir

Sube todo el contenido de la carpeta `dist/` a tu servidor Plesk en la ruta `/sesion-estrategica/`

## URL Final

Tu aplicación estará disponible en: `https://tudominio.com/sesion-estrategica/`

## Pasos para Desplegar en Plesk

### 1. Acceder a Plesk
- Inicia sesión en tu panel de control Plesk
- Selecciona el dominio donde quieres alojar la aplicación

### 2. Crear el Subdirectorio
- Ve a "Files" o "Archivos"
- Navega a tu directorio raíz (httpdocs o public_html)
- Crea una nueva carpeta llamada `sesion-estrategica`

### 3. Subir Archivos
Tienes dos opciones:

#### Opción A: Usando el Administrador de Archivos de Plesk
1. Ve a "Files" o "Archivos"
2. Navega a `httpdocs/sesion-estrategica/`
3. Sube todos los archivos de la carpeta `dist/`:
   - `index.html`
   - `.htaccess`
   - Carpeta `assets/`
   - `logo_para_fondos_oscuros.png`
   - `logo_transparente_v2.png`

#### Opción B: Usando FTP/SFTP
1. Conecta por FTP/SFTP usando las credenciales de Plesk
2. Navega a `httpdocs/sesion-estrategica/`
3. Sube todos los archivos de la carpeta `dist/`

### 4. Verificar Permisos
- Asegúrate de que `.htaccess` tiene permisos de lectura (644)
- Los archivos deben tener permisos 644
- Las carpetas deben tener permisos 755

### 5. Verificar mod_rewrite
- En Plesk, ve a "Apache & nginx Settings"
- Asegúrate de que mod_rewrite está habilitado
- El archivo `.htaccess` ya está incluido en la carpeta `dist/`

### 6. Configurar SSL (Recomendado)
- Ve a "SSL/TLS Certificates"
- Instala un certificado SSL (Let's Encrypt es gratis)
- El `.htaccess` redirigirá automáticamente HTTP a HTTPS

## Estructura de Archivos en el Servidor

```
httpdocs/
└── sesion-estrategica/
    ├── index.html
    ├── .htaccess
    ├── logo_para_fondos_oscuros.png
    ├── logo_transparente_v2.png
    └── assets/
        ├── index-[hash].css
        └── index-[hash].js
```

## Verificación

Una vez subidos los archivos:
1. Visita `https://tudominio.com/sesion-estrategica/` en el navegador
2. Verifica que la página carga correctamente
3. Prueba la navegación y el video
4. Verifica que el botón de formulario funciona

## Problemas Comunes

### Error 500
- Verifica que mod_rewrite está habilitado
- Revisa los permisos del archivo `.htaccess`

### Archivos no encontrados
- Asegúrate de haber subido todos los archivos de la carpeta `dist/`
- Verifica la ruta del directorio raíz en Plesk

### CSS/JS no carga
- Limpia la caché del navegador
- Verifica que la carpeta `assets/` se haya subido completamente

## Soporte

Si tienes problemas:
1. Revisa los logs de error en Plesk (Logs > Error Log)
2. Verifica la configuración de Apache en Plesk
3. Contacta con el soporte de tu hosting si persisten los errores
