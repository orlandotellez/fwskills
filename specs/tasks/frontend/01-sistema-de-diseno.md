# Sistema de diseño

## Estado Actual

`frontend/src/layouts/Layout.astro` tiene 372 líneas y concentra todo el sistema
visual en un único `<style is:global>` cuyo bloque `:root` (líneas 35-93) declara
**solo el modo oscuro**, con tokens nombrados por apariencia: `--bg-base`,
`--bg-card`, `--text-primary`, `--text-on-primary`, `--primary`, `--primary-dark`,
`--primary-light`, `--secondary`, `--accent-teal`, `--accent-amber`, `--footer-bg`,
`--cta-bg`. `--primary` vale `#04092e` y `--primary-dark` vale `#8aa2ff`: el token
llamado «dark» es más claro que el llamado «primary». La escala de sombras va
hasta `0 16px 48px rgba(0,0,0,.65)`, `--radius-lg` es 16px y `--radius-xl` es 20px,
por encima del máximo de 12px. Solo existen `dev`, `build`, `preview` y `astro`
como scripts: `@astrojs/check ^0.9.10` está instalado en `devDependencies` y
ningún script lo invoca. No existe linter, ni runner de pruebas, ni CI.

Cuatro defectos medidos que este archivo corrige, con su número actual:

| Defecto | Medición | Ubicación |
|---|---|---|
| `.btn-primary:hover` fija `background: var(--primary-dark)` (`#8aa2ff`) y deja el texto en `var(--text-on-primary)` (`#ffffff`) | **2.42:1** — fallo duro de WCAG AA | `Layout.astro:203-208` |
| `--text-muted` vale `#64748b` | **4.41:1** sobre `--bg-base` (`#000000`) y **4.16:1** sobre `--bg-card` (`#0a0a0a`); ambos por debajo de 4.5 | `Layout.astro:41` |
| `--font-heading` nombra `'Inter'` | No hay `@font-face`, ni `@import`, ni `<link>` a un host de fuentes en todo `frontend/`: la pila cae siempre en el stack del sistema | `Layout.astro:60` |
| `html { scroll-behavior: smooth }` | El bloque `prefers-reduced-motion` de `Layout.astro:364-372` sí lo neutraliza con `scroll-behavior: auto`; lo que falta es la **comprobación** que verifique ese contrato | `Layout.astro:103-106` |

## Objetivo

Un único archivo de tokens semánticos que define los roles de color en modo
oscuro y en modo claro, resuelve los tres defectos de contraste y de tipografía
con valores medidos, y hace que la comprobación de tipos deje de ser opcional.

## Alcance

- `frontend/src/styles/tokens.css` con los 15 roles de color, definidos una vez
  por modo, activados por `data-theme` sobre `:root`, con
  `prefers-color-scheme` como valor inicial cuando no hay elección.
- Corrección de los cuatro defectos medidos, con el valor verificado en la tarea.
- Escala de acento completa: `accent-active`, `focus-ring`, `focus-ring-offset`,
  `accent-soft`, `accent-soft-hover`, `accent-border`.
- Rol `border-input` para la frontera de todo control interactivo (≥ 3:1).
- Pila monoespaciada y autoalojo de Inter y JetBrains Mono bajo `public/fonts/`.
- Paleta de resaltado de sintaxis para los dos temas.
- Sombras mínimas por modo, escala de radio con máximo 12px, cards sin sombra.
- Script anti-parpadeo en `<head>` y punto único de escritura del tema.
- Script `npm run check` que ejecute `astro check` y sea bloqueante.
- `frontend/src/styles/base.css` y `frontend/src/styles/utilities.css` con el
  reset, la tipografía, el anillo de foco y las utilidades compartidas que hoy
  viven en `Layout.astro`.

## Fuera de alcance

- Los 8 componentes globales: viven en
  [`02-componentes-globales.md`](./02-componentes-globales.md). Aquí solo se
  garantiza que los tokens que consumen existen.
