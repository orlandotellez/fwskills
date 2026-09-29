# Página de inicio

## Estado Actual

`frontend/src/pages/index.astro` tiene 21 líneas y compone `Layout.astro` más
siete secciones de `src/sections/`: `Hero.astro` (163 líneas), `Features.astro`
(68), `DesignSkills.astro` (94), `HowItWorks.astro` (85), `CTA.astro` (47),
`Header.astro` (90) y `Footer.astro` (93). El contenido es literal: las skills que
muestra `DesignSkills.astro` están escritas a mano en la plantilla, el hero
presenta una terminal decorativa que no se puede copiar, y no hay categories
derivadas de ninguna colección porque todavía no existe
`src/content.config.ts`. El conmutador claro/oscuro del hero no tiene contraparte
funcional: `Layout.astro` solo define `:root` oscuro. La página no muestra
contadores de skills, ni de contribuidores, ni de releases.

## Objetivo

Una landing de 8 bloques que explique qué es fwskills, deje instalar una skill en
menos de diez segundos de lectura y conduzca a las dos acciones que importan:
explorar el catálogo y contribuir.

## Alcance

- Los 8 bloques de `/`: Hero, Categorías, Skills destacadas, Cómo funciona, Flujo
  de trabajo, Comunidad, FAQ y CTA final.
- Datos derivados de la colección `skills` y de las métricas de GitHub resueltas
  en build.
- Bloque de instalación copiable en el hero, con los cuatro gestores.
- Estados `empty`, `error` y `responsive` de cada bloque, según el modelo de
  `modules/frontend/04-screens.md`.
- Enlace de salto al contenido principal y un único `<h1>` por página.

## Fuera de alcance

- La estructura de la colección que fornece los datos: vive en
  [`03-colecciones-de-contenido.md`](./03-colecciones-de-contenido.md).
- Los componentes compartidos que usa: `SiteHeader`, `SiteFooter`, `CodeBlock`,
  `PackageManagerTabs`, `SkillCard`, `Badge` y `Accordion`, en
  [`02-componentes-globales.md`](./02-componentes-globales.md).
- La resolución de estrellas, contribuidores y releases: vive en
  [`11-datos-en-build-time.md`](./11-datos-en-build-time.md). Aquí solo se
  consume el resultado.
- Los metadatos por página, que la portada ya no necesita porque la resuelve
  `Layout.astro`: viven en
  [`10-seo-y-404.md`](./10-seo-y-404.md).
- El catálogo (`/skills`), la ficha de skill, `/instalacion`, `/docs` y
  `/contribuir`.
- Cualquier analítica, píxel, cookie o llamada de red en runtime. La sección
  Comunidad no pide nada al navegador salvo los avatares, que son imágenes
  locales descargadas en build.

## Tareas

- [x] 1. Sustituir la terminal decorativa del hero por un bloque de código copiable con los cuatro gestores
  - Detalle de implementación: el `Hero.astro` actual muestra un bloque no
  copiable; se reemplaza por `CodeBlock.astro` con `[data-copy]` sobre
  `npx fwskills add specs/crear-specs`, envuelto en `PackageManagerTabs.astro`
  para alternar entre `npx`, `pnpm dlx`, `yarn dlx` y `bunx`. La elección se
  recuerda en `fwskills:pm` y se sincroniza con los demás grupos de la página.
  Los badges del hero pasan a `Badge.astro` en vez de clases sueltas.
- [x] 2. Derivar el H1, el subtítulo y los contadores del hero de la colección
  - Detalle de implementación: el H1 describe el proyecto en una línea, el párrafo
  introductorio se limita a 560px de ancho, y los tres datos del hero —licencia
  MIT, número de skills y número de contribuidores— salen de `getCollection('skills')`
  y del objeto de métricas. En responsive, el hero pasa a dos columnas con
  `min-height: 90vh` a partir de 1024px y se apila por debajo.
- [x] 3. Construir el bloque de Categorías a partir de los subdirectorios de `skills/`
  - Detalle de implementación: `getCategories()` agrupa la colección y, por cada
  categoría, muestra nombre, descripción corta del mapa `src/lib/categories.ts`,
  icono lucide y **conteo de skills**. Cada tarjeta enlaza a
  `/skills?categoria=<slug>`; al pasar el cursor, el borde pasa a `var(--accent)`
  y la flecha se desplaza 4px. Una categoría ausente del mapa usa el icono por
  defecto y el conteo sigue siendo correcto.
- [x] 4. Construir el bloque de Skills destacadas desde `featured: true`
  - Detalle de implementación: `getFeatured(6)` alimenta una grilla de `SkillCard.astro`
  de 3/2/1 columnas, con enlace «Ver todas →» a `/skills`. Si no hay ninguna skill
  con `featured: true`, el bloque no se renderiza y se sustituye por una llamada a
  `/skills`: una sección vacía con hueco es peor que una llamada a la acción.
- [x] 5. Redactar el bloque Cómo funciona con sus tres pasos fijos
  - Detalle de implementación: pasos numerados `01 Elegí`, `02 Instalá` y
  `03 Usá`, con contenido literal, enlace a `/skills` en el primero y bloque de
  código copiable en el segundo. En móvil los pasos se apilan y se conectan con
  una línea vertical, que es la única excepción de layout permitida en la landing.
