# Módulo `frontend` — sitio Astro de fwskills

## Qué es

El sitio público de **fwskills**: landing, catálogo de skills, fichas de skill,
guía de instalación y documentación. Es **100% estático**: no hay backend, ni
base de datos, ni login, ni panel de administración, ni comentarios, ni
valoraciones, ni telemetría. Todo el contenido —incluidos los datos dinámicos
que vienen de GitHub— se resuelve **en tiempo de build**.

Vive en `frontend/` y es el workspace npm `fwskills` (versión `1.0.0`).

## Estado del repositorio

| Estado | Significado |
|---|---|
| `[EXISTE]` | Está en el repositorio hoy, verificable en `frontend/` |
| `[ESPECIFICADO]` | Comportamiento definido en estas specs, aún no implementado |
| `[POR AÑADIR]` | Falta instalar/configurar la dependencia o el archivo |

Estado real a fecha de estas specs:

- `[EXISTE]` `frontend/package.json`, `frontend/astro.config.mjs`,
  `frontend/tsconfig.json`, `frontend/.env.example`, `frontend/public/favicon.svg`.
- `[EXISTE]` `frontend/src/layouts/Layout.astro` (372 líneas, `<style is:global>`
  con un bloque `:root` **solo oscuro** y tokens nombrados por apariencia).
- `[EXISTE]` `frontend/src/sections/{Header,Hero,Features,DesignSkills,HowItWorks,CTA,Footer}.astro`.
- `[EXISTE]` `frontend/src/pages/index.astro`.
- `[EXISTE]` `frontend/README.md` (documenta `npm run dev` → `http://localhost:4321`,
  `npm run build` → `dist/`, `npm run preview`).
- `[POR AÑADIR]` carpeta `skills/` en la raíz del repositorio: **no existe todavía**.
- `[POR AÑADIR]` `cli/`: **no existe todavía**.
- `[POR AÑADIR]` `src/content/` (colección de contenido), `src/components/`,
  `src/lib/`, `src/styles/`, integración **Starlight** (`@astrojs/starlight`) y
  su configuración.
- `[POR AÑADIR]` linter, formateador, runner de tests, `sitemap.xml` y `robots.txt`.

## Archivos de este módulo

| Archivo | Propósito |
|---|---|
| [`01-stack.md`](./01-stack.md) | Stack tecnológico: Astro 7, TypeScript strict, `lucide-astro`, Starlight como integración pendiente, y los comandos reales de `package.json`. |
| [`02-design.md`](./02-design.md) | Design system: tokens semánticos claros y oscuros con ratios WCAG verificados, bordes, resaltado de sintaxis, escala tipográfica, espaciado, componentes base, iconografía, modo oscuro y la deuda actual de `Layout.astro`. |
| [`03-architecture.md`](./03-architecture.md) | Árbol de carpetas actual y objetivo, capas, ausencia de *data fetching* en runtime, la tubería de contenido en build time, el registro completo de rutas y cómo la colección `skills` + `getStaticPaths` generan una página por skill. |
| [`04-screens.md`](./04-screens.md) | Especificación de las 7 pantallas (Inicio, Catálogo, Ficha de skill, Instalación, Documentación, Contribuir, 404) con propósito, datos, acciones, navegación y estados. |
| [`05-quality.md`](./05-quality.md) | Lint, formateo, tests, accesibilidad, rendimiento objetivo y comandos. Declara explícitamente que hoy **no hay linter ni runner de tests**. |
| [`06-estado.md`](./06-estado.md) | Modelo de estado: parámetros de URL para los filtros del catálogo, `localStorage` para tema y gestor de paquetes, estado efímero de modal y menú móvil con foco atrapado. |

## Referencias cruzadas

- **ADRs**: Starlight como motor de la documentación está registrado como
  **ADR-04**; la migración de tokens por apariencia a tokens semánticos, como
  **ADR-07**. Ambos viven en la raíz de `specs/` y no se reproducen aquí.
- **Módulo `backend`**: el CLI `npx fwskills` que este sitio publica está
  especificado en [`../backend/`](../backend/README.md). La documentación del
  sitio (`/instalacion`, `/docs/cli/*`) y el CLI **no** pueden divergir: ambos
  consumen el mismo conjunto de skills en `skills/`.
- **Skills**: las skills de diseño que usan este documento como referencia están
  en `.opencode/skills/design/` del repositorio.

## Reglas del módulo

1. El contenido del catálogo se deriva **solo** de `skills/`. Añadir una skill o
   una categoría **no puede requerir ninguna edición en `frontend/`**.
2. Ningún dato se pide en runtime. Si un valor depende del mundo exterior
   (GitHub), se resuelve en build y se serializa en el HTML generado.
3. El sitio envía JavaScript únicamente donde es estrictamente necesario. El
   resto es DOM plano más CSS.
4. Todo token nuevo se declara con un **rol semántico** (`--text-secondary`,
   `--accent-hover`), nunca con un nombre de apariencia (`--primary-dark`).
5. Ningún valor de color se introduce sin su ratio WCAG verificado por cálculo.
