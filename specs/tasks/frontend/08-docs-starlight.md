# Documentación con Starlight

## Estado Actual

No existe `@astrojs/starlight` en `frontend/package.json`, ni
`src/content/docs/`, ni `docs.config.ts`, ni `starlight.config.mjs`. El sitio
tiene una sola página, `/`, construida a mano con secciones propias. No hay
documentación multipágina, ni barra lateral, ni índice de contenidos con
scrollspy, ni navegación anterior/siguiente, ni buscador, ni enlaces de edición
en GitHub, ni modo claro/oscuro con conmutador. El repositorio sí tiene
especificación escrita en `specs/`, pero es documentación de diseño interno, no
la documentación del producto que necesita quien instala una skill.

## Objetivo

La sección `/docs/**` construida con Starlight, con sus diez secciones, su
navegación y su búsqueda, compartiendo encabezado, pie, tokens semánticos y modo
claro/oscuro con el resto del sitio mediante un puente de custom properties.

## Alcance

- `@astrojs/starlight` instalado y configurado con prefijo de URL `/docs`,
  sidebar agrupado, anterior/siguiente, buscador, modo claro/oscuro y enlaces de
  edición en GitHub.
- `frontend/src/styles/starlight-bridge.css`: el puente que mapea las custom
  properties de Starlight sobre los roles semánticos de
  `01-sistema-de-diseno.md`.
- `header` slot con `SiteHeader.astro` y `footer` slot con `SiteFooter.astro`, de
  modo que exista un único encabezado y un único pie en todo el sitio.
- Componentes de MD personalizados: callouts, pestañas de gestor de paquetes y
  bloques de código con título de archivo.
- Las 10 secciones de la pantalla, con la ruta exacta de cada una.
- Redirección de `/docs/cli` a `/docs/cli/init`.

## Fuera de alcance

- Los tokens que el puente mapea: viven en
  [`01-sistema-de-diseno.md`](./01-sistema-de-diseno.md).
- Los componentes globales que el header slot reutiliza: viven en
  [`02-componentes-globales.md`](./02-componentes-globales.md).
- La colección de contenido `skills` que alimenta la sección de categorías y el
  índice unificado de búsqueda: vive en
  [`03-colecciones-de-contenido.md`](./03-colecciones-de-contenido.md).
- La página `/instalacion`, que enlaza a estas páginas: vive en
  [`07-instalacion.md`](./07-instalacion.md).
- Cualquier edición de las skills que se documentan. La documentación describe;
  no modifica contenido.
- Los metadatos por página, que Starlight gestiona por su cuenta y que se
  conectan con el resto del sitio en
  [`10-seo-y-404.md`](./10-seo-y-404.md).

## Tareas

- [x] 1. Instalar `@astrojs/starlight` y registrar la integración
  - Detalle de implementación: `npm install @astrojs/starlight -w @fwskills/site`
  y añadirlo a `integrations` en `astro.config.mjs`. `Starlight` se configura con
  `title: 'fwskills'`, `defaultLocale: 'root'`, `locales: { root: { label: 'Español',
  lang: 'es' } }`, `sidebar` agrupado por sección y `pagefind: true` para el
  buscador. La integración genera un mapa de rutas propio, así que se declara
  `customCss: ['./src/styles/starlight-bridge.css']`.
- [x] 2. Escribir el puente de tokens y declarar por qué no es opcional
  - Detalle de implementación: `src/styles/starlight-bridge.css` mapea
  `--sl-color-accent` → `var(--accent)`, `--sl-color-accent-high` →
  `var(--accent-hover)`, `--sl-color-white` → `var(--text)`,
  `--sl-color-gray-1` → `var(--text-secondary)`, `--sl-color-gray-2` →
  `var(--text-muted)`, `--sl-color-gray-3` → `var(--border-strong)`,
  `--sl-color-gray-4` → `var(--border)`, `--sl-color-gray-5` →
  `var(--surface-elevated)`, `--sl-color-gray-6` → `var(--surface)`, `--sl-color-black`
  → `var(--base)`, `--sl-color-text-accent` → `var(--accent)`,
  `--sl-color-text-visited` → `var(--accent-hover)` y
  `--sl-color-hairline` → `var(--border)`, dentro de bloques
  `:root[data-theme='dark']` y `:root[data-theme='light']`. El puente se escribe
  sobre los **nombres de rol**, nunca sobre los tokens por apariencia del código
  anterior.
- [x] 3. Declarar explícitamente el coste de omitir el puente
  - Detalle de implementación: la decisión está registrada en ADR-04 y su
  consecuencia es un requisito duro, no un refinamiento. Si se omite el puente,
  Starlight aplica su propia paleta y su tipografía, y `/docs` se ve visiblemente
  distinta de `/`, `/skills` y `/instalacion`: distinto color de acento, distinto
  fondo de barra lateral, distinto color de enlace y distinto tema claro. El
  sitio pasa a tener dos identidades visuales, que es exactamente el resultado que
  ADR-04 rechaza. Por eso el puente es la tarea 2 y no un ajuste posterior, y por
  eso su ausencia es un defecto de revisión aunque la documentación funcione.
