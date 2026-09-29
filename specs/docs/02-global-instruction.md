# 02 — Instrucciones globales

## Visión general

fwskills es un repositorio de skills para agentes de IA con dos salidas: un sitio
estático y un paquete de npm. La regla que gobierna todo el árbol es que **el
contenido del catálogo vive en el sistema de archivos y todo lo demás se deriva de
él**. Las carpetas `skills/**/SKILL.md` son la única fuente de verdad; el catálogo, sus
páginas de detalle, el índice de búsqueda, el `sitemap.xml` y las páginas de categoría
se generan en tiempo de build a partir de esas carpetas.

De ahí se siguen tres hechos que un lector nuevo debe tener presentes antes de abrir
cualquier archivo:

1. **El proyecto es 100 % estático.** No hay servidor, ni base de datos, ni
   autenticación. Los datos que varían en el tiempo (estrellas, colaboradores,
   releases, fecha de actualización) se resuelven en build.
2. **Agregar contenido no es un cambio de código.** Publicar una skill nueva o una
   categoría nueva no debe requerir modificar el frontend (ADR-05).
3. **El sitio no envía JavaScript al navegador** salvo lo estrictamente necesario.
   La landing y el catálogo no requieren ninguna interactividad en el cliente.

El repositorio se organiza como monorepo con npm workspaces (ADR-06) una vez exista el
paquete del CLI. En este momento solo existe `frontend/`, generado como plantilla
inicial.

## Índice de módulos

| Módulo | Archivos | Propósito |
| --- | --- | --- |
| `frontend/` | `package.json`, `astro.config.mjs`, `tsconfig.json`, `.env.example`, `README.md` | Configuración del workspace del sitio. Declara Astro 7, TypeScript y el requisito de Node >= 22.12.0. |
| `frontend/` | `src/layouts/Layout.astro` | `<head>`, SEO, bloque `<style is:global>` con los design tokens y las utilidades CSS compartidas (`.container`, `.section`, `.btn-primary`, `.card`, `.tag`, grillas y `breakpoints`). Punto único donde hoy se declaran los tokens (ADR-07). |
| `frontend/` | `src/sections/{Header,Hero,Features,DesignSkills,HowItWorks,CTA,Footer}.astro` | Secciones de la landing, cada una un componente `.astro` independiente y reutilizable. |
| `frontend/` | `src/pages/index.astro` | Compone `Layout.astro` más las secciones y produce `/`. |
| `frontend/` | `public/favicon.svg` | Recurso estático servido tal cual. |
| `backend/` → `packages/cli/` | `package.json`, `bin/`, `src/` | Paquete npm con el CLI. Es el código no-navegador del proyecto: sistema de archivos, resolución del registro de skills y operaciones de git. Se invoca como `npx fwskills add <skill>`. No expone endpoints HTTP (ADR-01). |
| `skills/` | `**/SKILL.md` | Contenido del catálogo. Una carpeta por skill, agrupada por área (`specs`, `design`, `qa`, `security`, y las que se agreguen). Contenido versionado, **no** un workspace de npm. |
| `db/` | — | **No existe por decisión.** Sin persistencia: no hay esquema, migraciones ni ORM. El modelo de datos es el sistema de archivos. Ver ADR-02. |
| `api/` | — | **No existe por decisión.** Sin servidor, sin cliente móvil y sin integraciones de terceros. Ver ADR-03. |

## Referencia rápida del stack

| Elemento | Versión / valor | Dónde vive |
| --- | --- | --- |
| Node.js | `>=22.12.0` | `frontend/package.json` → `engines.node` |
| npm workspaces | workspaces de npm | `package.json` raíz (pendiente de crear, ADR-06) |
| Astro | `^7.2.1` | `frontend/package.json` → `dependencies` |
| TypeScript | `^6.0.3` | `frontend/package.json` → `devDependencies` |
| Modo TypeScript | `astro/tsconfigs/strict` | `frontend/tsconfig.json` → `extends` |
| Íconos | `lucide-astro` `^0.556.0` | `frontend/package.json` → `dependencies` |
| Verificación de tipos | `@astrojs/check` `^0.9.10` | `frontend/package.json` → `devDependencies` |
| URL del sitio | `PUBLIC_SITE_URL` | `frontend/.env.example` → `astro.config.mjs` (`site`) |
| Descripción por defecto | `PUBLIC_SITE_DESCRIPTION` | `frontend/.env.example` → `<meta name="description">` |
| Colecciones de contenido | Colección `skills` con esquema Zod | Pendiente de crear (ADR-05) |
| Documentación | Astro Starlight con puente de tokens | Pendiente de crear (ADR-04) |
| CLI | Node/TypeScript, publicado en npm | Pendiente de crear (ADR-01) |
| Sistema de diseño | Custom properties CSS, modo claro y oscuro | `frontend/src/layouts/Layout.astro` → `<style is:global>` (ADR-07) |

## Cómo navegar este árbol

Orden recomendado para una persona que llega al proyecto por primera vez:

1. **`descripcion-proyecto.md`** — resumen del proyecto en un párrafo.
2. **`docs/01-descripcion-proyecto.md`** — qué es, para quién, qué problema resuelve,
   funcionalidades numeradas y qué queda fuera de alcance.
3. **`docs/02-global-instruction.md`** — este documento: mapa de módulos y stack.
4. **`docs/03-ejecucion-local.md`** — instalación, ejecución, pruebas y build con los
   comandos reales.
5. **`docs/04-buenas-practicas.md`** — convenciones de código, estructura de carpetas,
   commits, ramas y revisión.
6. **`docs/05-requisitos-no-funcionales.md`** — los objetivos medibles: rendimiento,
   seguridad, escalabilidad, disponibilidad y mantenibilidad.
7. **`docs/06-glosario.md`** — vocabulario común del árbol.
8. **`docs/07-decisiones.md`** — ADR-01 a ADR-07, con contexto, alternativas y
   consecuencias. Léalo **antes** de proponer un cambio estructural: la mayoría de las
   preguntas que aparecen al leer el código ya están respondidas ahí.

Después de ese recorrido, siga con los documentos de módulo en `specs/modules/`, que
detallan la implementación de cada módulo por separado.

### Rutas y comandos de referencia

- `http://localhost:4321` — servidor de desarrollo (`npm run dev`).
- `/` — landing.
- `/skills` — catálogo (ruta prevista).
- `/skills/[categoria]/[slug]` — detalle de una skill (ruta prevista, ADR-05).
- `npx fwskills add <skill>` — instalación de una skill desde el paquete npm.
- `dist/` — salida del build estático.