- El puente de custom properties de Starlight: vive en
  [`08-docs-starlight.md`](./08-docs-starlight.md) y se apoya en los roles que
  se definen aquí.
- Cualquier edición de contenido, de página o de colección.
- Linter, formateador y runner de pruebas del sitio: el script `npm run check` de
  esta área es la puerta de tipos; la puerta completa (`lint`, `format:check`,
  `test`) se completa cuando exista código de pruebas.
- Fuentes servidas desde un tercero. Está prohibido: el presupuesto de red es
  cero solicitudes de terceros.

## Tareas

- [ ] 1. Crear `frontend/src/styles/tokens.css` con el conjunto oscuro completo de roles semánticos
  - Detalle de implementación: `:root` declara `--base: #07090f`, `--surface: #0b0e16`, `--surface-elevated: #121623`, `--text: #eef2f8`, `--text-secondary: #a8b2c4`, `--text-muted: #77839a`, `--accent: #8aa2ff`, `--success: #4ade80`, `--warning: #fbbf24`, `--error: #f87171`, `--on-accent: #07090f`, `--border: #1e2433`, `--border-strong: #2c3446`, `--border-input: #5f6b8a`, más `--shadow-pop: 0 8px 24px rgba(0,0,0,.28)` y `--shadow-header: 0 1px 0 var(--border)`. Los valores exactos de cada modo están en `modules/frontend/02-design.md` y no se repiten aquí.
- [ ] 2. Declarar el conjunto claro bajo `[data-theme="light"]` y añadir la preferencia del sistema
  - Detalle de implementación: bloque `[data-theme="light"]` con `--base: #ffffff`, `--surface: #f7f8fb`, `--surface-elevated: #eef1f7`, `--text: #0d1220`, `--text-secondary: #454f63`, `--text-muted: #5c6678`, `--accent: #3d54d4`, `--accent-hover: #2b3ea8`, `--success: #166534`, `--warning: #78350f`, `--error: #b91c1c`, `--on-accent: #ffffff`, `--border: #dfe3ec`, `--border-strong: #c3cad8`, `--border-input: #828b9c`; seguido de `@media (prefers-color-scheme: light) { :root:not([data-theme]) { … } }` con los mismos valores, para que la ausencia de elección del usuario signifique «seguir al sistema».
- [ ] 3. Sustituir el bloque `:root` de `Layout.astro` por la importación de `tokens.css` y migrar cada consumidor
  - Detalle de implementación: `Layout.astro` importa `../styles/tokens.css`, `../styles/base.css` y `../styles/utilities.css`; se borran del bloque `:root` los tokens por apariencia y se reemplazan sus usos — `--bg-base`→`--base`, `--bg-card`/`--bg-elevated`→`--surface-elevated`, `--text-primary`→`--text`, `--text-on-primary`→`--on-accent`, `--primary`→`--accent`, `--primary-dark`→`--accent`, `--primary-light`→`--accent-soft`, `--accent-amber`→`--warning`, `--footer-bg`→`--surface`, `--cta-bg`→`--accent-soft`—; `--secondary`, `--secondary-light` y `--accent-teal` se eliminan porque el proyecto usa un solo acento.
- [ ] 4. Corregir el defecto de contraste de `.btn-primary:hover`, que hoy mide 2.42:1
  - Detalle de implementación: en `Layout.astro:203-208`, `.btn-primary:hover` deja de fijar `background: var(--primary-dark)` y pasa a `background: var(--accent); color: var(--on-accent)`, con `:focus-visible` idéntico; el hover conserva el desplazamiento de 2px pero cambia la sombra a `var(--shadow-pop)`. El emparejamiento correcto es `accent` `#8aa2ff` con `on-accent` `#07090f`, que mide **8.24:1** en oscuro y 6.15:1 en claro. El estado en reposo se reescribe con la misma pareja (`accent` + `on-accent`) porque el token que hoy lo sostiene, `--primary: #04092e`, desaparece en la migración: su 19.38:1 era el resultado de texto blanco sobre casi negro, no el del sistema de roles.
