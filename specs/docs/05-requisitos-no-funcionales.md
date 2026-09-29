# 05 — Requisitos no funcionales

Los objetivos de este documento son verificables. Cada uno declara cómo se mide, no
solo qué se quiere. Cuando un objetivo no se cumple, se registra como defecto; no se
redefine la métrica para que el número quede bien.

## Rendimiento

### Presupuesto de JavaScript

**Objetivo: cero JavaScript enviado al navegador en la landing y en el catálogo.**

Las páginas públicas no requieren interactividad: no usan directivas `client:*`. La
única excepción prevista es la sección de documentación, donde la búsqueda con
`Ctrl`/`⌘+K` y el conmutador de tema sí necesitan código (ADR-04). Ese JavaScript
**queda confinado a `/docs/**` y no se extiende a las páginas públicas**.

Cualquier incorporación de JavaScript en la landing debe justificarse en la pull
request con la medida de su costo en KB comprimidos.

### Presupuesto de peso

| Métrica | Objetivo |
| --- | --- |
| HTML + CSS comprimidos por página | < 100 KB |
| JavaScript por página pública | 0 KB |
| JavaScript en páginas de documentación | Se mide y se reporta en la pull request; sin techo fijo hasta tener la primera medición real |
| Solicitudes de red por página | Sin fuentes de terceros ni peticiones a APIs externas en runtime |

### Core Web Vitals

Medidos sobre el build de producción servido con `npm run preview`, no sobre el
servidor de desarrollo:

| Métrica | Objetivo |
| --- | --- |
| LCP (Largest Contentful Paint) | < 2.5 s |
| INP (Interaction to Next Paint) | < 200 ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| TTFB | < 600 ms |

### Lighthouse

**Objetivo: Lighthouse >= 95 en las cuatro categorías** —Performance, Accessibility,
Best Practices y SEO— sobre el build de producción, con emulación móvil.

Lighthouse se ejecuta contra `npm run preview`, no contra `npm run dev`: el servidor de
desarrollo sirve JavaScript adicional y no representa lo que se despliega.

### Fuentes y recursos

- No hay peticiones de fuentes web de terceros. El token `--font-heading` referencia
  `'Inter'` seguido de la pila de fuentes del sistema (`system-ui`, `-apple-system`,
  `Segoe UI`, `sans-serif`); como no existe ninguna regla `@font-face` ni enlace a un
  proveedor de fuentes en el árbol actual, la pila resuelve a las fuentes del sistema.
  Si se incorpora una fuente propia, debe ir autoalojada, con `font-display: swap` y
  `preload` de la variante crítica.
- Los íconos provienen de `lucide-astro` (`^0.556.0`) y se generan como SVG en el HTML:
  no hay peticiones de imagen para iconografía.
- Todo recurso estático se sirve con `cache-control: long-lived` e inmutable cuando su
  nombre incluye un hash de contenido.

### Imágenes

Las imágenes que se agreguen al sitio deben tener sus dimensiones declaradas
explícitamente para evitar desplazamiento de maquetación, deben estar en formatos
modernos y deben servirse con `loading="lazy"` salvo la imagen de portada.

## Accesibilidad

**Objetivo: conformidad con WCAG 2.1, nivel AA, en todas las páginas del sitio**, tanto
las públicas como la documentación. La categoría Accesibilidad de Lighthouse debe
superar 95 en el mismo build que el resto de categorías.

### Contraste

| Elemento | Contraste mínimo |
| --- | --- |
| Texto normal | 4.5:1 |
| Texto grande (>= 24px, o >= 18.66px en negrita) | 3:1 |
| Bordes de componentes de interfaz y estados | 3:1 |
| Anillo de foco visible | 3:1 frente al fondo adyacente |

`text-muted` está verificado a una relación de **4.72:1**, por lo que cumple AA para
texto de cuerpo, pero **no debe usarse por debajo de 13px**, donde el tamaño deja de ser
legible con suficiente comodidad. Los tokens de cada modo y sus relaciones verificadas
constan en `modules/frontend/02-design.md`.

### Navegación por teclado

- **La navegación debe ser completa por teclado.** Toda la funcionalidad del sitio
  debe ser alcanzable y operable sin ratón, incluidos el menú de la sección `Header`,
  el cajón móvil de la documentación y el conmutador de tema.
- **El foco siempre es visible** y mantiene un contraste de al menos 3:1. No se elimina
  el contorno de foco sin sustituirlo por un indicador equivalente.
- **El orden de tabulación sigue el orden visual.** Un `tabindex` positivo es
  inaceptable: rompe la correspondencia entre lo que se ve y lo que se recorre.
- El menú desplegable expone `aria-expanded` y `aria-controls`; el cajón móvil atrapa y
  devuelve el foco al cerrarse.
- Existe un enlace de salto al contenido principal para no recorrer la navegación
  completa en cada visita.

### Estructura y semántica

- Un único elemento `<main>` por página y un solo `h1`, con la jerarquía de encabezados
  sin saltos.
- Las secciones del sitio usan puntos de referencia (`header`, `main`, `footer`, `nav`)
  correctamente nombrados.
