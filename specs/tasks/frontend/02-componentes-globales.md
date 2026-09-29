# Componentes globales

## Estado Actual

`frontend/src/sections/` contiene siete componentes de la landing —`Header.astro`
(90 líneas, pill de vidrio flotante con tres enlaces ancla), `Hero.astro` (163),
`Features.astro` (68), `DesignSkills.astro` (94), `HowItWorks.astro` (85),
`CTA.astro` (47) y `Footer.astro` (93)— y `src/pages/index.astro` (21 líneas) los
compone. No existe `src/components/`: los componentes están nombrados por la
sección que sirven, no por su función, y por eso no son reutilizables desde
`/skills`, `/instalacion` o la documentación. No existen `src/scripts/`, así que
no hay tema con conmutador, ni menú móvil, ni modal de búsqueda, ni copia al
portapapeles, ni tabs de gestor de paquetes, ni acordeón. El bloque de código
existente es decorativo: no tiene etiqueta de lenguaje, ni botón de copiar, ni
desbordamiento interno, ni resaltado. La navegación se oculta por debajo de 640px
sin sustituto, de modo que en móvil no hay forma de llegar a la documentación.

## Objetivo

Ocho componentes compartidos, con props tipadas y sin JavaScript de framework,
que sirvan a las siete pantallas con el mismo encabezado, el mismo pie y el mismo
lenguaje visual, más las islas de comportamiento que cada uno necesita.

## Alcance

- `SiteHeader.astro`: fijo a 72px, subrayado activo de 2px, disparador de búsqueda
  con `Ctrl/⌘+K`, enlace a GitHub con contador de estrellas resuelto en build,
  toggle de tema, desenfoque y borde al pasar 40px de scroll, y hamburguesa que
  anima a ✕ con `aria-expanded`, foco atrapado y scroll bloqueado.
- `CodeBlock.astro`: etiqueta de lenguaje, botón de copiar con «¡Copiado!» y
  `aria-live`, desbordamiento horizontal interno y resaltado con la paleta de
  tokens; variante con nombre de archivo.
- `PackageManagerTabs.astro`: `npm`, `pnpm`, `yarn` y `bun`, con `localStorage` y
  sincronización entre todos los grupos de la página.
- `SkillCard.astro`: nombre en monospace, descripción a 2 líneas, badges de
  categoría y versión, tags, «Ver skill» y copia rápida del comando.
- `Badge.astro`: cuatro variantes (categoría, versión, compatibilidad, autor).
- `Breadcrumbs.astro`: presentes en toda página salvo Inicio, con separador `/` y
  último elemento no enlazado.
- `Accordion.astro`: `+` que rota 45° hasta `×`, `aria-expanded` y `aria-controls`.
- `SiteFooter.astro`: 4 columnas en escritorio, 2 en tablet, 1 en móvil, más la
  barra inferior.
- Las islas de `frontend/src/scripts/`: `index.ts`, `theme.ts`, `header.ts`,
  `search.ts`, `package-manager.ts`, `copy.ts`, `accordion.ts`.

## Fuera de alcance

- Los valores de los tokens que consumen: viven en
  [`01-sistema-de-diseno.md`](./01-sistema-de-diseno.md).
- Las páginas que los componen: `/` en [`04-inicio.md`](./04-inicio.md), `/skills`
  en [`05-catalogo.md`](./05-catalogo.md), la ficha en
  [`06-ficha-de-skill.md`](./06-ficha-de-skill.md), `/instalacion` en
  [`07-instalacion.md`](./07-instalacion.md), `/docs/**` en
  [`08-docs-starlight.md`](./08-docs-starlight.md) y `/contribuir` en
  [`09-contribuir.md`](./09-contribuir.md).
- El dato de estrellas de GitHub que muestra el header: se resuelve en
  [`11-datos-en-build-time.md`](./11-datos-en-build-time.md). Aquí solo se declara
  la prop que lo recibe.