- [ ] 5. Corregir el defecto de contraste de `--text-muted`, que hoy mide 4.41:1
  - Detalle de implementación: el token pasa de `#64748b` a `--text-muted: #77839a` en oscuro (5.21:1 sobre `base`, **4.72:1** en el peor caso sobre `surface-elevated`) y a `#5c6678` en claro (5.79:1 sobre `base`). Se fija además la regla de uso: `text-muted` no se usa por debajo de 13px, porque por debajo de ese tamaño la relación mínima deja de ser suficiente para lectura cómoda.
- [ ] 6. Declarar la pila monoespaciada y componer los nombres de skill y los comandos en ella
  - Detalle de implementación: `tokens.css` añade `--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` y `--font-heading` pasa a `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`; `--font-body` se unifica con `--font-heading` porque el proyecto usa una sola familia para UI y texto. `--text-code: 0.875rem` (14px) entra en la escala, junto a la corrección de los tamaños de la tarea 7.
- [ ] 7. Corregir la deriva de la escala tipográfica y el peso de los encabezados
  - Detalle de implementación: Display 60px/1.1, H1 44px/1.15, H2 34px/1.2, H3 24px/1.3, H4 19px/1.3, body 17px/1.6, body small 15px/1.6, caption 13px/1.4, code 14px/1.6; los `--text-xs` a `--text-5xl` actuales (12/14/16/18/22/28/36/48/60) se sustituyen por esos valores. Todos los encabezados pasan de `font-weight: 700` a `600`, con `500` para la jerarquía intermedia. Ningún texto del sitio queda por debajo de 13px.
- [ ] 8. Añadir la escala de acento y el anillo de foco de todo elemento enfocable
  - Detalle de implementación: `tokens.css` declara `--accent-active` (`#6f8ae6` oscuro / `#24337f` claro), `--focus-ring` (igual a `accent`), `--focus-ring-offset` (igual a `base`), `--accent-soft` (`#16203a` / `#eaeeff`), `--accent-soft-hover` (`#1d2a4d` / `#dde3ff`) y `--accent-border` (`#3d4a7a` / `#b9c2ee`). En `base.css`, `a`, `button`, `input`, `select`, `textarea`, `[tabindex]` y todo `.card` enfocable reciben `outline: 2px solid var(--focus-ring); outline-offset: 2px` en `:focus-visible`, y ninguna regla elimina el contorno sin sustituirlo por un indicador equivalente. El texto sobre `accent-soft` usa `accent` (6.68:1 oscuro, 5.32:1 claro).
- [ ] 9. Añadir el rol `border-input` y aplicarlo a todo control interactivo
  - Detalle de implementación: `--border-input: #5f6b8a` en oscuro y `#828b9c` en claro, con 3.40:1 y 3.03:1 medidos. Lo consumen el input de búsqueda del catálogo, los chips de filtro, el conmutador de tema, los botones de icono y el borde de foco de un campo. `--border` (1.28:1) y `--border-strong` (1.60:1) se conservan solo como decorativos de tarjeta, separador de tabla y borde de bloque de código, donde nunca son el único indicador del estado; esa excepción está justificada en `modules/frontend/02-design.md`.
- [ ] 10. Declarar la paleta de resaltado de sintaxis para los dos temas y conectarla a Shiki
  - Detalle de implementación: `tokens.css` declara los once roles `--syn-comment`, `--syn-keyword`, `--syn-string`, `--syn-number`, `--syn-function`, `--syn-type`, `--syn-variable`, `--syn-tag`, `--syn-attr-name`, `--syn-operator`, `--syn-punctuation`, con los valores de la tabla de `modules/frontend/02-design.md` para oscuro y claro. En `astro.config.mjs`, `markdown.shikiConfig` declara `themes: { light: 'github-light', dark: 'github-dark' }` y un `transformers` que reemplaza los colores por `var(--syn-*)`, de modo que el bloque de código cambie de tema con `data-theme` sin re-resaltar. El mínimo verificado es 4.72:1 (`comment` en oscuro) y 4.74:1 (`function` en claro).
