# 06 — Estado

## Dominio del estado

Primero, el inventario honesto: **¿existe estado hoy en este proyecto?**

| Estado | Estado actual | Nota |
|---|---|---|
| Datos del catálogo | **No, en el cliente** | No hay catálogo: la página actual es una landing estática con contenido literal |
| Filtros de búsqueda | **No existe** | Especificado para `/skills` |
| Tema claro/oscuro | **No existe funcionalmente** | `Layout.astro` declara `:root` solo oscuro y no hay conmutador ni persistencia |
| Gestor de paquetes | **No existe** | Especificado para los tabs `npm · pnpm · yarn · bun` |
| Menú móvil abierto | **No existe** | El header actual oculta la navegación por debajo de 640px sin sustituto |
| Modal de búsqueda | **No existe** | Especificado con `Ctrl/⌘+K` |
| Acordeón | **No existe** | El header actual no tiene desplegables |
| Copia al portapapeles | **No existe** | `Hero.astro` muestra una terminal decorativa, no copiable |

Es decir: **cero estado de cliente** en el código actual. Todo lo de este
documento es `[ESPECIFICADO]`.

Inventario del estado que el sitio necesita:

| Estado | Tipo | Alcance | ¿Se puede compartir? |
|---|---|---|---|
| Filtros del catálogo (`categoria`, `q`, `tag`, `sort`) | Colección de valores | `/skills` | **Sí**, por URL |
| Tema (`light` / `dark`) | Preferencia | Todo el sitio | No, es personal |
| Gestor de paquetes (`npm`/`pnpm`/`yarn`/`bun`) | Preferencia | Todo el sitio | No, es personal |
| Modal de búsqueda abierto | Booleano | Un componente | No |
| Consulta del buscador | Texto | Un componente | No |
| Menú móvil abierto | Booleano | Header | No |
| Panel móvil: ¿dónde se enfoca al abrir? | Nodo activo | Header | No |
| Acordeón: qué panel está abierto | Booleano por id | Página | No |
| Pestaña activa de los tabs de gestor | Preferencia + estado local | Página | Sí, por preferencia |
| Resultado copiado (feedback "¡Copiado!") | Booleano + temporizador | Componente | No |

---

## Solución

### Principio

**El sitio envía cero framework de estado.** No hay React, Vue, Svelte, Solid ni
signals. No hay store global, ni context, ni reducer. El estado vive en cuatro
lugares, y cada lugar tiene una razón para existir:

1. **La URL**, para lo que debe poder compartirse o marcarse.
2. **`localStorage`**, para las preferencias personales.
3. **El DOM**, para lo efímero y ligado a un componente.
4. **El frontmatter**, para lo que es constante en build.

Una quinta categoría queda **explícitamente prohibida**: estado global en
memoria. Si dos componentes necesitan compartir algo que no es ni URL ni
preferencia, el diseño está mal.

### Las tres islas

Solo tres comportamientos exigen JavaScript. Cada uno es un módulo nativo de
`src/scripts/`, cargado con `<script type="module">`, sin framework, sin
dependencias. Se enganchan por delegación de eventos sobre contenedores
estable, nunca por `id`.

| Isla | Archivo | Se activa en |
|---|---|---|
| Tema | `theme.ts` | Todas las páginas |
| Header (scroll, menú móvil) | `header.ts` | Todas las páginas |
| Controles del catálogo | `catalog-filters.ts` | `/skills` |
| Búsqueda global | `search.ts` | Todas las páginas |
| Tabs de gestor | `package-manager.ts` | Todas las páginas que tengan tabs |
| Copia al portapapeles | `copy.ts` | Todas las páginas |
| Acordeón | `accordion.ts` | Inicio, `/instalacion` (sección 8), `/docs/faq` |

Se cargan siempre y todas: cada isla asume que existe un nodo antes de
activarse (`document.querySelector('[data-search-trigger]')` y, si no está,
salir). Añadir una isla nueva no obliga a tocar las demás.

### Estado 1 — Filtros del catálogo: en la URL

Es el único estado que **tiene** que estar en la URL, por dos razones concretas:
una persona comparte un enlace con su filtro aplicado, y el botón "atrás" del
navegador deshace el último filtro.

| Parámetro | Valores | Valor por defecto |
|---|---|---|
| `categoria` | Slug de una subcarpeta de `skills/` | ausente = todas |
| `q` | Texto libre | ausente |
| `tag` | Un tag exacto | ausente |
| `sort` | `alfabetico` \| `recientes` \| `destacadas` | `alfabetico` |