- El contenido del índice que consume el modal `Ctrl/⌘+K`: se serializa en
  [`03-colecciones-de-contenido.md`](./03-colecciones-de-contenido.md).
- Cualquier framework de interfaz, hydration, signals o store global. No hay
  `client:*` en este proyecto salvo dentro de `/docs`.
- Persistencia más allá de `fwskills:theme` y `fwskills:pm`. No hay cookies, ni
  analítica, ni ninguna otra clave.

## Tareas

- [x] 1. Crear `frontend/src/components/` y mover las secciones reutilizables sin cambiar su marcado
  - Detalle de implementación: `src/sections/Header.astro` pasa a `src/components/SiteHeader.astro` y `src/sections/Footer.astro` a `src/components/SiteFooter.astro`; los otros cinco (`Hero`, `Features`, `DesignSkills`, `HowItWorks`, `CTA`) son bloques de una sola página y se quedan en `src/sections/` hasta que `04-inicio.md` los componga. Cada componente declara `interface Props` en el frontmatter y desestructura con valores por defecto. `src/pages/index.astro` actualiza los imports y sigue produciendo `/` sin cambiar su salida visible.
- [x] 2. Declarar el punto único de arranque de las islas en `frontend/src/scripts/index.ts`
  - Detalle de implementación: `index.ts` importa los siete módulos de
  comportamiento y los registra **una sola vez**, por delegación de eventos sobre
  contenedores estables y nunca por `id` de un elemento concreto. Cada módulo
  comprueba que su nodo existe antes de activarse (`document.querySelector('[data-search-trigger]')` y salir si no está), de modo que la misma isla sirve en páginas donde no aplica. Los scripts se cargan como `<script type="module">` desde `Layout.astro`. Registrar un listener dos veces es un bug silencioso, así que el arranque es idempotente por construcción.
- [x] 3. Construir `SiteHeader.astro` fijo con subrayado activo y animable
  - Detalle de implementación: `position: fixed`, altura `var(--header-height)` (72px), `z-index` por encima del contenido. Izquierda: wordmark que enlaza a `/`. Centro-derecha: `Skills · Instalación · Docs · Contribuir`; el ítem activo se marca con un subrayado de 2px en `var(--accent)` y en hover el subrayado se anima con `transform`/`scaleX`, nunca con transición de `color`. El marcado usa `aria-current="page"` en el enlace activo. La comparación de ruta es `Astro.url.pathname.startsWith(href)`, con coincidencia exacta para `/`.
- [x] 4. Añadir al header el disparador de búsqueda, el enlace a GitHub con estrellas, el toggle de tema y el estado de scroll
  - Detalle de implementación: a la derecha, un `<button data-search-trigger
  aria-label="Buscar" aria-haspopup="dialog">` que documenta el atajo
  `Ctrl/⌘+K`; un enlace a GitHub con `target="_blank" rel="noopener"` y un
  `<span data-github-stars>` que recibe la prop `stars: number | null` (y no
  renderiza nada cuando es `null`, nunca `0`); y un toggle de tema con
  `aria-pressed`. `src/scripts/header.ts` añade o quita la clase de scroll a los
  40px, aplicando `backdrop-filter: blur(12px) saturate(140%)` y un borde inferior
  de 1px. El contador de estrellas no lleva `aria-live`: en build no cambia.
- [x] 5. Implementar el menú móvil del header con hamburguesa que anima a ✕, foco atrapado y scroll bloqueado
  - Detalle de implementación: por debajo de 768px, `<button data-menu-trigger
  aria-expanded="false" aria-controls="menu-panel" aria-label="Abrir menú">` con
  tres barras que rotan 45° hasta componer ✕, y un panel a pantalla completa con
  `hidden` como fuente de verdad del estado. `header.ts` mueve el foco al primer
  enlace al abrir, lo atrapa con `Tab`/`Shift+Tab` sobre el índice de elementos
  enfocables, cierra con ✕, con clic fuera (con comprobación de contención) y con
  `Esc` en `keydown` de `document`, y **restaura el foco al elemento que abrió**.
  Mientras está abierto, `body` recibe `overflow: hidden` y el resto del documento
  recibe `inert`. Con `prefers-reduced-motion: reduce` el panel aparece y desaparece
  sin transición. Los dos paneles (menú y modal) no pueden estar abiertos a la vez.
