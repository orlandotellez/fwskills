# Catálogo de skills

## Estado Actual

No existe `frontend/src/pages/skills/index.astro` ni carpeta `skills/` en el
repositorio. La página más cercana al catálogo es
`src/sections/DesignSkills.astro` (94 líneas), que muestra un conjunto fijo de
tarjetas de skills de diseño escrito directamente en la plantilla de Astro: sin
colección de la que derivar, sin filtros, sin búsqueda, sin estado en la URL y sin
contador de resultados. `src/lib/search-index.ts` tampoco existe, así que el
índice de build que alimentaría al buscador del header todavía no se genera.

## Objetivo

Una página `/skills` que enumere todas las skills del repositorio y permita
encontrarlas sin recorrer la lista: filtrar por categoría, buscar por texto y
filtrar por tag, con el resultado siempre expresado en una URL compartible.

## Alcance

- `frontend/src/pages/skills/index.astro` con los 6 bloques de la pantalla.
- Chips de categoría con su conteo, derivados de la colección.
- Búsqueda en vivo sobre el conjunto ya embebido en el HTML, normalizada a
  minúsculas y sin acentos, sobre nombre, descripción y tags.
- Filtro por tag y orden (`alfabetico`, `recientes`, `destacadas`).
- Estado del catálogo en la URL: `?categoria=`, `?q=`, `?tag=` y `?sort=`.
- Contador de resultados y estado vacío con acción de limpiar.
- `frontend/src/scripts/catalog-filters.ts` con `readFilters`, `applyFilters` y
  `writeFilters`, y escucha de `popstate`.

## Fuera de alcance

- La colección que fornece las skills: vive en
  [`03-colecciones-de-contenido.md`](./03-colecciones-de-contenido.md).
- Los componentes `SkillCard`, `Badge`, `Breadcrumbs` y `SiteHeader` que se
  consumen: viven en
  [`02-componentes-globales.md`](./02-componentes-globales.md).
- La ficha de skill a la que enlaza cada tarjeta: vive en
  [`06-ficha-de-skill.md`](./06-ficha-de-skill.md).
- El modal `Ctrl/⌘+K` del header, que consulta el mismo `search-index.json` pero
  como diálogo: vive en `02-componentes-globales.md`.
- Las páginas de docs `/docs/categorias/<slug>`, que Starlight genera.
- Cualquier servidor de búsqueda, endpoint o índice en base de datos. La
  búsqueda es un recorrido de nodos sobre un conjunto que ya está en el HTML
  (`[CLIENTE]`), y la base de datos no existe (ADR-02).
- El orden «más reciente», que depende de la fecha de última actualización por
  skill y de las métricas de GitHub:
  [`11-datos-en-build-time.md`](./11-datos-en-build-time.md) resuelve la fecha; el
  filtro la ordena cuando está disponible.

## Tareas

- [x] 1. Crear `src/pages/skills/index.astro` con el conjunto completo embebido en el HTML
  - Detalle de implementación: el frontmatter hace
  `const skills = await getCollection('skills')` y serializa cada entrada —
  `name`, `description`, `category`, `version`, `tags`, `href`— en el
  `data-*` de su tarjeta, además de los chips de categoría con su conteo y la
  unión de todos los tags disponibles. Todo el conjunto vive en el HTML
  generado (`[BUILD]`), de modo que filtrar es recorrer nodos y no una petición.
- [x] 2. Construir la barra de filtros con los chips de categoría
  - Detalle de implementación: un chip «Todas» más uno por categoría, en el orden
  del mapa `src/lib/categories.ts`, con el conteo visible. El chip activo usa
  `var(--accent-soft)` con texto `var(--accent)` (6.68:1 verificado) y un borde de
  `--accent-border`; el chip en reposo usa `--text-secondary`. Cada chip es un
  control real con `aria-pressed`, con objetivo táctil de 44×44px en móvil, y en
  móvil la barra hace scroll horizontal, que es una de las dos únicas excepciones
  permitidas junto a los bloques de código.
- [x] 3. Implementar la búsqueda en vivo sobre el conjunto embebido
  - Detalle de implementación: un `<input type="search">` con su `<label>`
  asociado y `type="search"`, que filtra mientras se escribe. La normalización
  pasa la consulta y cada campo a minúsculas y aplica `String.normalize('NFD')`
  seguido de la eliminación de los diacríticos, de modo que `arquitectura`
  encuentra `Arquitectura` y `arquitectóna`. La coincidencia es por subcadena y
  busca en nombre, descripción y tags. El contador de resultados se actualiza en
  la misma pasada.
- [x] 4. Añadir el filtro por tag y el selector de orden
  - Detalle de implementación: los tags disponibles salen de la unión de
  `tags` de toda la colección y se ofrecen en un control que asigna `?tag=`, con
  un valor activo visible. El selector de orden ofrece `alfabetico` (por `name`),
  `recientes` (por `lastUpdated`, descendente) y `destacadas` (`featured: true`
  primero, y dentro de cada grupo por nombre), y escribe `?sort=`. Un valor de
  `sort` que no esté en la lista se descarta al leer y no se refleja en la URL.
