# Fran García Cars - Monorepo

Este repositorio contiene todo el ecosistema web de **Fran García Cars**.
El proyecto está organizado como un Monorepo, donde cada carpeta dentro de `apps/` representa una landing page o aplicación independiente bajo el dominio principal.

## Estructura del Proyecto

El dominio principal es `frangarciacars.com`.

| Carpeta (apps/) | URL Pública | Descripción |
|-----------------|-------------|-------------|
| **landing** | `/` (Home) | Landing Page Principal |
| **bienvenida** | `/bienvenida` | Página de bienvenida (anteriormente `fran-prueba`) |
| **confirmacion**| `/confirmacion-llamada` | Confirmación de agenda de llamada |
| **testimonios** | `/testimonios` | Muro de testimonios de clientes |
| **formulario-exito** | `/formulario-completado` | Confirmación tras rellenar formulario |
| **sesion** | `/sesion-estrategica` | Landing para sesión estratégica |
| **revisiones** | `(App Independiente)` | Aplicación PWA para inspección de vehículos |

## Desarrollo

Cada proyecto es independiente y tiene su propia configuración de Vite/React.

### Para trabajar en un proyecto:
1. Navega a la carpeta: `cd apps/nombre-proyecto`
2. Instala dependencias: `npm install`
3. Inicia el servidor: `npm run dev`

### Git
Todo el código está unificado en este repositorio para facilitar la gestión centralizada del código y el despliegue.