- Los iconos decorativos llevan `aria-hidden="true"` y no son anunciados por lectores
  de pantalla; los que funcionan como control, van dentro de un botón con texto
  accesible.

### Movimiento reducido

- **`prefers-reduced-motion` se respeta en todo el sitio.** Ya existe un bloque
  `prefers-reduced-motion` en el `<style is:global>` de `Layout.astro`; toda animación,
  transición o desplazamiento suave nueva debe quedar neutralizada por ese bloque.
- **Punto de atención concreto:** `Layout.astro` aplica hoy
  `scroll-behavior: smooth` al elemento `html`. Ese desplazamiento debe desactivarse
  dentro del bloque de movimiento reducido; de lo contrario, la transición de scroll de
  la página se mantiene en un sitio que declara lo contrario.
- No se agrega ninguna animación que no pueda desactivarse por completo con esa
  preferencia del sistema.

### Áreas táctiles e interacción

- Los objetivos interactivos tienen un área mínima de **44 × 44 píxeles CSS**.
- El contenido es utilizable con zoom al 200 % sin desplazamiento horizontal.
- El hover nunca es el único indicador de un estado: cada estado tiene su equivalente en
  `:focus-visible`.

### Verificación

- Lighthouse sobre `npm run preview` en cada publicación.
- Auditoría manual de navegación por teclado en toda pull request que toque
  navegación, estilos o el sistema de diseño.
- Automatizado de accesibilidad (axe o equivalente) declarado como brecha pendiente en
  `03-ejecucion-local.md`: hoy la verificación es manual.

## Seguridad

### Superficie de ataque

**El proyecto no tiene servidor.** La superficie de ataque de la parte web es la de
cualquier sitio estático: el navegador del visitante y el hosting de archivos. No
existen autenticación, sesiones, cookies de sesión, endpoints, ni superficie de
inyección de SQL porque no hay ni un componente de ese tipo.

| Vector | Estado |
| --- | --- |
| Inyección de SQL | No aplica: no hay base de datos. |
| Autenticación y gestión de sesiones | No existe por decisión. |
| Ejecución de código en el servidor | No aplica: no hay servidor. |
| Variables de entorno secretas | No hay secretos. Solo `PUBLIC_*`, que por definición son públicas. |
| CSRF | No aplica: no hay peticiones con efecto. |
| Inyección de contenido en el build | El contenido proviene de `SKILL.md` versionados, revisados por pull request. |

### Requisitos obligatorios

- **CSP.** Se define una `Content-Security-Policy` que no requiera `unsafe-inline` para
  estilos. Los scripts de la documentación se cargan como archivos propios, no
  inyectados.
- **Enlaces externos** con `rel="noopener noreferrer"` cuando apunten a otro origen.
- **Canonical y `sitemap.xml`** derivados de `PUBLIC_SITE_URL`. Este es un punto
  delicado: el valor por defecto `https://example.com` produce un sitio publicado con
  canónicas equivocadas y sin error visible. El pipeline de publicación debe exportar
  `PUBLIC_SITE_URL` de forma explícita.
- **Sin recursos de terceros** que filtren al visitante: no hay analítica, ni píxeles,
  ni fuentes externas, ni scripts incrustados.
- **Sin telemetría.** Es un requisito, no una omisión.

### El CLI como superficie de riesgo

`npx fwskills add <skill>` se ejecuta en la máquina del desarrollador, con los permisos
de ese usuario. Eso merece un apartado propio:

- **No sobrescribir archivos existentes sin confirmación explícita.** El CLI informa
  qué archivos va a escribir y cuál ya existen.
- **Validar `SKILL.md` antes de instalar.** Frontmatter con los ocho campos; si no
  cumple, la instalación falla con un mensaje que nombre el campo problemático.
- **No ejecutar código durante la instalación.** Copiar contenido no es ejecutar
  contenido. Si una futura versión de una skill trae ejecutables, esa es una decisión
  que requiere su propio ADR.
- **Rutas confinadas al directorio del proyecto.** El CLI no escribe fuera del proyecto
  del usuario ni en rutas del sistema.
- **Sin telemetría ni acceso a la red no indispensable.** El CLI no envía datos de uso.

## Escalabilidad

### Escala de contenido

El número de skills no es una restricción de diseño. El catálogo se genera desde
colecciones de contenido: agregar una skill agrega su página de detalle, su entrada en
el catálogo, su entrada en el índice de búsqueda y su entrada en el `sitemap.xml`, sin
cambios de código. El costo por skill es trabajo de build lineal, no trabajo de
mantenimiento.

### Datos dinámicos

Los datos que varían con el tiempo (estrellas, colaboradores, releases, fecha de
última actualización) se resuelven en build:

- **Degradación con rescate.** Si la fuente externa falla o se degrada durante el
  build, se usa el último valor conocido. **Un fallo de la API externa nunca rompe la
  compilación.**
- **La frecuencia de actualización del sitio la determina la frecuencia de los builds**,
  no un proceso en segundo plano.
