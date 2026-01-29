# Guía de Configuración Rápida

## Paso 1: Crear Usuario Administrador

### Opción A: Usando Supabase Dashboard (Recomendado)

1. Abre el Dashboard de Supabase: https://supabase.com/dashboard
2. Navega a tu proyecto
3. Ve a **Authentication** > **Users**
4. Click en **Add User** > **Create new user**
5. Ingresa:
   - Email: `admin@frangarciacars.com`
   - Password: `Admin123!` (o la que prefieras)
   - Confirma el email automáticamente
6. Copia el **User UID** que se muestra

7. Ve a **SQL Editor** y ejecuta:

```sql
-- Reemplaza 'UUID_AQUI' con el User UID copiado
INSERT INTO profiles (id, role, full_name, email, active, metadata)
VALUES (
  'UUID_AQUI',
  'admin',
  'Francesc Garcia',
  'admin@frangarciacars.com',
  true,
  '{}'::jsonb
);
```

### Opción B: Usando SQL Directo

Si prefieres, puedes ejecutar todo desde SQL Editor:

```sql
-- IMPORTANTE: Supabase requiere crear usuarios desde el Dashboard o Auth API
-- Este método NO funcionará directamente. Usa la Opción A.
```

## Paso 2: Iniciar Sesión

1. Ejecuta la aplicación: `npm run dev`
2. Abre http://localhost:5173
3. Inicia sesión con:
   - Email: `admin@frangarciacars.com`
   - Password: La que configuraste

## Paso 3: Crear Datos de Prueba

Una vez dentro del panel de Admin, puedes crear:

### Crear un Revisor de Prueba

Desde el Dashboard de Supabase:

1. **Authentication** > **Users** > **Add User**
   - Email: `revisor1@frangarciacars.com`
   - Password: `Revisor123!`

2. **SQL Editor**:
```sql
-- Reemplaza UUID_REVISOR con el User UID del revisor
INSERT INTO profiles (id, role, full_name, email, phone, location, active, metadata)
VALUES (
  'UUID_REVISOR',
  'reviewer',
  'Juan Revisor',
  'revisor1@frangarciacars.com',
  '+34 600 000 000',
  'Munich, Alemania',
  true,
  '{}'::jsonb
);
```

### Crear un Cliente de Prueba

1. **Authentication** > **Users** > **Add User**
   - Email: `cliente@ejemplo.com`
   - Password: `Cliente123!`

2. **SQL Editor**:
```sql
-- Reemplaza UUID_CLIENTE con el User UID del cliente
-- Reemplaza UUID_ADMIN con el User UID del admin
INSERT INTO profiles (id, role, full_name, email, phone, assigned_admin_id, active, metadata)
VALUES (
  'UUID_CLIENTE',
  'client',
  'Pedro Cliente',
  'cliente@ejemplo.com',
  '+34 600 111 111',
  'UUID_ADMIN',  -- ID del admin que gestiona este cliente
  true,
  '{}'::jsonb
);
```

### Crear una Revisión de Prueba

```sql
-- Crear una revisión de ejemplo
-- Reemplaza los UUIDs según corresponda
INSERT INTO reviews (
  client_id,
  reviewer_id,
  assigned_admin_id,
  status,
  vehicle_make,
  vehicle_model,
  vehicle_year,
  vehicle_km,
  vehicle_vin,
  started_at,
  metadata
)
VALUES (
  'UUID_CLIENTE',
  'UUID_REVISOR',
  'UUID_ADMIN',
  'draft',
  'Volkswagen',
  'Golf GTI',
  2020,
  45000,
  'WVWZZZ1KZBW123456',
  now(),
  '{}'::jsonb
);
```

## Paso 4: Verificar Configuración

### Prueba como Admin
1. Inicia sesión con cuenta admin
2. Deberías ver el Dashboard con estadísticas
3. Navega a "Usuarios" para ver los usuarios creados
4. Navega a "Revisiones" para ver las revisiones

