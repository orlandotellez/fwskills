# 01 — Stack

Estado de este documento: describe el stack **real** de `frontend/package.json`
y marca como `[POR AÑADIR]` lo que todavía no está instalado.

## Framework

**Astro 7**, con salida estática. No hay SSR, no hay endpoints de API, no hay
renderizado por petición. El HTML se genera una vez en `astro build` y se sirve
como archivos.

- Dependencia: `astro ^7.2.1`.
- Modo: `output: 'static'` (implícito, no se declara porque es el valor por
  defecto). `frontend/astro.config.mjs` solo define `site`.
- El renderizado por componentes `.astro` ocurre **exclusivamente en build**.
  Un `.astro` nunca se ejecuta en el navegador.

`astro.config.mjs` actual:

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://example.com',
});
```

## Lenguaje

**TypeScript** en modo estricto.

- Dependencia: `typescript ^6.0.3` (devDependency).
- `tsconfig.json` extiende `astro/tsconfigs/strict`, incluye
  `[".astro/types.d.ts", "**/*"]` y excluye `["dist"]`.

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

El tipado estricto se aplica a:

- **Frontmatter de componentes** (`Props` tipadas por interfaz en cada `.astro`).
- **Esquemas de la colección de contenido** (`src/content.config.ts`, con Zod vía
  `astro:content`). Un `SKILL.md` mal formado debe **romper el build**, no
  producir una página silenciosamente vacía.
- **Cliente CLI descrito en el módulo `backend`**: el mismo contrato de
  frontmatter se valida allí, de forma independiente.

## Versiones clave

| Paquete | Versión declarada | Tipo | Estado |
|---|---|---|---|
| `astro` | `^7.2.1` | dependencia | `[EXISTE]` |
| `lucide-astro` | `^0.556.0` | dependencia | `[EXISTE]` |
| `typescript` | `^6.0.3` | devDependency | `[EXISTE]` |
| `@astrojs/check` | `^0.9.10` | devDependency | `[EXISTE]` |
| `@astrojs/starlight` | sin fijar | dependencia | `[POR AÑADIR]` |
| Node.js | `>=22.12.0` (`engines`) | requisito | `[EXISTE]` |
| Nombre del paquete | `fwskills` | — | `[EXISTE]` |
| Versión del paquete | `1.0.0` | — | `[EXISTE]` |
| Tipo de módulo | `module` (ESM) | — | `[EXISTE]` |

## Por qué

### Astro 7 y no un SPA

El catálogo tiene una sola dimensión genuinamente dinámica —los filtros del
catálogo— y todo lo demás es contenido. Un SPA obligaría a enviar un runtime de
JavaScript completo para resolver algo que cabe en un `<script>` de 40 líneas y
un `URLSearchParams`. Con Astro:

- **Cero JavaScript por defecto.** Las páginas de skills, `/instalacion`,
  `/contribuir` y `/docs/*` no necesitan JS para leerse.
- **Una URL por skill, indexable.** `getStaticPaths` produce un archivo por
  combination `[categoria]/[slug]`, que es lo que necesitan el buscador, GitHub
  Pages y las previsualizaciones de Open Graph.
- **Contenido como archivos.** `skills/<categoria>/<slug>/SKILL.md` es la única
  fuente de verdad. El sitio y el CLI leen el mismo árbol.

### TypeScript strict

El frontmatter es un **contrato entre dos consumidores** (el sitio y el CLI) y
entre varias personas (quien escribe la skill y quien revisa el PR). Un campo
renombrado o un `tags` que pasa de array a string rompe el build de ambos lados
con un mensaje concreto, en lugar de producir una página sin versión o sin
tags en producción. `astro/tsconfigs/strict` es el punto de partida correcto
para ese contrato.

### `lucide-astro`

`lucide-astro ^0.556.0` aporta iconos como componentes Astro sin coste de
runtime: se renderizan a SVG estático. Se usa para la navegación del header, los
iconos de categoría, las flechas de CTA, el `+` del acordeón, los iconos del pie
y los iconos de GitHub/npm. Los iconos decorativos llevan `aria-hidden="true"`
y los que son el único contenido de un control llevan
`aria-label` en el control.

### Starlight como integración pendiente

`@astrojs/starlight` es `[POR AÑADIR]` y es la decisión registrada en
**ADR-04**. Se elige porque la sección `/docs/*` necesita, hoy, cosas que
Astro a secas no da:

| Necesidad de `/docs` | Cómo la resuelve Starlight |
|---|---|
| Sidebar izquierdo agrupado y colapsable | `sidebar` del config, con grupos por sección |
| Índice derecho pegajoso que resalta la sección visible | TOC automática con `rehype`/`IntersectionObserver` |
| Navegación anterior/siguiente | Integrada en el pie del contenido |
| Buscador `Ctrl/⌘+K` sobre skills **y** docs | Índice de búsqueda generado en build, sin servidor |
| Callouts (nota, consejo, advertencia, peligro) | `remark-directive` con directivas propias |
| Pestañas de contenido y tablas responsive | Componentes propios renderizados desde MD |
| Enlaces de anclaje en cada encabezado | `rehype-slug` + `rehype-autolink-headings` |
| Enlaces "Editar esta página en GitHub" | Configuración por página |

Starlight **no** añade un servidor: sigue siendo un generador estático. Lo que
aporta son plugins MD y la estructura de navegación.

> Punto de fricción a resolver en la integración: el buscador de Starlight
> indexa el contenido MD de `/docs`, pero el disparador del header del sitio
> debe además cubrir las **skills**, cuyo contenido vive en `SKILL.md` fuera de
> `/docs`. La solución especificada es un índice unificado construido en build y
> servido como JSON estático que el modal del header consulta; ver
> [`06-estado.md`](./06-estado.md).

## Comandos

Scripts reales de `frontend/package.json`:

| Comando | Script real | Resultado |
|---|---|---|
| `npm run dev` | `astro dev` | Servidor de desarrollo en `http://localhost:4321` |
| `npm run build` | `astro build` | Genera `dist/` estático |
| `npm run preview` | `astro preview` | Sirve el build de `dist/` localmente |
| `npm run astro` | `astro` | Acceso directo al CLI de Astro (passthrough de argumentos) |

Comandos que deben añadirse al `package.json`:

| Comando propuesto | Script | Estado |
|---|---|---|
| `npm run check` | `astro check` | `[POR AÑADIR]` — tipos de `.astro` y `.ts` |
| `npm run lint` | `eslint .` | `[POR AÑADIR]` — ESLint flat config |
| `npm run format` | `prettier --write .` | `[POR AÑADIR]` — formateo |
| `npm run test` | `vitest run` | `[POR AÑADIR]` — pruebas unitarias |
| `npm run test:e2e` | `playwright test` | `[POR AÑADIR]` — recorridos end-to-end |
| `npm run validate` | script de validación de `skills/**/SKILL.md` | `[POR AÑADIR]` — usado también por la página `/contribuir` |

El comando `validate` es deliberadamente **compartido**: la misma validación que
rompe el build del sitio debe poder ejecutarse en local por quien escribe una
skill, tal como documenta el paso 4 de la línea de tiempo de `/contribuir`
("validar localmente con `npm run validate`").

## Variables de entorno

`frontend/.env.example` ya documenta las dos variables existentes. Copiar el
archivo a `.env` y ajustar:

| Variable | Uso | Obligatoria en build |
|---|---|---|
| `PUBLIC_SITE_URL` | `site` en `astro.config.mjs` y URL canónica del `Layout` | Sí, para canonical y Open Graph |
| `PUBLIC_SITE_DESCRIPTION` | `<meta name="description">` por defecto | No |

`GITHUB_TOKEN` es opcional y solo se lee en build para las métricas de GitHub
(ver [`../backend/07-integraciones.md`](../backend/07-integraciones.md)). Al
llevar el prefijo ausente de `PUBLIC_`, Astro **no** la expone al cliente.