- Si la consulta a la fuente externa se realiza una sola vez por compilación y se
  comparte entre todas las páginas, el costo no crece con el número de skills.

### Búsqueda

La búsqueda es un índice generado en build, no un servicio. Su costo es proporcional al
número de páginas generadas y no requiere mantenimiento operativo.

## Disponibilidad

- **La disponibilidad la garantiza el hosting, no el proyecto.** La salida es
  estática: sirve en Vercel, Netlify, Cloudflare Pages o cualquier hosting de archivos.
  No hay proceso que pueda caerse, memoria que agotar ni cola que saturar.
- **Objetivo de disponibilidad: 99.9 % o superior**, heredado del proveedor de
  hosting.
- **Un build reproducible es un requisito de disponibilidad.** Dos compilaciones del
  mismo commit producen el mismo sitio, sin datos horarios embebidos.
- **El build es la única parte frágil del sistema**, porque depende de la red para
  resolver datos dinámicos. Por eso el requisito de degradación con rescate es firme:
  un build que falla por una API externa deja el sitio sin publicar, y eso sí es una
  caída para el usuario.
- **Verificación automatizada antes de publicar.** El build, la comprobación de tipos y
  Lighthouse deben ejecutarse antes del despliegue, no después. El repositorio no
  tiene hoy configuración de integración continua: es una brecha declarada en
  `03-ejecucion-local.md` y una de las primeras tareas de infraestructura.

## Mantenibilidad

### Sistema de diseño en un solo lugar

- **Los tokens viven en un único archivo:** el `<style is:global>` de
  `src/layouts/Layout.astro`. Cambiar el color de acento o la escala tipográfica es una
  edición en un punto, no una búsqueda en todos los componentes.
- **Tokens por rol, con los dos modos definidos** (ADR-07): los nombres actuales
  atados a la apariencia se migran a `base`, `surface`, `surface-elevated`, `border`,
  `border-strong`, `border-input`, `text`, `text-secondary`, `text-muted`, `accent`,
  `accent-hover`, `success`, `warning`, `error` y `on-accent`, definidos una vez por
  modo y activados con `data-theme`, con `prefers-color-scheme` como valor por defecto.
  Los valores exactos verificados se documentan en `modules/frontend/02-design.md`.
- **Ningún componente define un color literal.** Un valor hexadecimal fuera del bloque
  de tokens es un defecto de revisión, no una excepción.

### Una sola fuente de verdad

- **El contenido del catálogo es el sistema de archivos** (ADR-02). El esquema Zod de
  la colección `skills` valida los ocho campos de frontmatter (ADR-05).
- **El build es el gate de calidad.** Una `SKILL.md` mal formada no se publica: falla
  la compilación. Esto reduce la dependencia de revisión manual, que es crítico en un
  proyecto sin equipo central de curación.
- **La invariante «agregar contenido no es un cambio de código» se verifica en revisión.**
  Si una pull request que agrega una skill modifica `frontend/`, algo se rompió.

### Estructura y ownership

- **Cada módulo tiene una responsabilidad única.** `frontend/` es el sitio,
  `packages/cli/` es la lógica de Node, `skills/` es contenido, `specs/` es la
  especificación. Un archivo nuevo que no encaje en ninguna de ellas es una señal de
  que falta un módulo o de que el archivo está en el lugar equivocado.
- **Workspaces con un solo lockfile** (ADR-06): el sitio y el CLI se versionan juntos y
  se despliegan de forma coherente.

### Deuda técnica declarada

- **Sin suite de pruebas ni linter.** El sitio no tiene JavaScript en runtime que lo
  justifique hoy; el CLI sí lo tendrá. La mitigación inmediata es la verificación de
  tipos con `astro check` y el build, y la solución, `node:test` al introducir el CLI
  (`03-ejecucion-local.md`).
- **Sin integración continua.** Hoy la verificación depende de que alguien la ejecute.
- **Tokens sin modo claro.** La migración a light/dark (ADR-07) es trabajo pendiente:
  el bloque `:root` actual solo define el modo oscuro.

### Sin persistencia

**El proyecto no tiene persistencia, y `modules/db/` está omitido de la especificación
de forma intencional (ADR-02).**

No existe base de datos, ni esquema, ni migraciones, ni ORM, ni caché en base de datos.
La ausencia del módulo no es un hueco pendiente de completar: es la representación
correcta de un sistema cuyo dato ya está versionado.

El «modelo de datos» del catálogo es el sistema de archivos:

- El conjunto de skills es el conjunto de carpetas bajo `skills/`.
- La identidad de una skill es su ruta (`skills/<categoría>/<slug>/SKILL.md`).
- Los atributos de una skill son los ocho campos de su frontmatter.
- Las categorías son las subcarpetas de primer nivel de `skills/`.

Cualquier necesidad de consulta, filtro o búsqueda se resuelve en build sobre esas
carpetas. Si en el futuro apareciera un requisito que genuinely necesita consultas,
ordenamiento o escritura concurrente, eso sería un cambio de arquitectura y requeriría
un ADR nuevo que reevalúe ADR-02; no se resuelve por la vía de un módulo `db/`
añadido en silencio.