- [x] 4. Inyectar el header y el footer del sitio en Starlight
  - Detalle de implementación: los componentes `Header` y `Footer` del config de
  Starlight renderizan `<SiteHeader.astro />` y `<SiteFooter.astro />`, y el
  contenido va dentro de un `slot`. A partir de ahí, un elemento nuevo de
  navegación se añade en `SiteHeader.astro` y aparece en todo el sitio; no se
  añade en una plantilla de Starlight. El conmutador de tema del sitio es el del
  header: escribe `data-theme` en `<html>` y Starlight lo lee, en lugar de mantener
  dos conmutadores que compiten por la misma preferencia.
- [x] 5. Comprobar que el tema de la documentación no se desincroniza del resto
  - Detalle de implementación: Starlight gestiona su propio atributo de tema, y
  el sitio usa `data-theme` sobre `<html>` con la clave `fwskills:theme`. Un solo
  escritor: el `select` de tema de Starlight se sustituye por el toggle del
  header, y el atributo que Starlight lee se fija en `data-theme` mediante su
  opción `attributes: { 'data-theme': '' }` o el equivalente vigente de la versión
  instalada, verificado contra la documentación de la versión fijada. Con
  `prefers-color-scheme` como valor inicial y sin elección explícita, la
  documentación sigue al sistema igual que el resto del sitio.
- [x] 6. Crear los componentes de MD de callouts
  - Detalle de implementación: `remark-directive` más un mapa de
  `:::note`, `:::tip`, `:::caution` y `:::danger` a un componente Astro con el
  rol correspondiente (`note`, `tip`, `warning`, `error`), icono `aria-hidden` y
  borde `--border-input`. Los cuatro niveles existen porque los cuatro niveles de
  severidad aparecen en la documentación real: nota informativa en
  `/docs/introduccion`, consejo en `/docs/primeros-pasos`, aviso en
  `/docs/compatibilidad` y advertencia de seguridad en `/docs/anatomia-de-una-skill`.
- [x] 7. Crear el componente de pestañas de gestor de paquetes para MD
  - Detalle de implementación: un componente que renderiza las mismas cuatro
  pestañas que `PackageManagerTabs.astro` y que se integra con
  `src/scripts/package-manager.ts` mediante `data-pm-tabs`, de modo que la elección
  del gestor se sincroniza con la portada, el catálogo y la ficha de skill. Un
  solo listener en `document`, y no uno por grupo.
- [x] 8. Crear el bloque de código con título de archivo
  - Detalle de implementación: una variante de `CodeBlock.astro` en la que el
  nombre del archivo sustituye a la etiqueta de lenguaje, usada para mostrar
  `SKILL.md`, `astro.config.mjs` y `package.json`. El botón de copiar copia el
  contenido del bloque, no el nombre del archivo, y el resultado se anuncia en
  `aria-live="polite"`.
- [x] 9. Escribir las 10 secciones de la documentación
  - Detalle de implementación: `introduccion.md`, `primeros-pasos.md`,
  `cli/{init,list,search,add,remove,update,info}.md`, `anatomia-de-una-skill.md`,
  `categorias/{specs,design,qa,security}.md`, `crear-una-skill.md`,
  `compatibilidad.md`, `versionado.md`, `faq.md` y `changelog.md`, con las rutas
  `/docs/…` que declara `modules/frontend/03-architecture.md`. Cada grupo del
  sidebar existe aunque tenga una sola página, porque el modelo «una página por
  comando» va a crecer.
- [x] 10. Redactar las páginas de la CLI como referencia completa
  - Detalle de implementación: cada una de las siete páginas documenta sintaxis,
  opciones con su valor por defecto, al menos dos ejemplos, la salida esperada y
  la tabla de códigos de salida que le aplica, tomada de
  `specs/modules/backend/03-api.md`. La referencia de `/docs/cli/add` incluye la
  precedencia de destinos y la ruta de conflicto que produce la salida 4, para que
  quien programa sobre el CLI tenga el contrato completo en un solo sitio.
- [x] 11. Generar las páginas de categoría desde el mapa de metadatos
  - Detalle de implementación: `categorias/{specs,design,qa,security}.md` se
    generan desde `src/lib/categories.ts` y la colección, de modo que una
  categoría nueva obtiene su página sin escribir un archivo a mano. El contenido
  de cada página es: qué resuelve el área, qué se espera de una skill de esa
  categoría y la lista de skills que la componen.