```text
/skills?categoria=specs&q=arquitectura&tag=documentacion&sort=recientes
```

La fuente de verdad es la URL. **No hay un objeto de estado paralelo**: el DOM se
deriva de `URLSearchParams`, y escribir en el DOM implica escribir en la URL.

Implementación, en tres funciones y ningún más:

| Función | Responsabilidad |
|---|---|
| `readFilters()` | `new URLSearchParams(location.search)` → objeto normalizado, con valores inválidos descartados |
| `applyFilters(filters)` | Calcula qué tarjetas quedan visibles, actualiza el DOM y el contador |
| `writeFilters(filters, { push })` | `history.pushState` / `replaceState` + `applyFilters` |

Dos reglas que evitan bugs de navegación:

| Regla | Motivo |
|---|---|
| Cada cambio de filtro usa `history.pushState`, **no** `replaceState` | Si el filtro se escribiera con `replaceState`, el botón "atrás" del navegador no lo deshace y el usuario lo percibe como un error |
| El input de texto se escribe en la URL con `replaceState` y **debounce de 250ms** | Escribir cada tecla como entrada de historial llena el historial del navegador de basura; `replaceState` mantiene el paso atrás útil |

`popstate` (el botón "atrás") se escucha en el documento y vuelve a aplicar los
filtros sin reescribir la URL. Si se olvida, el botón "atrás" cambia la URL pero
el grid no se mueve: es el bug más común de este patrón.

El conjunto completo de skills ya está en el HTML (`[BUILD]`, ver
[`04-screens.md`](./04-screens.md)), así que filtrar es recorrer nodos, no una
petición. Con cientos de skills es instantáneo; si el catálogo creciera a miles,
el mismo modelo funciona troceando el conjunto en build en varios
`search-index` por primera letra, y cargando solo el trozo correspondiente al
prefijo que el usuario está escribiendo.

### Estado 2 — Tema: atributo + `localStorage`

| Pieza | Detalle |
|---|---|
| Dónde vive el estado efectivo | El atributo `data-theme` en `<html>`. Es lo que lee el CSS. |
| Dónde vive la preferencia | `localStorage["fwskills:theme"]` = `"light"` \| `"dark"` |
| Ausencia de clave | Significa "seguir al sistema". No se escribe `"system"`: la ausencia ya lo expresa, y así la clave nunca está desincronizada del atributo |
| Punto de escritura | El toggle, en un solo lugar |
| Punto de lectura | El script anti-parpadeo del `<head>`, antes del primer pintado |

Estructura en `theme.ts`, tres funciones:

| Función | Cuándo se llama |
|---|---|
| `applyTheme(theme)` | Al cambiar el toggle; escribe el atributo y `localStorage` |
| `toggleTheme()` | En el `click` del botón; lee el atributo actual, invierte, delega |
| `syncToggleState()` | En el arranque, para que el botón muestre el estado real |

Punto delicado resuelto por diseño: el `<head>` escribe el atributo con un script
inline **antes** de pintar, y `theme.ts` no vuelve a escribirlo al arrancar. Si
`theme.ts` hiciera lo mismo, habría dos escritores del mismo atributo y una
ventana de carrera con el primer pintado.

### Estado 3 — Gestor de paquetes: `localStorage` + sincronización

| Pieza | Detalle |
|---|---|
| Clave | `localStorage["fwskills:pm"]` = `"npm"` \| `"pnpm"` \| `"yarn"` \| `"bun"` |
| Valor por defecto | `"npm"` |
| Alcance de la sincronización | **Todos** los grupos de tabs de la página, en ambos sentidos |

Requisito explícito: cuando el usuario elige `pnpm` en un bloque del hero,
**todos** los demás grupos de la página cambian a `pnpm` a la vez, sin recargar.

La implementación tiene **un solo listener en el documento**, no uno por grupo:

| Paso | Qué hace |
|---|---|
| 1 | `click` en un `[data-pm-tab]` (delegado en `document`) |
| 2 | Lee `data-pm-tab`, lo valida contra la lista de cuatro valores |
| 3 | Escribe `localStorage` |
| 4 | Emite un `CustomEvent('fwskills:pm', { detail })` en `document` |
| 5 | Un único listener de ese evento actualiza **todos** los `[data-pm-tabs]` de la página |