- [x] 5. Escribir `src/scripts/catalog-filters.ts` con la fuente de verdad en la URL
  - Detalle de implementación: `readFilters()` construye un objeto normalizado
  desde `new URLSearchParams(location.search)` y descarta valores inválidos;
  `applyFilters(filters)` calcula la visibilidad de cada tarjeta y actualiza el
  contador; `writeFilters(filters, { push })` llama a `history.pushState` o
  `replaceState` y después aplica. No existe un objeto de estado paralelo: el
  DOM se deriva de la URL, y escribir en el DOM implica escribir en la URL. Cada
  cambio de filtro usa `pushState` para que el botón «atrás» lo deshaga, salvo el
  input de texto, que usa `replaceState` con un debounce de 250ms para no llenar
  el historial de basura.
- [x] 6. Escuchar `popstate` y reaplicar los filtros sin reescribir la URL
  - Detalle de implementación: un `popstate` en `document` vuelve a aplicar los
  filtros leídos de la URL **sin** escribir en ella. Sin este listener, el botón
  «atrás» cambia la URL pero el grid no se mueve, que es el fallo más común de
  este patrón. También se sincroniza el input de texto, el chip activo, el tag
  activo y el selector de orden con los valores leídos, para que recargar una URL
  compartida muestre exactamente el mismo resultado.
- [x] 7. Implementar el contador de resultados y el estado vacío
  - Detalle de implementación: un nodo con `aria-live="polite"` anuncia «N skills»
  y se actualiza en cada cambio de filtro. Con cero resultados se muestra «No hay
  skills que coincidan con los filtros.» más un botón «limpiar filtros» que
  borra todos los parámetros de la URL y repone el grid completo. El contador no
  reserva altura porque no empuja contenido, para no generar CLS.
- [x] 8. Añadir el estado degradado cuando el conjunto no se puede leer
  - Detalle de implementación: si `readFilters` no puede leer el índice embebido,
  la búsqueda se desactiva con un texto explicativo y el catálogo completo sigue
  navegable por enlaces. No hay estado de carga: el conjunto ya está en el HTML
  cuando la página llega al navegador, y un esqueleto de carga sería una mentira
  arquitectónica.
- [x] 9. Añadir breadcrumb, título único y encabezado de sección
  - Detalle de implementación: `Breadcrumbs.astro` con `Inicio / Skills` —el
  último elemento sin enlace—, un único `<h1>` «Skills» y un párrafo introductorio
  que explica que el catálogo se genera en build desde `skills/`. Con una sola
  skill en la colección, la página sigue renderizando: el catálogo vacío es un
  estado legítimo, con su mensaje y sin cards.
- [x] 10. Cubrir los filtros con pruebas de integración
  - Detalle de implementación: casos para `?categoria=` con `?q=` y `?tag=`
  combinados, parámetro desconocido ignorado, valores vacíos eliminados de la
  URL, normalización de acentos en la búsqueda, coincidencia por tag,
  `pushState` en cada cambio de filtro y `replaceState` con debounce en el input,
  `popstate` reaplicando sin reescribir, y «limpiar filtros» restaurando el total.

## Criterios de Done

- [x] `/skills` lista todas las skills de la colección, sin ninguna lista escrita a mano en `src/`.
- [x] `/skills?q=spec` deja visibles solo las tarjetas cuya `name`, `description` o `tags` normalizados contienen `spec`, el contador refleja el total y `?q=` queda en la barra de direcciones.
- [x] Buscar `arquitectura` encuentra una skill descrita como `Arquitectura`, y buscar `QA` encuentra las de la categoría `qa`: la comparación ignora mayúsculas y acentos.
- [x] `?categoria=security` deja solo las skills de esa categoría, `?tag=` deja solo las que declaran ese tag, y la combinación de los tres parámetros funciona a la vez.
- [x] El botón «atrás» del navegador deshace el último filtro aplicado, y recargar una URL con filtros muestra el mismo resultado sin pulsar nada.
- [x] Escribir en el buscador no genera una entrada de historial por tecla: la URL se actualiza con `replaceState` tras 250ms, mientras que un clic en un chip sí genera una entrada con `pushState`.
- [x] Un valor de `sort` desconocido o un parámetro no reconocido se descartan sin aparecer en la URL y sin romper la página.
- [x] Con cero resultados se muestra el mensaje «No hay skills que coincidan con los filtros.» y el botón «limpiar filtros» repone el grid completo y borra los parámetros.
- [x] El contador de resultados se anuncia en un nodo `aria-live="polite"` y no produce desplazamiento al actualizarse.
- [x] En móvil la barra de filtros hace scroll horizontal y la página no tiene otro scroll horizontal; a 320px de ancho el catálogo no desborda.
- [x] El navegador no hace ninguna petición de red al filtrar: no hay `fetch` en `catalog-filters.ts` y el conjunto completo ya está en el HTML.
- [x] Sin regresión en el área: `npm run check` termina con 0 errores, las pruebas de filtros pasan y Lighthouse mantiene ≥ 95 en Accesibilidad sobre `npm run preview`.

---

<!-- Auditoría 2026-09-29: verificado contra el código. T1-T10 verificados: chips de categoria con Todas, buscador en vivo, filtro por tags, 3 opciones de orden, estado en URL con URLSearchParams, contador de resultados, estado vacio con botón limpiar, derivado de getSkills() sin listas hardcodeadas. -->
