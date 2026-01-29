# Despliegue en Plesk - Subcarpeta /confirmacion-de-llamada

## Pasos para subir la aplicación a Plesk

### 1. Construir el proyecto localmente
Ejecuta:
```bash
npm run build
```

Esto genera la carpeta `dist/` con todos los archivos optimizados para producción configurados para la ruta `/confirmacion-de-llamada/`.

### 2. Preparar archivos para subir

Los archivos que necesitas subir a Plesk están en la carpeta `dist/`:
- `index.html`
- Carpeta `assets/` (con todos los archivos CSS y JS)
- Logos e imágenes
- `.htaccess` (incluido en la raíz del proyecto)

### 3. Acceder a Plesk

1. Inicia sesión en tu panel de Plesk
2. Ve a tu dominio/sitio web
3. Abre "Administrador de archivos" o usa FTP

### 4. Subir archivos

**Opción A: Administrador de archivos de Plesk**
1. Navega a la carpeta raíz de tu dominio (`httpdocs/` o `public_html/`)
2. Crea una carpeta llamada `confirmacion-de-llamada`
3. Entra en esa carpeta
4. Sube TODOS los archivos de la carpeta `dist/`:
   - `index.html`
   - Carpeta `assets/`
   - Logos e imágenes
5. Sube el archivo `.htaccess` dentro de la carpeta `confirmacion-de-llamada`

**Opción B: FTP**
1. Conecta con tu cliente FTP (FileZilla, etc.)
2. Navega a `httpdocs/` o `public_html/`
3. Crea la carpeta `confirmacion-de-llamada`
4. Sube todos los archivos de `dist/` y el `.htaccess` dentro de esa carpeta

### 5. Verificar configuración

1. En Plesk, ve a "Configuración de Apache y nginx"
2. Verifica que "mod_rewrite" esté habilitado

### 6. Variables de entorno (si las usas)

Si tu aplicación usa variables de entorno:
1. En Plesk, ve a "Variables de entorno"
2. Añade las variables necesarias de tu archivo `.env`

### 7. Acceder a tu sitio

Abre tu dominio en el navegador con la ruta: `https://tudominio.com/confirmacion-de-llamada/`

La aplicación debería estar funcionando.

## Estructura de archivos en el servidor

```
httpdocs/
└── confirmacion-de-llamada/
    ├── index.html
    ├── .htaccess
    ├── assets/
    │   ├── index-[hash].css
    │   └── index-[hash].js
    ├── logo_transparente_v2.png
    ├── logo_para_fondos_oscuros.png
    └── logo_para_fondos_oscuros copy.png
```

## Solución de problemas

### La página muestra un 404
- Verifica que el archivo `.htaccess` esté dentro de la carpeta `confirmacion-de-llamada`
- Asegúrate de que mod_rewrite esté habilitado en Plesk
- Comprueba que la ruta sea correcta: `/confirmacion-de-llamada/`

### Las imágenes no cargan
- Verifica que los logos se hayan subido correctamente dentro de `confirmacion-de-llamada/`
- Comprueba los permisos de archivos (644 para archivos, 755 para carpetas)

### Error de CORS o variables de entorno
- Añade las variables de entorno en Plesk si las necesitas
- Verifica que las URLs de Supabase estén configuradas correctamente

## Actualizaciones futuras

Para actualizar el sitio:
1. Ejecuta `npm run build` localmente
2. Elimina los archivos antiguos del servidor en `confirmacion-de-llamada/` (excepto `.htaccess`)
3. Sube los nuevos archivos de `dist/` a `confirmacion-de-llamada/`