Los listeners por grupo son el error de diseño clásico aquí: al añadir un
componente nuevo hay que acordarse de suscribirlo, y se desincroniza en silencio.
Con un evento único en el documento, un grupo nuevo se actualiza solo por existir
en el DOM.

`localStorage` puede lanzar (modo privado, `storage` deshabilitado, cuota). Es
envuelto en `try/catch`: si falla, el sitio funciona con el valor por defecto y
nada más. Ningún estado del sitio puede depender de que `localStorage` funcione.

### Estado 4 — Modal y menú móvil: estado efímero del DOM

No se guarda en ninguna variable global. El estado **es** el atributo:

```html
<button data-menu-trigger aria-expanded="false" aria-controls="menu-panel">…</button>
<div id="menu-panel" hidden>…</div>
```

`hidden` es la fuente de verdad del estado abierto/cerrado. `aria-expanded` es
el reflejo accesible, no el origen.

**Trampa de foco**, idéntica para el modal de búsqueda y para el menú móvil:

| Regla | Detalle |
|---|---|
| Foco inicial | Al abrir, el foco va a un elemento concreto: el input de búsqueda en el modal, el primer enlace del panel en el menú. Nunca al contenedor |
| Trampa | `Tab` en el último elemento vuelve al primero; `Shift+Tab` en el primero va al último. Se implementa con los índices de los elementos enfocables, no con `inert` |
| Background | Mientras está abierto, el resto de la página recibe `inert` (o al menos `overflow: hidden` en `body`) para que ni el scroll ni el clic lleguen debajo |
| Cierre por `Esc` | `keydown` en `document`, se cierra lo que esté abierto |
| Cierre por clic fuera | `click` con comprobación de contención: `if (!panel.contains(event.target)) close()` |
| Cierre por ✕ | El botón de cerrar, con `aria-label` |
| **Restauración** | Al cerrar, el foco **vuelve al elemento que abrió** el panel. Es el detalle que más se olvida y el que más molesta cuando falta |
| Animación | La hamburguesa rota 45° hasta quedar en ✕; el panel entra con `transform` + `opacity`. Con `prefers-reduced-motion: reduce`, se muestra y oculta sin transición |

Los dos paneles no pueden estar abiertos a la vez: abrir uno cierra el otro.
El atajo `Ctrl/⌘+K` abre el modal de búsqueda; si el menú móvil está abierto, lo
cierra primero.

### Estado 5 — Copia al portapapeles: efímero, con temporizador

| Pieza | Detalle |
|---|---|
| Disparador | `click` delegado sobre `[data-copy]`; el texto a copiar está en `data-copy` |
| Feedback | El botón pasa a "¡Copiado!" en `success` durante 2s, y se anuncia con `aria-live="polite"` |
| Estado | Una variable local al listener + un `setTimeout` guardado en `data-copy-timer` del nodo, para que un segundo clic reinicie el temporizador en lugar de acumular |
| Fallo | Si `navigator.clipboard` no existe o el permiso se deniega, se avisa con "No se pudo copiar" en `error`, se **muestra el texto en un input seleccionable** y no se rompe nada |

El temporizador va en el atributo del nodo y no en un `Map` module-scoped: así no
hay estado global que limpiarse.

---

## Reglas de actualización

| Regla | Detalle |
|---|---|
| **Una fuente de verdad por estado** | La URL para los filtros, `localStorage` para las preferencias, el atributo `hidden` para los paneles. Nunca dos cosas que puedan discrepar |
| **Un solo escritor** | Cada estado tiene exactamente un lugar del código que lo modifica. El tema se escribe en el toggle y en el script del `<head>`; ningún otro código lo toca |
| **El estado no vive en el `Layout`** | El header, el footer y los paneles están fuera del árbol de cada página: un estado compartido por props obligaría a pasarlo por todas las páginas |
| **El estado se deriva, no se copia** | El grid filtrado no se guarda en un array: se recalcula desde la URL |
| **Ninguna escritura sin `try/catch`** | `localStorage` puede lanzar. El sitio nunca muere por una preferencia |
| **El estado se limpia al cambiar de página** | Todo lo efímero (panel abierto, temporizador de copiado, texto del buscador) muere con el documento. Nada se arrastra entre páginas |
| **`prefers-reduced-motion: reduce` se respeta en el estado, no solo en el CSS** | Las transiciones del menú y del modal se desactivan; el estado (abierto/cerrado) no cambia |

