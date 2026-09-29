# 05 — Calidad

## Estado real hoy

Esto es lo que hay en `frontend/package.json` a fecha de estas specs:

| Elemento | Estado | Detalle |
|---|---|---|
| Scripts | `dev`, `build`, `preview`, `astro` | `[EXISTE]` |
| `typescript ^6.0.3` + `astro/tsconfigs/strict` | `[EXISTE]` | Strict ya está activo |
| `@astrojs/check ^0.9.10` | `[EXISTE]` como dependencia, pero **no hay script que lo ejecute** | El binario está instalado y nadie lo invoca |
| Linter | **No existe** | Sin ESLint, sin Stylelint, sin plugin de Astro |
| Formateador | **No existe** | Sin Prettier, sin `dprint`, sin Biome |
| Runner de tests | **No existe** | Sin Vitest, sin Playwright, sin ningún framework |
| `npm run validate` | **No existe** | La validación de frontmatter no está implementada |
| CI | **No existe** | Sin workflow que ejecute nada |

Todo lo que sigue está **especificado, no implementado**. Las marcas
`[POR AÑADIR]` son explícitas y consistentes en todo el documento.

---

## Lint

### `astro check` — tipos de `.astro` y `.ts`

`@astrojs/check` ya está instalado; falta el script que lo ejecute.

```json
{
  "scripts": {
    "check": "astro check",
    "check:watch": "astro check --watch"
  }
}
```

Qué detecta, y por qué importa aquí:

- Props sin tipar o con tipos incompatibles en cada `.astro`.
- Tipos de la colección `skills` mal resueltos tras el esquema Zod: si
  `skill.data.featured` deja de ser `boolean`, `astro check` falla **antes** de
  que alguien mire la página en el navegador.
- Acceso a `import.meta.env.PUBLIC_*` que no existe en `.env.example`.
- Imports rotos tras mover secciones a `components/`.

Salida esperada: **0 errores y 0 advertencias**. Las advertencias no se ignoran
con `--minimumSeverity`; se resuelven.

### ESLint (configuración plana)

`[POR AÑADIR]`. ESLint con **flat config** (`eslint.config.js`), no `.eslintrc`.

| Extensión | Reglas |
|---|---|
| `.astro` | `eslint-plugin-astro` |
| `.ts` / `.mjs` | `@typescript-eslint` con `parserOptions.project` apuntando al `tsconfig.json` |
| Styling | Stylelint sobre los `<style>` de los `.astro`, sin solapamiento con ESLint |

Reglas que tienen peso real en este proyecto:

| Regla | Por qué |
|---|---|
| `no-console` (permitido solo en `src/scripts/` con aviso) | El sitio no debe imprimir nada |
| `@typescript-eslint/no-floating-promises` | Una promesa sin await en un script es un fallo silencioso |
| `@typescript-eslint/consistent-type-imports` | Los `import type` no deben generar código en build |
| `eqeqeq`, `no-implicit-coercion` | Los filtros del catálogo comparan strings de la URL |
| `astro/no-set-html-directive` salvo lista blanca | El cuerpo del `SKILL.md` es contenido de terceros: se sanea, no se inyecta |

Stylelint, si se añade, verifica lo que importa para este sistema de diseño:
`color-hex-case: lower`, prohibición de colores literales fuera de
`src/styles/tokens.css`, y `property-no-unknown`.

### Validación de skills

`[POR AÑADIR]`. `npm run validate` recorre `skills/**/SKILL.md` y aplica **el
mismo esquema Zod** que usa la colección de contenido:

| Regla | Fallo |
|---|---|
| Los 8 campos presentes | Falta un campo obligatorio |
| Tipos correctos (`featured` booleano estricto, `tags` array de string) | Tipo inválido |
| `category` coincide con la carpeta que la contiene | La skill dice `qa` y vive en `design/` |
| `version` con formato semver | `1.0` en lugar de `1.0.0` |
| Slug en minúsculas, con guiones, sin acentos | `Crear Specs` en lugar de `crear-specs` |
| Sin secretos detectables (cadenas tipo token o clave privada) | Falso positivo de un ejemplo de documentación: la clave se declara en una lista de excepciones versionada |
| `author` con formato `usuario` o URL de perfil | Autor no resoluble a un enlace de GitHub |

Es el paso 4 de la línea de tiempo de `/contribuir`, y es exactamente lo que
`astro build` ejecuta por su cuenta. Que exista como comando aparte es lo que
permite a quien escribe una skill **validar antes de abrir el PR**.

---

## Formateo

`[POR AÑADIR]`. Prettier con un único archivo de configuración en la raíz del
workspace, porque los archivos que se tocan viven en tres sitios distintos
(`frontend/`, `skills/`, `packages/cli/`) y no puede haber una respuesta
distinta según dónde se ejecute.

| Ajuste | Valor | Motivo |
|---|---|---|
| `printWidth` | 100 | Las tablas Markdown de la documentación son legibles a 100 |
| `semi` | `true` | Consistente con el código existente |
| `singleQuote` | `true` | Consistente con el código existente |
| Plugins | `prettier-plugin-astro` | Formatea el frontmatter de los `.astro` |
| Markdown | `proseWrap: preserve` | No reenvuelve los `SKILL.md`: quien escribe la skill controla su texto |

