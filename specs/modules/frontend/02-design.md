# 02 — Design system

Este archivo es la **fuente de verdad del sistema de diseño** de fwskills. Las
skills de diseño del repositorio lo leen; cualquier valor aquí prevalece sobre
lo que una skill sugiera.

Estado: los tokens de rol (`--text-secondary`, `--accent-hover`, …) están
`[ESPECIFICADO]` y **todavía no existen en el código**. El bloque `:root` actual
de `Layout.astro` está `[EXISTE]` y es oscuro únicamente; la migración está
registrada como **ADR-07** y el detalle del pasivo está en
[Deuda actual](#deuda-actual).

## Principios

1. **El color se asigna por rol, no por apariencia.** Se usa `--accent-hover`,
   nunca `--azul-claro`.
2. **Ningún color entra sin su ratio.** Todo valor de texto se acompaña del
   ratio WCAG calculado contra el fondo sobre el que vive.
3. **La jerarquía es de tamaño y peso** (500/600), nunca solo de color.
4. **Bordes antes que sombras.** Las sombras son mínimas y difusas; no hay
   neumorfismo ni sombras duras.
5. **El tema es una decisión del usuario**, no del sistema: se respeta la
   preferencia del sistema como valor inicial y se recuerda la elección.

---

## Design tokens

### Fondos

| Rol | Modo oscuro | Modo claro | Uso |
|---|---|---|---|
| `base` | `#07090f` | `#ffffff` | Fondo de página (`<body>`). |
| `surface` | `#0b0e16` | `#f7f8fb` | Secciones alternadas, footer, encabezado de tabla. |
| `surface-elevated` | `#121623` | `#eef1f7` | Tarjetas, bloques de código, modales, menús desplegables, backdrop del panel móvil. |
| `code-bg` | `#121623` | `#eef1f7` | Fondo del bloque de código (igual a `surface-elevated`; rol propio porque se mide de forma independiente). |

### Roles semánticos — modo oscuro (base `#07090f`)

| Rol | Valor | Ratio sobre `base` | Nota de uso |
|---|---|---|---|
| `text` | `#eef2f8` | 17.72 | Texto de párrafo y encabezados. Único color de texto por defecto. |
| `text-secondary` | `#a8b2c4` | 9.32 | Párrafos secundarios, descripciones de tarjeta, texto de apoyo. |
| `text-muted` | `#77839a` | 5.21 | Metadatos, captions, pie de breadcrumb, texto deshabilitado legible. Es el mínimo de la escala de texto: nunca bajar de aquí. |
| `accent` | `#8aa2ff` | 8.24 | Marca, enlaces, icono activo, estado de foco. |
| `accent-hover` | `#a6b8ff` | 10.35 | Estado hover de enlaces y botones acentos. |
| `success` | `#4ade80` | 11.42 | Estados válidos, confirmación de copia, "instalado". |
| `warning` | `#fbbf24` | 11.92 | Avisos no bloqueantes, contenido deprecado. |
| `error` | `#f87171` | 7.20 | Errores de validación y mensajes de fallo. |
| `on-accent` | `#07090f` | 8.24 sobre `accent` | Texto/icono **dentro** de una superficie de acento (botón primario, chip activo). |

### Roles semánticos — modo claro (base `#ffffff`)

| Rol | Valor | Ratio sobre `base` | Nota de uso |
|---|---|---|---|
| `text` | `#0d1220` | 18.68 | Texto de párrafo y encabezados. |
| `text-secondary` | `#454f63` | 8.23 | Texto de apoyo, descripciones. |
| `text-muted` | `#5c6678` | 5.79 | Metadatos y captions. |
| `accent` | `#3d54d4` | 6.15 | Marca, enlaces, foco. |
| `accent-hover` | `#2b3ea8` | 8.91 | Hover de enlaces y acentos. |
| `success` | `#166534` | 7.13 | Confirmaciones. |
| `warning` | `#78350f` | 9.07 | Avisos. |
| `error` | `#b91c1c` | 6.47 | Errores. |
| `on-accent` | `#ffffff` | 6.15 sobre `accent` | Contenido dentro de una superficie de acento. |

### Verificación de contraste

> **Los ratios de las tablas anteriores fueron calculados con la fórmula de
> contraste de WCAG 2.1**, no estimados a ojo:
>
> ```
> ratio = (L_más_clara + 0.05) / (L_más_oscura + 0.05)
> L = 0.2126·R + 0.7152·G + 0.0722·B   (R, G, B linealizados: c ≤ 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4)
> ```
>
> Estos valores están **verificados**: no se sustituyen ni se "mejoran" con
> porcentajes de luminosidad aproximados.

Mínimo de cada rol **medido sobre los tres fondos** (`base`, `surface`,
`surface-elevated`), que es el peor caso en el que puede aparecer:

| Rol | Mínimo | Fondo que lo produce | Cumple AA (≥ 4.5) |
|---|---|---|---|
| `text` | **16.05** | oscuro sobre `surface-elevated` | Sí |
| `text-secondary` | **7.27** | claro sobre `surface-elevated` | Sí |
| `text-muted` | **4.72** | oscuro sobre `surface-elevated` | Sí |
| `accent` | **5.43** | claro sobre `surface-elevated` | Sí |
| `success` | **6.30** | claro sobre `surface-elevated` | Sí |
| `warning` | **8.02** | claro sobre `surface-elevated` | Sí |
| `error` | **5.72** | claro sobre `surface-elevated` | Sí |

Consecuencia operativa: los tres fondos (`base`, `surface`, `surface-elevated`)
comparten la **misma** escala de roles semánticos. Ningún componente necesita una
tabla de colores por fondo; solo cambia el valor del token de fondo.

### Bordes

| Rol | Modo oscuro | Modo claro | Ratio (peor caso) | Uso |
|---|---|---|---|---|
| `border` | `#1e2433` | `#dfe3ec` | ≈ 1.28 / ≈ 1.29 | Hairline decorativo: separadores de tarjeta, borde de tabla, borde de bloque de código. |
| `border-strong` | `#2c3446` | `#c3cad8` | ≈ 1.60 / ≈ 1.65 | Hover y separadores con más peso: borde de tarjeta en hover, divisor de fila activa. |
| `border-input` | `#5f6b8a` | `#828b9c` | **3.40 / 3.03** | Frontera de **controles interactivos**: input de búsqueda, checkbox, chip seleccionable, borde de foco de un campo. |

> **Nota explícita, y es deliberada.** Los dos primeros roles están por debajo de
> 3:1 **a propósito**: son decorativos y la WCAG 1.4.11 (Non-text Contrast) solo
> exige 3:1 cuando el borde es el único indicador del estado de un control. Como
> `--border` y `--border-strong` nunca son el único indicador —el texto, el icono
> o el fondo cambian con el estado, y siempre hay anillo de foco visible— pueden
> quedarse por debajo. En cambio, **todo control interactivo usa `border-input`**
> (≥ 3:1, verificado) **más un anillo de foco visible**, para no depender solo
> del color.

### Escala de acento

Derivada de `accent`. Los tres primeros son un hecho dado y verificado; el resto
se deriva con el mismo método (WCAG 2.1) y queda `[ESPECIFICADO]` hasta que se
incorporen al bloque de tokens.

| Rol | Modo oscuro | Modo claro | Ratio verificado | Uso |
|---|---|---|---|---|
| `accent` | `#8aa2ff` | `#3d54d4` | 8.24 / 6.15 | Reposo de enlaces, iconos activos, botón primario. |
| `accent-hover` | `#a6b8ff` | `#2b3ea8` | 10.35 / 8.91 | Hover de enlace, hover de botón acentos, foco de teclado. |
| `accent-active` | `#6f8ae6` | `#24337f` | 6.12 / 11.32 | Estado presionado (`:active`). Retrocede en luminosidad en claro, la mantiene legible en oscuro. |
| `focus-ring` | `accent` (`#8aa2ff`) | `accent` (`#3d54d4`) | 8.24 / 6.15 | Anillo de foco de **todo** elemento enfocable. |
| `focus-ring-offset` | `base` (`#07090f`) | `base` (`#ffffff`) | — | Color del hueco entre el control y el anillo: `outline: 2px solid accent; outline-offset: 2px` sobre fondo `base`. Garantiza separación visible. |
| `accent-soft` | `#16203a` | `#eaeeff` | — | Fondo de chip activo, badge de categoría, banda de CTA suave. |
| `accent-soft-hover` | `#1d2a4d` | `#dde3ff` | — | Hover del elemento con `accent-soft`. |
| Texto sobre `accent-soft` | `accent` → **6.68** | `accent` → **5.32** | 6.68 / 5.32 | Texto dentro de un chip o banda suave: cumple AA en ambos temas. |
| Texto sobre `accent-soft-hover` | `accent-hover` → **7.33** | `accent-hover` → **7.00** | 7.33 / 7.00 | Ídem, en hover. |
| `accent-border` | `#3d4a7a` | `#b9c2ee` | 2.33 / 1.75 | Borde decorativo de un elemento con `accent-soft`. Decorativo por definición: **no** reemplaza a `border-input` en un control. |

### Resaltado de sintaxis

Definido sobre `surface-elevated` / `code-bg` (`#121623` oscuro, `#eef1f7`
claro). Ratios verificados con la fórmula WCAG 2.1.

| Token | Modo oscuro | Ratio | Modo claro | Ratio |
|---|---|---|---|---|
| comment | `#77839a` | 4.72 | `#5c6678` | 5.12 |
| keyword | `#a78bfa` | 6.63 | `#7c3aed` | 5.04 |
| string | `#86efac` | 12.84 | `#166534` | 6.30 |
| number | `#fbbf24` | 10.80 | `#92400e` | 6.27 |
| function | `#7dd3fc` | 10.81 | `#0e7490` | 4.74 |
| type | `#f0abfc` | 10.25 | `#a21caf` | 5.59 |
| variable | `#e6edf7` | 15.30 | `#0d1220` | 16.51 |
| tag | `#f87171` | 6.52 | `#b91c1c` | 5.72 |
| attr-name | `#fbbf24` | 10.80 | `#92400e` | 6.27 |
| operator | `#9aa5b8` | 7.25 | `#5c6678` | 5.12 |
| punctuation | `#8b95a8` | 5.98 | `#5c6678` | 5.12 |

Todos ≥ 4.5, luego el código cumple AA en ambos temas. `function` en claro
(4.74) y `comment` en oscuro (4.72) son los dos casos ajustados: no se pueden
oscurecer/clarear más sin romper la distinción con `variable`.

Acento de marca: **azul eléctrico** (`#8aa2ff` oscuro / `#3d54d4` claro), coherente
con los tokens que ya vive en el repositorio.

---

## Tipografía

Dos familias, dos propósitos, sin excepciones:

| Uso | Familia | Stack |
|---|---|---|
| UI y texto | **Inter** | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| Código, comandos y nombres de skill | **JetBrains Mono** | `'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace` |

Escala:

| Rol | Tamaño / interlineado | Peso | Aplicación |
|---|---|---|---|
| Display | 60px / 1.1 | 600 | `H1` de la landing. Máximo una o dos líneas. |
| H1 | 44px / 1.15 | 600 | Título de página (Catálogo, Instalación, Docs, Contribuir). |
| H2 | 34px / 1.2 | 600 | Encabezado de sección. |
| H3 | 24px / 1.3 | 600 | Subsección, título de tarjeta. |
| H4 | 19px / 1.3 | 600 | Títulos de widget,Tabs, items del acordeón. |
| Body | 17px / 1.6 | 400 | Párrafo. |
| Body small | 15px / 1.6 | 400 | Texto de apoyo, descripciones de tarjeta, contenido de tabla. |
| Caption | 13px / 1.4 | 400 | Breadcrumb, metadatos, pie de figura, etiquetas de badge. |
| Code | 14px / 1.6 | 400 | Bloques de código y comandos **inline**. |

Reglas:

- El nombre de una skill se compone siempre en `code` (monospace, 17px en cuerpo
  de texto). Es la convención que hace reconocible una skill de un vistazo.
- Un comando inline (`npx fwskills add specs/crear-specs`) también va en
  monospace, con `accent-soft` de fondo y `radius` 6px.
- La jerarquía se establece con tamaño y peso (500/600). **Nunca** con color
  solamente: un `H3` nunca se distingue de un párrafo solo por estar en `accent`.
- El ancho de línea del texto corrido se limita a 760–820px; el contenedor
  general llega a 1200px.

Entrega de fuentes `[ESPECIFICADO]`: autoalojadas en el propio despliegue
(`public/fonts/` o paquete npm equivalente), **sin peticiones a terceros**,
`font-display: swap` y `preload` únicamente del subconjunto de pesos usado en
Display/H1. Condición para no comprometer Lighthouse.

---

## Espaciado

| Rol | Valor | Uso |
|---|---|---|
| `space-3xs` | 4px | Ajuste interno de chip. |
| `space-2xs` | 8px | Gap entre icono y texto. |
| `space-xs` | 12px | Padding interno de badge, gap de lista densa. |
| `space-sm` | 16px | Padding de tarjeta pequeño, gap de formulario. |
| `space-md` | 24px | Padding de tarjeta, gap de grid interno. |
| `space-lg` | 32px | Gap entre bloques dentro de una sección. |
| `space-xl` | 48px | Padding vertical de bloque. |
| `space-2xl` | 64px | Padding de sección de media densidad. |
| `space-3xl` | 96px | **Separación entre secciones** (extremo bajo). |
| `space-4xl` | 120px | **Separación entre secciones** (extremo alto, secciones de la landing). |

| Contenedor | Ancho | Nota |
|---|---|---|
| Contenedor general | 1200px | Centrado, padding horizontal 32px (16px en móvil). |
| Columna de texto largo | 760–820px | Documentación y páginas de lectura. |
| Columna de párrafo (hero) | 560px | Párrafo introductorio del hero. |

Separación entre secciones: **96–120px**. Fuera de ese rango solo la banda final
de CTA, que va a 120px simétricos.

---

## Radio y sombras

| Rol | Valor | Uso |
|---|---|---|
| `radius-sm` | 8px | Badge, chip pequeño, botón de icono, tabla. |
| `radius-md` | 12px | Tarjeta, bloque de código, panel, acordeón. |
| `radius-pill` | 999px | Chip, botón de filtro, badge de versión. |

Sombras: mínimas. Una tarjeta en reposo **no lleva sombra**: lleva borde
`border`. Solo se usa sombra en dos sitios, y siempre difusa:

| Rol | Valor | Uso |
|---|---|---|
| `shadow-pop` | `0 8px 24px rgba(0,0,0,.28)` (oscuro) / `0 8px 24px rgba(13,18,32,.10)` (claro) | Modal de búsqueda y panel móvil, que flotan sobre contenido. |
| `shadow-header` | `0 1px 0 var(--border)` | Separador del header al hacer scroll. Es una sombra de 1px sin difuminación: un borde, no una sombra. |

Prohibido: neumorfismo, sombras duras (`box-shadow` sin desenfoque o con
desenfoque mínimo apuntaba hacia fuera), `box-shadow` como separador de tarjeta.

---

## Componentes base

Los 8 componentes globales. Todos comparten header, footer, design system y modo
claro/oscuro. Todos `[ESPECIFICADO]`.

### 1. Header fijo

- `position: fixed`, altura 72px, `z-index` por encima de todo el contenido.
- Izquierda: logo/wordmark que enlaza a `/`.
- Centro-derecha: navegación `Skills · Instalación · Docs · Contribuir`. El ítem
  activo se marca con **subrayado de 2px** en `accent`; en hover, el subrayado
  se **anima** (transición de `transform`/`width`, no de `color`).
- Derecha: disparador de búsqueda (abre modal, atajo `Ctrl/⌘+K`, busca skills
  **y** documentación), enlace a GitHub con **contador de estrellas resuelto en
  build**, y toggle claro/oscuro.
- A partir de **40px de scroll**: fondo translúcido +
  `backdrop-filter: blur(12px) saturate(140%)` y borde inferior de 1px.
- Móvil (`< 768px`): botón hamburguesa que **anima a ✕**, panel a pantalla
  completa con `aria-expanded`, foco atrapado, cierre con ✕ / clic fuera / `Esc`,
  y `body` con scroll bloqueado mientras está abierto.

### 2. Bloque de código

- Fondo `surface-elevated` / `code-bg`, `radius-md`, borde `border`.
- Etiqueta de lenguaje arriba a la izquierda (caption).
- Botón "Copiar" arriba a la derecha: al pulsar cambia a **"¡Copiado!"** durante
  2s, en `success`, y el cambio se anuncia con `aria-live="polite"`.
- `overflow-x: auto` **interno** en caso de desborde — nunca desborda la página.
- Resaltado de sintaxis según la tabla de tokens de este documento.
- Variante con nombre de archivo: el nombre sustituye a la etiqueta de lenguaje
  (usada en `/docs`).

### 3. Tabs de gestor de paquetes

- Tabs: `npm · pnpm · yarn · bun`.
- La elección se **recuerda entre páginas** (`localStorage`) y se **sincroniza
  entre todos los grupos de tabs de la misma página** (un solo listener en el
  documento).
- Contenido: el comando equivalente para el gestor activo, renderizado en un
  bloque de código con su botón "Copiar".
- Roles ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, con
  `aria-selected` y navegación por flechas.

### 4. Tarjeta de skill

- Nombre de la skill en **monospace**.
- Descripción recortada a **2 líneas** con elipsis (`-webkit-line-clamp: 2`).
- Badges de **categoría** y **versión**.
- Tags (caption, `text-muted`).
- Botón "Ver skill" (primario) y botón rápido "Copiar comando" que copia
  `npx fwskills add <categoria>/<slug>` sin navegar.

### 5. Badges

Cuatro variantes, todas `radius-pill`, tipografía caption:

| Variante | Contenido | Color |
|---|---|---|
| Categoría | Nombre de la categoría | Un color por categoría, con texto en `on-accent` |
| Versión | `v1.2.0` | `text-secondary` sobre `surface-elevated` |
| Compatibilidad | Agentes soportados | `text-secondary` sobre `surface-elevated` |
| Autor | Nombre o avatar | `text-muted`, enlaza al perfil de GitHub |

### 6. Breadcrumbs

- Presentes en **todas** las páginas salvo Inicio.
- Tipografía caption (13px), separador `/`, **el último elemento no es enlace**.
- Separado del título por `--space-md`.

### 7. Acordeón

- Botón con la pregunta (H4, 19px) y un icono `+` que **rota 45° hasta quedar en
  `×`** al abrirse.
- Contenido con **fundido + desplazamiento** suave hacia abajo.
- `aria-expanded` en el botón, `aria-controls` apuntando al `id` del panel.
- Allowlist de un panel abierto a la vez en los grupos de FAQ; en la página de
  Instalación, sección 8, también.

### 8. Footer

- Fondo `surface`, borde superior de 1px (`border`), idéntico en todas las páginas.
- Cuatro columnas: **desktop 4 / tablet 2 / móvil 1**.

| Columna | Contenido |
|---|---|
| Marca | Wordmark, una línea descriptiva, iconos GitHub / npm / comunidad |
| Producto | Skills · Instalación · Docs · Changelog |
| Comunidad | Contribuir · Código de conducta · Gobernanza · Reportar un problema |
| Recursos | GitHub · npm · Licencia · Seguridad |

- Barra inferior: "© 2026 fwskills. Proyecto open source bajo licencia MIT.
  Hecho por la comunidad."

---

## Iconografía

- Única familia: **lucide-astro `^0.556.0`**, importada como componente Astro
  (SVG estático, sin JS de runtime).
- Trazo por defecto `strokeWidth={2}`, salvo en iconos de 14px o menos, donde
  sube a `2.25` para mantener legibilidad.
- Tamaños: 14px (inline con caption), 16px (con texto de apoyo), 18px (botones),
  20px (navegación), 22px (wordmark), 24px (tarjetas de categoría), 32px (métricas).
- Todo icono **decorativo** lleva `aria-hidden="true"` y `focusable="false"`.
  Un icono que es el único contenido de un control requiere en su lugar
  `aria-label` en el control (`<button aria-label="Abrir menú">`).
- Los iconos de categoría (Specs, Design, QA, Security) se eligen de un mapa
  `categoría → icono lucide` fijo; ese mapa es la única lista manual de
  categorías del proyecto y **no** necesita crecer al añadir una categoría: si
  falta una, se usa `lucide:box` como valor por defecto.

---

## Modo oscuro

Es el modo **por defecto** del proyecto (el acento y los tokens fueron calculados
partiendo de la base oscura `#07090f`), pero el sitio es **dual**.

### Cómo funciona `data-theme`

1. El atributo vive en `<html>`: `<html lang="es" data-theme="dark">`.
2. El bloque de tokens define **ambos** temas:

```css
:root {                       /* modo oscuro: valores por defecto */
  --base: #07090f;
  --surface: #0b0e16;
  --surface-elevated: #121623;
  --text: #eef2f8;
  /* … resto de roles */
}

[data-theme="light"] {        /* modo claro: solo las diferencias */
  --base: #ffffff;
  --surface: #f7f8fb;
  --surface-elevated: #eef1f7;
  --text: #0d1220;
  /* … resto de roles */
}
```

3. El componente de tema lee el atributo, lo alterna y escribe en
   `localStorage`. **Ningún otro componente conoce la existencia del atributo**:
   todos consumen variables CSS.
4. La transición de tema se aplica con `transition` sobre `background-color` y
   `color` únicamente, y se desactiva con `prefers-reduced-motion: reduce`.

### Preferencia del sistema

Cuando el usuario **nunca ha elegido** un tema, no hay atributo `data-theme` en
`<html>`: gana la preferencia del sistema. Se resuelve con CSS, no con JS:

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme]) { /* valores del tema claro */ }
}
```

Es decir: `[data-theme="light"]` gana sobre la preferencia del sistema
(especificidad mayor), y la preferencia del sistema gana sobre `:root` cuando no
hay elección explícita.

### Script anti-parpadeo (no-flash)

El atributo se escribe **antes del primer pintado**, con un script inline
bloqueante en `<head>`, antes de cualquier hoja de estilos de contenido:

```html
<script is:inline>
  (() => {
    const stored = localStorage.getItem('fwskills:theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.dataset.theme = stored;
    }
  })();