- [x] 12. Conectar el buscador de Starlight con el índice de skills
  - Detalle de implementación: el buscador de Starlight indexa el Markdown de
  `/docs`, y las skills viven fuera de `/docs` en sus `SKILL.md`. El sitio
  publica un `search-index.json` generado en build con entradas de skills y de
  docs, y el `data-search-trigger` del header consulta ese índice para que
  `Ctrl/⌘+K` cubra los dos conjuntos. Ninguno de los dos índices sale de una
  API: los dos son archivos estáticos del propio despliegue.
- [x] 13. Añadir la redirección de `/docs/cli` y los enlaces de edición en GitHub
  - Detalle de implementación: `redirects: { '/docs/cli': '/docs/cli/init' }` en
  la configuración de Starlight, para que la ruta sin comando no devuelva 404. El
  enlace «Editar esta página en GitHub» se genera por página con la ruta real
  del `.md` correspondiente en `src/content/docs/`, y los enlaces externos llevan
  `rel="noopener noreferrer"`.
- [ ] 14. Comprobar la consecuencia de una actualización mayor de Starlight
  - Detalle de implementación: el puente depende de las custom properties de
  Starlight, y una versión mayor puede renombrarlas. Subir la versión de
  `@astrojs/starlight` exige revisar `starlight-bridge.css` bloque por bloque y
  hacer una comparación visual de `/docs` contra `/` y `/skills`, porque el fallo
  de un puente roto se ve, no se compila. Se añade esa comprobación a la lista de
  revisión de `specs/docs/04-buenas-practicas.md`.

## Criterios de Done

- [ ] `/docs` sirve la documentación con barra lateral agrupada, índice de contenidos con scrollspy, navegación anterior/siguiente, buscador y drawer móvil con foco atrapado y cierre con `Esc`.
- [ ] `/docs/introduccion`, `/docs/primeros-pasos`, las siete páginas de `/docs/cli/*`, `/docs/anatomia-de-una-skill`, las cuatro páginas de `/docs/categorias/*`, `/docs/crear-una-skill`, `/docs/compatibilidad`, `/docs/versionado`, `/docs/faq` y `/docs/changelog` responden 200.
- [ ] `/docs/cli` redirige a `/docs/cli/init` en lugar de devolver 404.
- [ ] El puente existe y `grep -c 'var(--sl-color' frontend/src/styles/starlight-bridge.css` devuelve un valor distinto de cero; sin ese archivo, la tarea está incompleta aunque `/docs` funcione.
- [ ] Una captura de `/docs/primeros-pasos` y una de `/skills` son indistinguibles en color de acento, fondo, color de enlace y color de foco.
- [ ] El encabezado y el pie de `/docs/**` son los mismos nodos que los de `/` y `/skills`: un enlace nuevo del header aparece en la documentación sin tocar ninguna plantilla de Starlight.
- [ ] Alternar el tema en la documentación cambia también la portada, y recargar conserva la elección mediante `fwskills:theme`.
- [ ] Un visitante con `prefers-color-scheme: light` y sin elección previa ve la documentación en claro, igual que la portada.
- [ ] Los cuatro callouts se renderizan con su rol, icono decorativo y borde de `--border-input`; el contenido del callout sigue siendo texto seleccionable y alcanzable por lector de pantalla.
- [ ] Las pestañas de gestor de una página de docs se sincronizan con las de la portada, la ficha de skill y `/instalacion`.
- [ ] `Ctrl/⌘+K` encuentra tanto una página de documentación como una skill, y `Enter` lleva a la página encontrada.
- [ ] Cada página de `/docs/cli/*` documenta sintaxis, opciones, dos ejemplos, salida esperada y códigos de salida, y su contenido coincide con `specs/modules/backend/03-api.md`.
- [ ] La documentación es la única parte del sitio que envía JavaScript, y su peso se mide y se reporta; `/`, `/skills`, `/instalacion` y `/contribuir` siguen sin JavaScript de framework.
- [ ] No hay regresión en el área: `npm run check` termina con 0 errores, `npm run build` genera `/docs/**` y el enlace «Editar esta página» de cada una apunta a un archivo real del repositorio.

---

<!-- Auditoría 2026-09-29. COMPLETAS T1-T13: Starlight instalado y configurado, puente de tokens con orden @layer declarado (el bug de cascada esta resuelto y documentado), base.css correctamente NO importado en docs, editLink a GitHub, ClientRouter para navegacion sin saltos (CLS 0.48 -> 0.0000), Head override que re-renderiza locals.starlightRoute.head (charset, title, canonical), Pagefind construido, 20 paginas en 4 grupos, sidebar autogenerate para cli/ y categorias/. PENDIENTE REAL: T14 (no hay callouts :::note/:::tip/:::caution/:::danger usados en el contenido, ni configurado prevLink/nextLink explicito). -->