- [x] 6. Construir `CodeBlock.astro` con etiqueta de lenguaje, copia, desbordamiento interno y resaltado
  - Detalle de implementación: fondo `var(--surface-elevated)`, `radius-md`, borde
  `var(--border)`, etiqueta de lenguaje arriba a la izquierda en caption, botón
  «Copiar» arriba a la derecha y `overflow-x: auto` **interno** para que el bloque
  nunca desborde la página. El resaltado usa los roles `--syn-*` de
  `01-sistema-de-diseno.md`. La variante con nombre de archivo sustituye la
  etiqueta de lenguaje por el nombre y es la que se usa en `/docs`.
- [x] 7. Implementar la copia al portapapeles con «¡Copiado!» anunciado y reserva de temporizador
  - Detalle de implementación: `src/scripts/copy.ts` delega `click` sobre
  `[data-copy]`, lee el texto del atributo, escribe en `navigator.clipboard` y
  cambia la etiqueta del botón a «¡Copiado!» en `var(--success)` durante 2s, con el
  cambio anunciado en un nodo `aria-live="polite"`. El `setTimeout` se guarda en
  `data-copy-timer` del propio nodo, para que un segundo clic lo reinicie en lugar
  de acumular temporizadores. Si `navigator.clipboard` no existe o el permiso se
  deniega, se avisa «No se pudo copiar» en `var(--error)`, se muestra el texto en
  un input seleccionable y no se rompe la página.
- [x] 8. Construir `PackageManagerTabs.astro` con los cuatro gestores y sincronización por evento único
  - Detalle de implementación: pestañas `npm`, `pnpm`, `yarn` y `bun` con
  `role="tablist"`, `role="tab"` y `role="tabpanel"`, `aria-selected` y navegación
  por flechas. `src/scripts/package-manager.ts` registra **un solo listener** en
  `document` para `[data-pm-tab]`, valida contra la lista de cuatro valores,
  escribe `localStorage['fwskills:pm']` y emite
  `CustomEvent('fwskills:pm', { detail })`; un único listener de ese evento
  actualiza todos los `[data-pm-tabs]` de la página en ambos sentidos. El valor
  persistido se aplica en el script inline del `<head>` con un atributo
  `data-pm` en `<html>`, igual que el tema, para que no haya un frame con `npm`
  antes de cambiar a `pnpm`. Todo acceso a `localStorage` va en `try/catch`.
- [x] 9. Construir `SkillCard.astro` con nombre en monospace, descripción recortada y copia rápida
  - Detalle de implementación: acepta `skill: SkillEntry` y emite nombre en
  `var(--font-mono)` a 17px, descripción recortada a 2 líneas con
  `-webkit-line-clamp: 2`, badge de categoría, badge de versión, tags en caption con
  `--text-muted`, botón «Ver skill» primario y un botón de icono que copia
  `npx fwskills add <categoria>/<slug>` con `[data-copy]` sin navegar. La tarjeta
  completa es enlace al destino, y el botón de copia queda fuera del enlace para no
  disparar la navegación.
- [x] 10. Construir `Badge.astro` con sus cuatro variantes
  - Detalle de implementación: variante `category` (nombre de la categoría, un
  color por categoría, texto en `--on-accent`), `version` (`v1.2.0`,
  `--text-secondary` sobre `--surface-elevated`), `compatibility` (agentes
  soportados, mismo tratamiento) y `author` (nombre o avatar en `--text-muted`,
  enlazado al perfil de GitHub). Todas con `radius-pill` y tipografía caption.