</script>
```

El script es pequeño a propósito: su única función es evitar el destello de
tema incorrecto. No registra nada, no lee cookies y no depende de ninguna
biblioteca.

### Persistencia

| Clave | Valores | Ámbito |
|---|---|---|
| `fwskills:theme` | `"light"` \| `"dark"` | Preferencia explícita del usuario. **Ausente** = seguir al sistema. |

| Clave | Valores | Ámbito |
|---|---|---|
| `fwskills:pm` | `"npm"` \| `"pnpm"` \| `"yarn"` \| `"bun"` | Gestor de paquetes elegido en los tabs. |

Ambas claves se leen en un único punto de arranque y se escriben en un único
punto de guardado. El modelo completo está en [`06-estado.md`](./06-estado.md).

---

## Deuda actual

Todo lo siguiente es `[EXISTE]` en `frontend/src/layouts/Layout.astro` (372
líneas) y hay que reemplazarlo para cumplir este documento. Es el alcance de
**ADR-07**.

### 1. El sitio es oscuro únicamente

El bloque `<style is:global>` define **solo** `:root` con valores oscuros. No
existe `[data-theme="light"]`, ni `prefers-color-scheme`, ni script anti-parpadeo,
ni persistencia de tema. El conmutador claro/oscuro de la landing actual **no
tiene contraparte funcional**.

### 2. Los tokens están nombrados por apariencia

Mapa de los tokens actuales y su destino semántico:

| Token actual | Valor actual | Token destino |
|---|---|---|
| `--bg-base` | `#000000` | `--base` (`#07090f`) |
| `--bg-surface` | `#000000` | `--surface` (`#0b0e16`) |
| `--bg-card` | `#0a0a0a` | `--surface-elevated` (`#121623`) |
| `--bg-elevated` | `#111111` | `--surface-elevated` (`#121623`) |
| `--text-primary` | `#f1f5f9` | `--text` (`#eef2f8`) |
| `--text-secondary` | `#94a3b8` | `--text-secondary` (`#a8b2c4`) |
| `--text-muted` | `#64748b` | `--text-muted` (`#77839a`) |
| `--text-on-primary` | `#ffffff` | `on-accent` en modo claro (`#ffffff`) / oscuro (`#07090f`) |
| `--text-accent` | `#8aa2ff` | `accent` (`#8aa2ff` oscuro) |
| `--primary` | `#04092e` | `accent` — **el uso está invertido**: hoy el fondo del botón es oscuro y el texto claro |
| `--primary-dark` | `#8aa2ff` | `accent` / `accent-hover` — el nombre sugiere "más oscuro" cuando es el más claro |
| `--primary-light` | `#0d1745` | `accent-soft` (`#16203a`) |
| `--secondary` / `--secondary-light` | `#38bdf8` / `#16324a` | Sin equivalente: el proyecto usa **un solo acento**. Se eliminan. |
| `--accent-teal` | `#2dd4bf` | Sin equivalente. Se elimina. |
| `--accent-amber` | `#fbbf24` | `warning` (`#fbbf24` oscuro) |
| `--border` | `#1e293b` | `border` (`#1e2433`) |
| `--border-strong` | `#334155` | `border-strong` (`#2c3446`) |
| `--footer-bg` | `#000000` | `surface` (`#0b0e16`) |
| `--cta-bg` | `#0a1340` | `accent-soft` (`#16203a`) |