### Prueba como Revisor
1. Cierra sesión
2. Inicia sesión con `revisor1@frangarciacars.com`
3. Deberías ver la interfaz móvil con "Mis Revisiones"
4. Deberías ver la revisión asignada

### Prueba como Cliente
1. Cierra sesión
2. Inicia sesión con `cliente@ejemplo.com`
3. Deberías ver el disclaimer
4. Después de aceptar, verás el mensaje "No hay informes disponibles"
5. (Los clientes solo ven revisiones con estado "sent_to_client")

## Solución de Problemas

### Error: "Missing Supabase environment variables"

Verifica que el archivo `.env` existe y contiene:
```
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### Error: "User creation failed"

Asegúrate de:
1. Crear el usuario primero en Authentication > Users
2. Copiar el UUID correctamente
3. Usar ese UUID en el INSERT de profiles

### Error al iniciar sesión

- Verifica que el email confirmation está deshabilitado en Supabase
- Ve a Authentication > Settings > Email Auth > Disable "Confirm email"

### No se ve nada después de login

- Abre la consola del navegador (F12) para ver errores
- Verifica que el perfil del usuario existe en la tabla `profiles`
- Verifica que el rol es correcto ('admin', 'reviewer', o 'client')

## Script Completo de Ejemplo

Aquí tienes un script completo que puedes ejecutar (después de crear los usuarios en el Dashboard):

```sql
-- 1. Crear perfil de Admin
-- Reemplaza 'ADMIN_UUID' con el UUID del usuario admin
INSERT INTO profiles (id, role, full_name, email, active)
VALUES ('ADMIN_UUID', 'admin', 'Francesc Garcia', 'admin@frangarciacars.com', true);

-- 2. Crear perfil de Revisor
-- Reemplaza 'REVIEWER_UUID' con el UUID del usuario revisor
INSERT INTO profiles (id, role, full_name, email, phone, location, active)
VALUES ('REVIEWER_UUID', 'reviewer', 'Juan Revisor', 'revisor1@frangarciacars.com', '+34 600 000 000', 'Munich', true);

-- 3. Crear perfil de Cliente
-- Reemplaza 'CLIENT_UUID' y 'ADMIN_UUID'
INSERT INTO profiles (id, role, full_name, email, phone, assigned_admin_id, active)
VALUES ('CLIENT_UUID', 'client', 'Pedro Cliente', 'cliente@ejemplo.com', '+34 600 111 111', 'ADMIN_UUID', true);

-- 4. Crear una revisión de prueba
-- Reemplaza los UUIDs correspondientes
INSERT INTO reviews (client_id, reviewer_id, assigned_admin_id, status, vehicle_make, vehicle_model, vehicle_year, vehicle_km, vehicle_vin)
VALUES ('CLIENT_UUID', 'REVIEWER_UUID', 'ADMIN_UUID', 'in_progress', 'Volkswagen', 'Golf GTI', 2020, 45000, 'WVWZZZ1KZBW123456');

-- 5. Verificar que todo se creó correctamente
SELECT
  p.full_name,
  p.role,
  p.email,
  p.active
FROM profiles p
ORDER BY p.created_at DESC;

-- 6. Ver revisiones creadas
SELECT
  r.id,
  r.status,
  r.vehicle_make,
  r.vehicle_model,
  c.full_name as cliente,
  rev.full_name as revisor
FROM reviews r
LEFT JOIN profiles c ON r.client_id = c.id
LEFT JOIN profiles rev ON r.reviewer_id = rev.id
ORDER BY r.created_at DESC;
```

## Siguientes Pasos

Una vez que hayas verificado que todo funciona:

1. **Personaliza los datos**: Cambia nombres, emails, etc. según tus necesidades
2. **Añade más revisores y clientes** según tu equipo real
3. **Configura Supabase Storage** para subir fotos y videos (lo haremos en la siguiente fase)
4. **Personaliza los colores y branding** si es necesario

## Contacto

Si tienes problemas con la configuración, revisa:
- La consola del navegador para errores JavaScript
- Los logs de Supabase Dashboard
- El README.md para más información sobre la arquitectura