- [x] 11. Construir `Breadcrumbs.astro` y `Accordion.astro` con su contrato accesible
  - Detalle de implementación: `Breadcrumbs.astro` acepta `items: { label: string;
  href?: string }[]`, renderiza separador `/` y deja el último elemento sin
  enlace, en caption, separado del título por `--space-md`. `Accordion.astro`
  acepta `items` y una prop `singleOpen` para la allowlist de un panel abierto a la
  vez (FAQ de Inicio y sección 8 de `/instalacion`); el icono `+` rota 45° hasta
  quedar en `×`, el contenido se despliega con fundido más desplazamiento, y el
  botón lleva `aria-expanded` y `aria-controls` apuntando al `id` del panel.
  `src/scripts/accordion.ts` es el único que escribe ese atributo.
- [x] 12. Construir `SiteFooter.astro` con cuatro columnas responsivas y barra inferior
  - Detalle de implementación: fondo `var(--surface)` y borde superior de 1px en
  `var(--border)`, idéntico en todas las páginas. Cuatro columnas —Marca
  (wordmark, una línea descriptiva, iconos GitHub / npm / comunidad), Producto
  (Skills · Instalación · Docs · Changelog), Comunidad (Contribuir · Código de
  conducta · Gobernanza · Reportar un problema) y Recursos (GitHub · npm ·
  Licencia · Seguridad)— en 4 columnas a escritorio, 2 en tablet y 1 en móvil. La
  barra inferior dice «© 2026 fwskills. Proyecto open source bajo licencia MIT.
  Hecho por la comunidad.»
- [x] 13. Construir el modal de búsqueda global sobre el índice de build
  - Detalle de implementación: `src/scripts/search.ts` abre el diálogo con
  `Ctrl/⌘+K` desde cualquier página, cierra el menú móvil si estuviera abierto, y
  al abrir por primera vez en la sesión carga `/search-index.json` —un archivo
  estático del propio sitio, nunca una API— para buscar skills y documentación en
  el mismo índice. Navegación por flechas, `Enter` lleva a la página, y el resultado
  se anuncia en `aria-live="polite"`. Si el índice no se puede leer, la búsqueda se
  desactiva con un texto explicativo y el resto del sitio sigue navegable. Comparte
  con el menú móvil la trampa de foco, el cierre con `Esc` y la restauración del
  foco.
- [x] 14. Sustituir la navegación ancla de la landing por la del header compartido
  - Detalle de implementación: `Header.astro` deja de enlazar a `#caracteristicas`,
  `#skills` y `#como-funciona` y pasa a apuntar a `/skills`, `/instalacion`,
  `/docs` y `/contribuir`. Los enlaces ancla se conservan en el cuerpo de la
  landing solo como acceso rápido desde «Cómo funciona», y ambos destinos existen
  como ruta real, para que ningún `href` interno dé 404.
- [x] 15. Cubrir el comportamiento de los componentes con pruebas de integración
  - Detalle de implementación: `frontend/test/` con casos para menú móvil
  (`aria-expanded` a `true`, foco dentro del panel, `Esc` lo cierra, `overflow`
  bloqueado en `body`, foco restaurado al botón que lo abrió), tabs de gestor
  (elegir `pnpm` en un grupo cambia los demás de la página y sobrevive a la
  recarga), copia («¡Copiado!» visible y anuncio en `aria-live`), acordeón
  (`aria-expanded` alterna y el panel asociado cambia de `hidden`), y conmutador de
  tema (el atributo `data-theme` en `<html>` cambia y persiste).

## Criterios de Done