Consecuencias concretas del estado actual:

- **`--primary` y `--primary-dark` están intercambiados en su uso.** El botón
  primario aplica `background: var(--primary)` (`#04092e`, casi negro) con texto
  `#ffffff`, y en hover invierte a `--primary-dark` (`#8aa2ff`) con texto
  `#ffffff`. El texto blanco sobre `#8aa2ff` da un ratio de **2.42:1**, muy por
  debajo de AA. Con el mapeo correcto (`background: accent`, `color: on-accent`)
  el contraste pasa a **8.24:1**.
- **El `--text-muted` actual ya falla AA.** `#64748b` sobre `#000000` da
  **4.41:1**, por debajo del 4.5 exigido. El token de destino `#77839a` sube a
  5.21 sobre la base oscura.
- **No existe `border-input`.** Los controles de entrada no tienen una frontera
  con el contraste exigido por WCAG 1.4.11.
- **Faltan las escalas `hover`, `active` y `focus-ring` del acento.**

### 3. No hay pila monoespaciada

`:root` solo declara `--font-heading` (Inter) y `--font-body` (`system-ui`,
`-apple-system`, `'Segoe UI'`, `sans-serif`). No hay ninguna variable monoespaciada,
de modo que hoy no es posible componer nombres de skill ni comandos en monospace
sin introducir el `font-family` a mano en cada componente.