- [ ] 11. Reducir sombras y radios a lo que el sistema permite y quitar la sombra de las tarjetas
  - Detalle de implementación: se eliminan `--shadow-sm`, `--shadow-md`, `--shadow-lg` y `--shadow-xl`; solo quedan `--shadow-pop` y `--shadow-header`, ambos definidos por modo. `--radius-lg` y `--radius-xl` desaparecen y el máximo de radio pasa a ser `--radius-md: 12px`, con `--radius-sm: 8px` y `--radius-pill: 999px`. `.card` y `.btn-primary` pierden su `box-shadow` en reposo: llevan borde `--border`. El header deja de ser un pill de vidrio de 20px con `box-shadow: 0 8px 32px` y pasa a fijo a 72px con `--shadow-header` solo al hacer scroll (lo implementa el componente, en `02-componentes-globales.md`).
- [ ] 12. Mantener el contrato de `scroll-behavior: smooth` con `prefers-reduced-motion` y cubrirlo con una comprobación
  - Detalle de implementación: en `base.css`, `html { scroll-behavior: smooth }` va acompañado, dentro de `@media (prefers-reduced-motion: reduce)`, de `html { scroll-behavior: auto; }` y de la anulación de transiciones y animaciones, sustituyendo el bloque de `Layout.astro:364-372`. Se añade a `frontend/test/reduced-motion.test.ts` una comprobación que lee `base.css`, confirma que la declaración de scroll existe y que el bloque de movimiento reducido la neutraliza, y falla si alguien reintroduce el desplazamiento suave fuera de ese bloque. La declaración no se borra a ciegas: el comportamiento suave en el modo por defecto es parte del diseño.
- [ ] 13. Autoalojar Inter y JetBrains Mono y corregir el defecto de tipografía no cargada
  - Detalle de implementación: `frontend/public/fonts/` contiene los archivos WOFF2 de Inter (pesos 400, 500, 600) y JetBrains Mono (peso 400), con `tokens.css` declarando los `@font-face` correspondientes, `font-display: swap` y `unicode-range` en los subconjuntos. `Layout.astro` añade `<link rel="preload" as="font" type="font/woff2" crossorigin>` solo para el subconjunto crítico de Display/H1. Cero peticiones a terceros. Con esto `--font-heading` deja de ser una declaración sin fuente detrás, que es lo que ocurre hoy.
- [ ] 14. Escribir el script anti-parpadeo y fijar el punto único de escritura del tema
  - Detalle de implementación: `Layout.astro` incluye, antes de cualquier hoja de estilos, un `<script is:inline>` que lee `localStorage.getItem('fwskills:theme')` y escribe `document.documentElement.dataset.theme` solo si el valor es `'light'` o `'dark'`. El archivo `frontend/src/scripts/theme.ts` expone `applyTheme`, `toggleTheme` y `syncToggleState`, y **no** escribe el atributo al arrancar: el `<head>` ya lo escribió antes del primer pintado, y dos escritores abrirían una carrera. Si no hay atributo, gana la preferencia del sistema vía CSS.
- [ ] 15. Declarar el script `npm run check` y dejarlo como puerta de tipos
  - Detalle de implementación: `frontend/package.json` añade `"check": "astro check"` y `"check:watch": "astro check --watch"`. El binario `@astrojs/check` ya está instalado; lo que falta es el script, y hoy nadie lo invoca. La salida esperada es 0 errores y 0 advertencias, y las advertencias no se silencian con `--minimumSeverity`.