- [ ] Los ocho archivos existen en `frontend/src/components/` y cada uno declara `interface Props`; `astro check` no reporta ninguna prop implícita.
- [ ] `/`, `/skills`, `/skills/<categoria>/<slug>`, `/instalacion`, `/contribuir` y `/docs/introduccion` comparten el mismo `SiteHeader.astro` y el mismo `SiteFooter.astro`.
- [x] El header es `position: fixed` con altura 72px; al hacer scroll de 40px gana `backdrop-filter: blur(12px) saturate(140%)` y borde inferior de 1px.
- [x] El enlace de la ruta actual lleva `aria-current="page"` y un subrayado de 2px en `--accent`; ese subrayado se anima por `transform`, no por `color`.
- [x] En móvil el botón de menú alterna `aria-expanded`, el foco queda dentro del panel mientras está abierto, `Esc` lo cierra, `body` tiene el scroll bloqueado y al cerrar el foco vuelve al botón que lo abrió.
- [ ] Un bloque de código largo hace scroll horizontal dentro del bloque y la página no tiene scroll horizontal a 320px de ancho.
- [x] Copiar un comando muestra «¡Copiado!» durante 2s en `--success` y el cambio se anuncia en un nodo `aria-live="polite"`; con el portapapeles denegado se muestra «No se pudo copiar» y el texto queda seleccionable.
- [x] Elegir un gestor de paquetes en un grupo actualiza todos los grupos de la página sin recargar, y tras recargar se mantiene el valor de `fwskills:pm`.
- [x] Todo icono decorativo lleva `aria-hidden="true"` y `focusable="false"`; el icono que es único contenido de un control va con `aria-label` en el control.
- [ ] Todo objetivo táctil del header, del menú y de los tabs mide al menos 44×44px en móvil.
- [x] El sitio no envía ningún framework: `grep -rn 'client:' frontend/src` no devuelve ninguna directiva de hydration fuera de la integración de Starlight.
- [x] `localStorage` solo contiene las claves `fwskills:theme` y `fwskills:pm`, y todo acceso va envuelto en `try/catch`.
- [x] Sin regresión en el área: `npm run check` termina con 0 errores y `npm run build` genera `dist/` con la página `/` completa.

---

<!-- Auditoría 2026-09-29. COMPLETAS T1,T3-T13: los 8 componentes globales existen y sus comportamientos estan implementados (header fijo con subrayado activo y panel movil con foco atrapado, CodeBlock con copiar, PackageTabs con 4 gestores y localStorage, SkillCard con line-clamp, Badge con 4 variantes, Breadcrumbs con ultimo no-link, Accordion con + que rota a x, Footer 4 columnas, SearchDialog con Ctrl+K sobre el indice de build). Resueltas despues: T2, T14, T15.
T2: src/scripts/index.ts es el punto unico; los 7 modulos (theme, header, copy, package-tabs, accordion, search, reveal) se registran ahi y init() es idempotente. Se eliminaron los 5 bloques <script> de componentes y el reveal duplicado que contribuir.astro tenia. Los listeners ahora son handlers nombrados con unregister, que es lo que permite aislar un caso de test y ademas hace removible cada listener en produccion.
T14: el header ya usaba rutas reales; se agrego el acceso rapido desde "Como funciona" con los 3 pasos apuntando a /skills, /instalacion y /docs/introduccion. Verificado: los 14 enlaces internos de la landing resuelven 200.
T15: test/components.test.ts cubre los 5 comportamientos del spec (menu movil con aria-expanded, foco atrapado, Esc, overflow y restauracion de foco; tabs con sincronizacion entre grupos y persistencia; copia con exito Y con portapapeles denegado; acordeon con aria-expanded y hidden, incluido el modo exclusivo; tema con data-theme y persistencia). 20 tests, 0 fallos.

El desarrollo de estos tests encontro y corrigio un bug real: los modulos se auto-registraban al importarse, asi que un segundo init() duplicaba los listeners y el toggle del acordeon se aplicaba dos veces (abria y cerraba en el mismo click). Verificado en reproduccion aislada antes de arreglarlo. -->