### 4. Deriva en la escala tipográfica

| Rol | Actual | Objetivo | Deriva |
|---|---|---|---|
| Body | `1rem` = 16px | 17px | −1px |
| H2 | `text-3xl` = 36px | 34px | +2px |
| H1 | `text-4xl` = 48px | 44px | +4px |
| Display | `text-5xl` = 60px | 60px | correcto |
| Body small | `text-sm` = 14px | 15px | −1px |
| Caption | `text-xs` = 12px | 13px | −1px |
| Code | — | 14px | inexistente |

Todos los encabezados actuales usan `font-weight: 700`; el objetivo es 600 con 500
para jerarquía intermedia.

### 5. Sombras y radios fuera de sistema

- El header actual usa un "pill de vidrio" flotante con `border-radius: var(--radius-xl)`
  (20px), `box-shadow: 0 8px 32px rgba(0,0,0,.5)` y `position: sticky` con `top`.
  El objetivo es un header **fijo** a 72px, plano, con sombra solo al hacer scroll.
- La escala de sombras actual (`--shadow-sm` … `--shadow-xl`, hasta
  `0 16px 48px rgba(0,0,0,.65)`) es lo contrario de "sombras mínimas".
- El botón primario lleva `box-shadow: 0 4px 14px rgba(4,9,46,.6)`, es decir, la
  sombra es parte de su identidad. En el objetivo las tarjetas y botones no llevan
  sombra: llevan borde `border`.
- `--radius-lg` (16px) y `--radius-xl` (20px) quedan por encima del máximo de 12px
  permitido en tarjetas.