- [ ] 16. Crear `base.css` y `utilities.css` y dejar `Layout.astro` sin estilos globales propios
  - Detalle de implementación: `base.css` lleva el reset (`*`, `*::before`, `*::after` con `box-sizing: border-box` y margen cero), la tipografía base (`font-family: var(--font-body)`, `font-size: 17px`, `line-height: 1.6`), el anillo de foco y las reglas de `::selection` y barras de scroll en tokens. `utilities.css` lleva `.container` (1200px, padding horizontal 32px y 16px en móvil), `.section` (separación vertical de 96px), `.section-eyebrow`, `.section-title`, `.btn-primary`, `.btn-secondary`, `.card`, `.tag` y las grillas `grid-2`, `grid-3`, `grid-4` con los breakpoints de 1024px, 768px y 480px. `Layout.astro` se queda con el `head` y el `slot`.
- [ ] 17. Registrar la deuda eliminada y el criterio de revisión del color
  - Detalle de implementación: añadir a `frontend/eslint.config.js` la regla `no-restricted-syntax` que rechaza hexadecimales en `.astro` y `.css` fuera de `src/styles/tokens.css`, y a la lista de revisión de `specs/docs/04-buenas-practicas.md` la comprobación de que todo token nuevo se declara con un nombre de rol. Ningún color literal fuera de `tokens.css` es un defecto de revisión, no una excepción.

## Criterios de Done

- [ ] `grep -rn 'var(--primary\|var(--bg-base\|var(--bg-card\|var(--text-primary\|var(--text-on-primary\|var(--primary-dark\|var(--secondary\|var(--accent-teal\|var(--footer-bg\|var(--cta-bg' frontend/src` no devuelve ninguna coincidencia.
- [ ] `.btn-primary:hover` mide **8.24:1** en modo oscuro y **6.15:1** en modo claro, con `background: var(--accent)` y `color: var(--on-accent)`; el valor de 2.42:1 que existe hoy en `Layout.astro:203-208` ha desaparecido del CSS.
- [ ] `--text-muted` mide **4.72:1** como mínimo en los tres fondos oscuros y **5.12:1** en los tres claros; ningún texto del sitio por debajo de 13px usa `--text-muted`.
- [ ] `--font-heading` nombra `'Inter'` y existe un `@font-face` que la carga desde `frontend/public/fonts/`; una petición a `fonts.googleapis.com` o equivalente no aparece en la red de `/`, `/skills` ni `/instalacion`.
- [ ] El bloque `@media (prefers-reduced-motion: reduce)` neutraliza `scroll-behavior`, transiciones y animaciones, y la comprobación de la tarea 12 falla si se reintroduce `scroll-behavior: smooth` fuera de ese bloque.
- [ ] `grep -rn 'fonts.googleapis\|fonts.gstatic\|@import url' frontend/` no devuelve ninguna coincidencia.
- [ ] Todo control interactivo usa `--border-input` (≥ 3:1) y todo elemento enfocable muestra un anillo de foco de 2px con separación de 2px, incluido sobre superficies de acento.
- [ ] La escala de sombras solo contiene `--shadow-pop` y `--shadow-header`; `--radius-lg` y `--radius-xl` no existen; `.card` en reposo no declara `box-shadow`.
- [ ] `npm run check` en `frontend/` termina con 0 errores y 0 advertencias, y el script existe en `package.json`.
- [ ] Un fragmento de código resaltado cambia de color al alternar el tema, sin recargar la página y sin una segunda pasada de resaltado.
- [ ] Sin JavaScript, el sitio sigue siendo legible: el conmutador de tema es la única pieza que depende de `src/scripts/theme.ts`, y el atributo `data-theme` lo escribe exactamente un punto (el script del `<head>` para el valor inicial, el toggle para el cambio).
- [ ] No hay regresión en el resto del área: `npm run build` genera `dist/` sin errores y la página `/` conserva sus 8 secciones renderizadas.
