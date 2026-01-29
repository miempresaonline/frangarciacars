# Solución de Problemas de Login

## Problema: "No puedo entrar después de hacer login"

Si después de iniciar sesión correctamente no entras a la aplicación, sigue estos pasos para diagnosticar y solucionar el problema.

## Diagnóstico

### Paso 1: Abre la Consola del Navegador

1. Presiona `F12` o haz clic derecho → "Inspeccionar"
2. Ve a la pestaña "Console"
3. Intenta iniciar sesión
4. Observa los mensajes en la consola

### Paso 2: Identifica el Problema

Busca estos mensajes en la consola:

#### ✅ Login Exitoso (Caso Normal)
```
Attempting login...
Login successful
Auth user found: [USER_ID] [EMAIL]
Profile loaded: [ROLE] [FULL_NAME]
```

Si ves estos 4 mensajes, el login funciona correctamente.

#### ❌ Problema: Profile not found
```
Attempting login...
Login successful
Auth user found: [USER_ID] [EMAIL]
Profile not found for user: [USER_ID]
```

**Causa**: El usuario existe en `auth.users` pero NO existe en la tabla `profiles`.

**Solución**: Crea el perfil manualmente:

```sql
-- Reemplaza los valores según corresponda
INSERT INTO profiles (id, role, full_name, email, active, metadata)
VALUES (
  'UUID_DEL_USUARIO',  -- Usa el UUID que aparece en "Auth user found"
  'admin',             -- o 'reviewer', 'client'
  'Tu Nombre',
  'tu@email.com',
  true,
  '{}'::jsonb
);
```

#### ❌ Problema: Error fetching profile
```
Attempting login...
Login successful
Auth user found: [USER_ID] [EMAIL]
Error fetching profile: [ERROR_DETAILS]
```

**Causa**: Error de permisos RLS o problema con la base de datos.

**Solución**: Verifica que las políticas RLS estén correctamente configuradas:

```sql
-- Verifica que existan las políticas
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Debe haber al menos estas políticas:
-- "Users can view own profile" (SELECT)
-- "Admins can view all profiles" (SELECT)
```

#### ❌ Problema: Invalid login credentials
```
Attempting login...
Login error: Invalid login credentials
```

**Causa**: Email o contraseña incorrectos.

**Solución**: Verifica tus credenciales o resetea la contraseña desde el Dashboard de Supabase.

## Soluciones Paso a Paso

### Solución 1: Crear Perfil para Usuario Existente

Si el usuario se creó pero no tiene perfil:

1. Ve al Dashboard de Supabase
2. Navega a Authentication > Users
3. Copia el **User UID** del usuario
4. Ve a SQL Editor
5. Ejecuta:

```sql
INSERT INTO profiles (id, role, full_name, email, active, metadata)
VALUES (
  'UUID_COPIADO',  -- Pega el User UID aquí
  'admin',         -- Cambia según el rol deseado
  'Nombre del Usuario',
  'email@usuario.com',
  true,
  '{}'::jsonb
);
```

### Solución 2: Crear Usuario Completo desde Cero

Para crear un nuevo usuario con perfil:

1. **Opción A: Desde el Dashboard de Supabase**

   a. Authentication > Users > Add User
   b. Ingresa email y contraseña
   c. Copia el User UID generado
   d. SQL Editor > Ejecuta el INSERT de profiles (arriba)

2. **Opción B: Desde la Aplicación Admin**

   Una vez que tengas acceso como admin:
   - Ve a "Usuarios" → "Nuevo Usuario"
   - El sistema creará automáticamente tanto el usuario auth como el perfil

### Solución 3: Verificar Configuración de Supabase

Si continúan los problemas:

1. Verifica las variables de entorno en `.env`:
```bash
VITE_SUPABASE_URL=tu_url_correcta
VITE_SUPABASE_ANON_KEY=tu_anon_key_correcta
```

2. Verifica que la migración de BD se ejecutó correctamente:
```sql
-- Verifica que la tabla profiles existe
SELECT * FROM profiles LIMIT 1;

-- Verifica que los tipos enum existen
SELECT typname FROM pg_type WHERE typname = 'user_role';
```

3. Verifica las políticas RLS:
```sql
-- Todas las tablas deben tener RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'reviews', 'checklist_items');
```

## Mejoras Implementadas en el Login

### ✨ Nuevas Funcionalidades

1. **Mostrar/Ocultar Contraseña**
   - Botón con icono de ojo para alternar visibilidad
   - Transición suave al cambiar

2. **Validación de Email en Tiempo Real**
   - Verifica formato válido mientras escribes
   - Indicador visual de error (borde rojo + icono)
   - Mensaje de error específico

3. **Animaciones de Entrada**
   - Fade in del fondo con patrón de puntos
   - Slide up del formulario con delays escalonados
   - Scale del logo

4. **Feedback Visual Mejorado**
   - Iconos en campos de entrada (Mail, Lock)
   - Animación "shake" en errores de validación
   - Animación "slideDown" en mensajes de error
   - Hover effects en el botón (scale up/down)

5. **Validaciones de Formulario**
   - Email: Formato válido requerido
   - Contraseña: Mínimo 6 caracteres
   - Feedback en tiempo real
   - Botón deshabilitado si hay errores

6. **Mejores Mensajes de Error**
   - "Email o contraseña incorrectos" (en vez de mensaje genérico)
   - "Por favor confirma tu email" (si email no confirmado)
   - "Email inválido" (validación de formato)

### 🎨 Mejoras Visuales

- Fondo con patrón de puntos animado
- Transiciones suaves en todos los elementos
- Shadow elevada en hover del botón
- Backdrop blur en el card
- Iconos contextiales en cada campo
- Estados de focus mejorados

## Testing

Para probar el login:

1. **Test de Email Inválido**
   - Escribe "test@test" → Debe mostrar "Email inválido"

2. **Test de Contraseña Corta**
   - Escribe menos de 6 caracteres → Debe mostrar "Mínimo 6 caracteres"

3. **Test de Credenciales Incorrectas**
   - Email correcto + contraseña incorrecta → "Email o contraseña incorrectos"

4. **Test de Login Exitoso**
   - Credenciales correctas → Debe redirigir al dashboard correspondiente al rol

## Preguntas Frecuentes

### ¿Por qué veo "Profile not found"?

Esto ocurre cuando el usuario existe en `auth.users` pero no en `profiles`. Sigue la Solución 1 arriba.

### ¿Cómo creo el primer usuario admin?

Sigue la guía en `SETUP.md` o ejecuta:

```sql
-- 1. Crea el usuario en Authentication > Users (Dashboard)
-- 2. Ejecuta esto con el UUID del usuario:
INSERT INTO profiles (id, role, full_name, email, active, metadata)
VALUES (
  'UUID_DEL_USUARIO',
  'admin',
  'Administrador',
  'admin@frangarciacars.com',
  true,
  '{}'::jsonb
);
```

### ¿Puedo desactivar la confirmación de email?

Sí, en Supabase Dashboard:
1. Authentication > Settings
2. Email Auth
3. Desmarca "Confirm email"

### ¿Cómo reseteo una contraseña?

Desde el Dashboard de Supabase:
1. Authentication > Users
2. Click en el usuario
3. "Send Password Reset Email" o "Set Password"

## Contacto

Si el problema persiste después de seguir estos pasos, revisa:
- Los logs de Supabase Dashboard
- La configuración de RLS
- Las variables de entorno

---

**Última actualización**: 2026-01-12