**Los `SKILL.md` se excluyen del formateo automático.** Es una decisión
deliberada: el cuerpo de una skill es documentación para agentes y para personas,
y un formateo que reescribe el texto de otra persona genera ruido en el diff de
la revisión. El frontmatter sí se valida, pero no se reformatea solo.

Comandos: `npm run format` (`--write`) y `npm run format:check` (`--check`).

---

## Tests

Nada configurado. Esto es lo `[POR AÑADIR]`.

| Nivel | Herramienta | Qué cubre | Prioridad |
|---|---|---|---|
| Tipos | `astro check` | Todo el proyecto | **Bloqueante** |
| Frontmatter | Script `validate` | `skills/**/SKILL.md` | **Bloqueante** |
| Unidad | Vitest | `src/lib/catalog.ts` (agrupación, destacadas, relacionadas), `search-index.ts`, y los helpers puros de `src/scripts/` | Alta |
| Integración | Vitest + entorno de jsdom | Filtros del catálogo contra la URL, tabs de gestor de paquetes con `localStorage`, menú móvil con foco atrapado, toggle de tema | Alta |
| E2E | Playwright | Recorrido crítico de cada pantalla: `/`, `/skills`, una ficha, `/instalacion`, `/docs/cli/add`, `/contribuir`, 404 | Media |

### Qué debe probar la suite de unidad, en concreto

| Función | Casos |
|---|---|
| Agrupar skills por categoría | Categoría vacía, categoría con 1 skill, conteo correcto |
| Seleccionar destacadas | Menos de 6 con `featured: true`, más de 6 (recorte determinista), ninguna |
| Skills relacionadas | Misma categoría, tags compartidos, sin coincidencia (devuelve menos de 3, nunca relleno basura) |
| Índice de búsqueda | Normalización de mayúsculas y acentos, coincidencia por tag, exclusion de la página actual |
| Filtros del catálogo | `?categoria=` + `?q=` + `?tag=` combinados, parámetro desconocido ignorado, valores vacíos eliminados de la URL |

### Qué debe probar la suite E2E, en concreto

| Recorrido | Aserciones |
|---|---|
| Catálogo filtrado | Escribir en el buscador reduce el contador; la URL contiene `?q=`; recargar conserva el filtro; "limpiar filtros" restaura el total |
| Instalación de una skill | Copiar el comando produce feedback "¡Copiado!" y un anuncio `aria-live` |
| Menú móvil | `aria-expanded` cambia a `true`, el foco queda dentro del panel, `Esc` lo cierra, el scroll del `body` está bloqueado mientras está abierto |
| Tema | El toggle cambia `data-theme` en `<html>` y sobrevive a la navegación |
| Documentación | `Ctrl/⌘+K` abre el buscador; Enter lleva a la página encontrada |

---

## Accesibilidad

Objetivo: **WCAG 2.1 AA**.

### Checklist por pantalla

| Punto | Requisito | Cómo se verifica |
|---|---|---|
| Contraste | Todo el texto ≥ 4.5:1; texto grande ≥ 3:1 | Ratios ya calculados y publicados en [`02-design.md`](./02-design.md) |
| Foco visible | Anillo `outline: 2px solid var(--accent); outline-offset: 2px` en **todo** elemento enfocable, incluido sobre fondos de acento | Recorrido con teclado en E2E |
| Navegación por teclado | Todo se opera sin ratón: menú móvil, modal de búsqueda, tabs, acordeón, filtros, enlaces del TOC | E2E con `Tab` / `Shift+Tab` / `Enter` / `Esc` / flechas |
| Foco atrapado | Modal de búsqueda y menú móvil atrapan el foco; al cerrar, el foco **vuelve** al elemento que los abrió | E2E |
| Un solo `<h1>` | Exactamente uno por página; el resto de encabezados en orden jerárquico sin saltos | Auditoría por página |
| Etiquetas | Todo `<input>` tiene su `<label>` asociado (búsqueda de skills y de docs, filtros) | Auditoría |
| Iconos decorativos | `aria-hidden="true"` en todo SVG que no aporta información | Auditoría |
| Mensajes dinámicos | `aria-live="polite"` en: confirmación de copia, contador de resultados, resultados del buscador | Auditoría |
| Toggles | `aria-expanded` + `aria-controls` en acordeones, menú móvil y collapsibles | Auditoría |
| Alternativa de texto | `alt` con el **nombre** de la persona en los avatares de contribuidores; `alt=""` en decorativos | Auditoría |
| Objetivo táctil | ≥ 44×44px en móvil para botón de menú, cerrar, tabs y chips | Auditoría |
| Scroll | No hay scroll horizontal no intencionado; las únicas excepciones son bloques de código y chips de filtro en móvil | Comprobación a 320px, 375px, 768px, 1024px, 1440px |
| Movimiento | `prefers-reduced-motion: reduce` desactiva el reveal y los hovers animados | Comprobación con la preferencia activada |
| Formularios | Cada campo tiene nombre accesible, y los errores se asocian con `aria-describedby` cuando existen | Auditoría |
| Fuente y zoom | Sin texto en unidades `px` menores que 13px, y sin `user-scalable=no` | Comprobación a zoom 200% |