### Consistencia entre grupos de tabs

Además de la sincronización descrita, hay un detalle de orden: la elección
persistida se aplica **antes** del primer pintado de los paneles, en el script
inline del `<head>`, igual que el tema. Si no, el usuario ve `npm` durante un
frame y luego cambia a `pnpm`. Se aplica por lo tanto con un atributo
`data-pm="pnpm"` en `<html>`, de la misma forma que el tema.

---

## Persistencia

### Claves

| Clave | Valores | Ámbito | Escritura | Lectura |
|---|---|---|---|---|
| `fwskills:theme` | `"light"` \| `"dark"` | Preferencia personal | Al pulsar el toggle | Script inline en `<head>` |
| `fwskills:pm` | `"npm"` \| `"pnpm"` \| `"yarn"` \| `"bun"` | Preferencia personal | Al pulsar un tab | Script inline en `<head>` |

Nada más se persiste. **No hay cookies**, porque no hay nada que consentir: no
hay analítica, ni telemetría, ni login, ni preferencias que puedan identificar a
nadie. El sitio no escribe ninguna otra clave en `localStorage`.

### Qué se comparte por URL

| Parámetro | Pantalla | Compartible |
|---|---|---|
| `?categoria=` | `/skills` | Sí |
| `?q=` | `/skills` | Sí |
| `?tag=` | `/skills` | Sí |
| `?sort=` | `/skills` | Sí |

Filtros sin equivalente en URL:

| Estado | Por qué no está en la URL |
|---|---|
| Modal de búsqueda abierto | Es un modo transitorio, no un lugar. Compartirlo no significa nada |
| Consulta del buscador | Es una sesión efímera: se descarta al salir. El buscador de skills sí es un modal, así que su consulta tampoco se persiste |
| Panel de acordeón abierto | Es una decisión de lectura, no un destino |
| Menú móvil abierto | Condición de interacción, no de navegación |

---

## `astro:after-swap` y transiciones de vista

### Decisión

**No usar `astro:transitions` / `<ClientRouter />` de forma global.**

Motivo: el sitio no necesita animaciones entre páginas, y el coste no es el
JavaScript de la librería —es que **rompe el modelo de estado de este
documento**. Con transiciones de vista, el documento se reemplaza sin recargar y
el JavaScript de la página anterior deja de estar enlazado.

Qué habría que rehacer:

| Módulo | Qué se rompería |
|---|---|
| `header.ts` | El listener de scroll y el de `keydown` dejan de estar vivos |
| `catalog-filters.ts` | Los listeners de `input` y `popstate` habría que volver a registrar |
| `package-manager.ts` | El listener único en `document` sobrevive, pero el estado aplicado al nuevo documento habría que reaplicar |
| `copy.ts` | Delegado en `document`: sobrevive al intercambio, porque el documento no se recrea |
| `theme.ts` | El atributo sobrevive, el estado del botón hay que reaplicar |
| Acordeón | Habría que reaplicar el `aria-expanded` de cada panel |

### Si se adoptan más adelante

El contrato es el mismo que usa la librería, y no se inventa nada:

| Evento | Responsabilidad |
|---|---|
| `astro:before-preparation` | Nada. Antes de la navegación todavía no hay cambio |
| `astro:after-swap` | Volver a enlazar **todos** los listeners DOM-dependent: scroll del header, menú móvil con su trampa de foco, filtros del catálogo, acordeones |
| `astro:page-load` | Sincronizar el estado que depende del DOM nuevo: botón de tema, tab activo, contador de resultados |
| `astro:before-swap` | Reiniciar temporizadores y cerrar cualquier panel abierto, para que nada quede a medio camino |

Y una regla que aplica tanto con transiciones como sin ellas: **los scripts
deben ser idempotentes**. Registrar un listener dos veces no es un error visible,
es un bug que se manifiesta como "el menú a veces no cierra". Con transiciones de
vista, cada listener se registra N veces —una por visita— y el fallo aparece en la
tercera navegación. Por eso el punto único de enganche (`src/scripts/index.ts`,
importado por el layout) es el lugar correcto para hacer ese trabajo una sola vez.

Si algún día se activan las transiciones, ese archivo es el único punto que
cambia: los módulos de comportamiento no necesitan enterarse.