- [x] 6. Construir el bloque Flujo de trabajo con el recorrido de áreas del repositorio
  - Detalle de implementación: SVG encadenado `specs → design → desarrollo → qa →
  security`, definido en `src/lib/categories.ts` y no escrito en el marcado, de
  modo que añadir un área no obliga a editar la landing. Cada paso enlaza a
  `/skills?categoria=<slug>` y en móvil la cadena se apila en vertical.
- [x] 7. Construir el bloque Comunidad con métricas y avatares cacheados en build
  - Detalle de implementación: muestra el número de skills —dato local, siempre
  disponible—, el número de contribuidores y el conteo de releases, y una fila de
  avatares con `alt` que contiene el nombre de la persona. Si GitHub no respondió
  en build, el bloque se renderiza con el número de skills y **omite** las cifras
  remotas y los avatares, con un enlace al repositorio. Nunca muestra `0`: un
  cero afirma que se consultó GitHub y no hay ninguna.
- [x] 8. Construir el bloque FAQ con cinco acordeones y la allowlist de un panel abierto
  - Detalle de implementación: `Accordion.astro` con `singleOpen` activo, cinco
  preguntas respondidas en el tono del sitio, y enlace «Ver todas las preguntas →»
  a `/docs/faq`. Las respuestas son contenido literal; no hay base de datos donde
  guardar nada, y el FAQ no es un formulario.
- [x] 9. Rehacer el bloque CTA final con la banda de acento y los dos destinos
  - Detalle de implementación: `CTA.astro` deja de ser un bloque suelto y pasa a
  ser la banda de cierre con fondo `var(--accent-soft)`, texto en `var(--accent)`
  (6.68:1 verificado), botón primario a `/instalacion` y secundario a
  `/contribuir`, y 120px de padding vertical simétrico. En móvil los botones se
  apilan a ancho completo.
- [x] 10. Añadir el enlace de salto al contenido y comprobar la jerarquía de encabezados
  - Detalle de implementación: `Layout.astro` incluye, antes del `header`, un
  enlace «Saltar al contenido» que solo es visible al recibir foco y lleva a
  `<main id="contenido">`. La página tiene exactamente un `<h1>`; los bloques usan
  `h2` y las subsecciones `h3`, sin saltos de nivel. Los landmarks son `<header>`,
  `<main>` y `<footer>` nombrados.
- [x] 11. Eliminar de la landing el contenido que queda cubierto por las páginas
  - Detalle de implementación: `Features.astro` y `DesignSkills.astro` se
  eliminan cuando sus contenidos estén distribuidos entre Categorías, Skills
  destacadas y Flujo de trabajo; `src/pages/index.astro` queda componiendo
  `Layout.astro` más ocho bloques, sin listas de skills escritas a mano en ninguna
  parte del árbol de `src/`.

## Criterios de Done

- [x] `/` renderiza 8 bloques en orden: Hero, Categorías, Skills destacadas, Cómo funciona, Flujo de trabajo, Comunidad, FAQ y CTA final.
- [x] El número de skills, los conteos por categoría y las destacadas salen de `getCollection('skills')`; ninguna lista de skills está escrita a mano en `src/`.
- [x] El comando del hero se copia con un clic, muestra «¡Copiado!» y se anuncia en `aria-live="polite"`; al cambiar de gestor, todos los grupos de tabs de la página cambian a la vez y la elección persiste al recargar.
- [x] Cada tarjeta de categoría enlaza a `/skills?categoria=<slug>` y muestra un conteo correcto; una categoría nueva aparece sin editar `src/pages/index.astro` ni `src/sections/`.
- [x] Sin ninguna skill con `featured: true`, el bloque de destacadas se sustituye por una llamada a `/skills` y no queda un hueco vacío.
- [x] Sin métricas de GitHub, la sección Comunidad renderiza el número de skills y omite las cifras remotas; en ningún caso aparece un `0` como métrica.
- [x] Un acordeón de la FAQ abre y cierra con `aria-expanded` actualizado, solo uno queda abierto a la vez y `Esc` no deja el panel en un estado intermedio.
- [x] La página tiene un único `<h1>`, un único `<main>`, la jerarquía de encabezados no salta niveles y el enlace de salto al contenido es la primera parada del tabulador.
- [x] La página no hace ninguna petición de red propia: solo los avatares locales, que se descargan en build. `grep -rn 'fetch(' frontend/src/pages/index.astro` no devuelve coincidencias.
- [x] Sin JavaScript de framework: la landing no usa ninguna directiva `client:*` y su peso de JavaScript no supera los 15 KB sin comprimir.
- [x] No hay regresión en el área: `npm run check` termina con 0 errores, `npm run build` genera `dist/index.html` y Lighthouse mantiene ≥ 95 en las cuatro categorías sobre `npm run preview`.

---

<!-- Auditoría 2026-09-29: verificado contra el código. T1-T11: las 8 secciones renderizadas en dist/index.html (hero, categorias, destacadas, asi de simple, flujo, comunidad, FAQ con 5 acordeones, CTA final), PackageTabs en el hero, metricas de comunidad desde la coleccion, reveal scroll. -->