### Puntos de riesgo conocidos

| Riesgo | Mitigación |
|---|---|
| El `SKILL.md` es contenido de terceros y puede traer encabezados mal marcados | El cuerpo se inyecta como Markdown ya renderizado, nunca como HTML arbitrario |
| El contador de estrellas de GitHub es texto dinámico en el header | Vive en un nodo con `aria-live="polite"` solo si cambia; en build no cambia, así que **no** lleva `aria-live` |
| Los tabs de gestor de paquetes cambian contenido visible | `role="tabpanel"` con `aria-labelledby` apuntando al tab activo |
| El panel móvil tapa el contenido | `overflow: hidden` en `body` + `aria-modal` en el panel |

---

## Rendimiento objetivo

**Lighthouse ≥ 95 en las cuatro categorías** en producción, medido sobre el build
estático servido por HTTP (`npm run build && npm run preview`), no sobre el
servidor de desarrollo.

| Categoría | Objetivo | Por qué es alcanzable |
|---|---|---|
| Performance | ≥ 95 | HTML estático, JS mínimo, fuentes autoalojadas |
| Accessibility | ≥ 95 | Checklist de arriba |
| Best Practices | ≥ 95 | HTTPS, sin consola, sin dependencias de terceros en runtime |
| SEO | ≥ 95 | `title` y `description` únicos, canonical, `sitemap.xml`, `robots.txt`, Open Graph |

### Presupuesto de peso

| Recurso | Presupuesto | Motivo |
|---|---|---|
| HTML por página | ≤ 60 KB sin comprimir | La ficha más pesada es el catálogo con todas las skills |
| CSS total | ≤ 40 KB sin comprimir | Un único `tokens.css` + `base.css` + estilos por componente |
| JS total por página | ≤ 15 KB sin comprimir, y solo en las páginas que lo necesitan | Las islas de `src/scripts/`, sin framework |
| Fuentes | 2 familias, subconjunto de pesos | Inter (400, 500, 600) y JetBrains Mono (400) |
| Imágenes | AVIF/WebP, `width`/`height` obligatorios, `loading="lazy"` salvo la imagen LCP | Avatares y `og:image` |
| Solicitudes de terceros | **0** | Sin CDN de fuentes, sin analytics, sin scripts embebidos |

### Señales de Core Web Vitals

| Métrica | Objetivo |
|---|---|
| LCP | ≤ 2.0s (el H1 es texto; no hay imagen LCP en ninguna pantalla) |
| CLS | ≤ 0.05 (todo con dimensiones reservadas; el contador de resultados no reserva altura porque no empuja contenido) |
| INP | ≤ 150ms (las interacciones son de bajo costo: un listener, una clase, un `URLSearchParams`) |

### Cosas que hay que evitar activamente

| Anti-patrón | Por qué está prohibido aquí |
|---|---|
| Cliente de hydration de React/Vue/Svelte | Enviaría el peso de un framework para resolver lo que hace un `<script>` de 40 líneas |
| `astro:transitions` sin justificar | Ver [`06-estado.md`](./06-estado.md): obliga a re-suscribir todos los listeners en `astro:after-swap` |
| Peticiones a terceros desde el navegador | Rompe el presupuesto de solicitudes y la privacidad |
| Imágenes de OSS sin dimensiones | Provoca CLS |
| Fuentes sin `font-display: swap` | Bloquea el primer pintado |

---

## Comandos

### Existentes hoy

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:4321` |
| `npm run build` | Genera `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm run astro` | CLI de Astro |

### A añadir

| Comando | Script | Propósito |
|---|---|---|
| `npm run check` | `astro check` | Tipos de `.astro` y `.ts`. **Bloqueante.** |
| `npm run validate` | script de validación de skills | Valida `skills/**/SKILL.md` contra el esquema de 8 campos. **Bloqueante.** |
| `npm run lint` | `eslint .` | Lint |
| `npm run lint:css` | `stylelint "src/**/*.astro"` | Lint de estilos |
| `npm run format` | `prettier --write .` | Formateo |
| `npm run format:check` | `prettier --check .` | Formateo en modo verificación |
| `npm run test` | `vitest run` | Unidad + integración |
| `npm run test:watch` | `vitest` | Unidad + integración en vivo |
| `npm run test:e2e` | `playwright test` | Recorridos E2E |
| `npm run test:a11y` | variante de Playwright con aserciones de accesibilidad en cada página | Auditoría automatizada |
| `npm run verify` | `npm run check && npm run validate && npm run lint && npm run format:check && npm run test` | Puerta única de calidad |

`verify` es el comando que debe correr quien cierra una tarea. Los tres pasos
bloqueantes (`check`, `validate`, `lint`) son los que hacen que el build no pueda
generar una página con datos falsos.
