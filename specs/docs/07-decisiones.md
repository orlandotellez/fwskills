# 07 — Decisiones de arquitectura

Registro de decisiones arquitectónicas (ADR) de fwskills. Cada decisión declara su
contexto, la decisión adoptada, las alternativas consideradas y sus consecuencias,
incluidas las consecuencias incómodas. Un lector que dude de una decisión del código
debe empezar por aquí.

**Estado de las decisiones:** ADR-01 a ADR-07 aceptadas. Ninguna decisión de este
documento está en estado «propuesta» o «rechazada».

| ADR | Título | Estado |
| --- | --- | --- |
| ADR-01 | El CLI se documenta como módulo `backend/` | Aceptada |
| ADR-02 | Sin persistencia; `modules/db/` se omite | Aceptada |
| ADR-03 | Sin API pública; `modules/api/` se omite | Aceptada |
| ADR-04 | Documentación con Astro Starlight y puente de tokens | Aceptada |
| ADR-05 | Las colecciones de contenido de Astro son la fuente única del catálogo | Aceptada |
| ADR-06 | Monorepo con npm workspaces: `frontend/` y `cli/` en la raíz | Aceptada (ruta revisada) |
| ADR-07 | Modelo de tokens semánticos con modo claro y oscuro | Aceptada |

---

## ADR-01 — El paquete CLI `cli/` se especifica como módulo `backend/`

### Contexto

La plantilla de especificación que sigue este proyecto organiza el árbol en cuatro
módulos: `backend`, `db`, `frontend` y `api`. fwskills no tiene servidor: es un sitio
estático y un paquete de CLI. Aplicada de forma literal, la plantilla produce un
módulo `backend/` vacío, porque no existe ningún proceso que escuche peticiones.

Sin embargo, sí existe una cantidad sustancial de código que no es interfaz: la
resolución de rutas de skills, la lectura y validación de `SKILL.md`, la escritura de
archivos en el proyecto del usuario y las operaciones de git. Ese código es Node y
TypeScript, se ejecuta en la máquina del desarrollador y es propiedad del proyecto.

### Decisión

Se trata el CLI como el módulo `backend/`, implementado en `cli/`. El criterio
no es «¿hay un servidor?», sino **«¿es el código no-navegador que posee la lógica?»**.

Bajo este criterio, el módulo `backend/` es el conjunto de código Node/TypeScript del
proyecto: sistema de archivos, resolución del registro de skills y operaciones de git.
El nombre del módulo describe la frontera (fuera del navegador), no el protocolo de
transporte.

### Alternativas

- **Crear un backend real** (API HTTP en Node o serverless) para servir el catálogo o
  resolver skills. Rechazada: contradice la premisa de sitio 100 % estático, agrega
  una superficie de operación y de seguridad completa, y obligaría a mantener un
  servicio para datos que Git ya versiona.
- **Dejar `backend/` vacío y crear un módulo `tools/`.** Rechazada: `tools/` no está en
  la plantilla del árbol, lo que obliga a explicar una excepción de nomenclatura
  cuando el módulo `backend/` la resuelve con un criterio claro.
- **Colocar la lógica del CLI dentro de `frontend/`.** Rechazada: `frontend/` es el
  workspace del sitio; mezclar el paquete distribuible en npm con el sitio rompe la
  separación de publicaciones de ADR-06 y hace que el paquete del CLI arrastre
  dependencias de Astro.

### Consecuencias

- **Quien lea la especificación no debe esperar endpoints HTTP en `backend/`.** El
  módulo no expone API de ningún tipo.
- **El documento `03-api.md` del módulo `backend/` documenta la superficie de comandos
  del CLI** (los comandos, sus opciones y su salida), no rutas HTTP. Es el
  equivalente funcional de un documento de API para una herramienta de línea de
  comandos.
- **El contrato legible por máquinas es la ayuda del CLI** (`fwskills --help`) y los
  campos `exports` y `bin` del paquete npm. Cualquier cambio incompatible en ese
  contrato es un cambio mayor de versión.
- El criterio «código no-navegador» es reutilizable: si mañana existiera un script de
  generación de contenido que no pertenece al sitio, se ubicaría en `backend/` por la
  misma razón.

---

## ADR-02 — Sin persistencia; el módulo `modules/db/` se omite

### Contexto

fwskills es 100 % estático. No hay base de datos, ni backend, ni operaciones de
escritura. El catálogo —su contenido, su taxonomía y sus metadatos— ya está versionado
en el sistema de archivos del repositorio, dentro de `skills/**/SKILL.md`.

La plantilla del árbol de especificación incluye un módulo `db/`. Rellenarlo obligaría
a inventar un modelo de datos para algo que ya tiene uno, y ese modelo inventado
divergiría de la realidad en cuanto cambiara una skill.

### Decisión

**Se omite el módulo `modules/db/`.** La ausencia se registra de forma explícita en la
especificación en lugar de dejarse como un hueco silencioso.

El modelo de datos del proyecto **es el sistema de archivos**:

| Concepto | Representación |
| --- | --- |
| Conjunto de skills | Carpetas bajo `skills/` |
| Identidad de una skill | Su ruta: `skills/<categoría>/<slug>/SKILL.md` |
| Atributos de una skill | Los ocho campos del frontmatter |
| Categorías | Subcarpetas de primer nivel de `skills/` |

### Alternativas

- **Base de datos (SQLite u otra) versionada en el repositorio.** Rechazada: agregaría
  esquema, migraciones y un artefacto binario que no se puede revisar en un diff, para
  guardar datos que ya están en archivos de texto legibles.
- **Un índice JSON generado a partir de los archivos.** Rechazada como fuente de
  verdad: duplicaría el contenido y podría divergir. Como *artefacto de build* es
  aceptable, siempre que se genere desde los archivos y nunca se edite a mano.
- **La API de GitHub como fuente de verdad en runtime.** Rechazada: obliga al
  navegador a hacer peticiones de red, rompe la regla de cero JavaScript y somete la
  disponibilidad del sitio a los límites de tasa de una API externa.

### Consecuencias

- **No hay modelo de datos relacional, ni migraciones, ni ORM.** Ninguna tarea futura
  debe planejar un esquema de tablas: debe resolverse en build sobre las carpetas.
- **El sistema de archivos es la frontera de confianza del contenido.** Por eso el
  frontmatter se valida con esquema en build (ADR-05) y por eso una pull request es el
  mecanismo de revisión.
- **Consultas, filtros, ordenamientos y búsqueda se resuelven en tiempo de build.** No
  se necesita un índice en base de datos para nada.
- Si en el futuro un requisito genuino exigiera consultas, escritura concurrente o
  historial de cambios, eso sería un cambio de arquitectura y requeriría un ADR nuevo
  que reevalúe esta decisión. No se resuelve añadiendo un módulo `db/` en silencio.

---

## ADR-03 — Sin API pública; el módulo `modules/api/` se omite

### Contexto

No hay servidor en fwskills. Tampoco hay cliente móvil, ni integraciones con sistemas de
terceros, ni Consumidores externos que necesiten programmaticamente el catálogo. La
plantilla del árbol incluye un módulo `api/`; llenarlo obligaría a documentar una
superficie que no existe.

### Decisión

**Se omite el módulo `modules/api/`.** El único contrato legible por máquinas del
proyecto es:

1. La salida de ayuda del CLI (`fwskills --help` y la ayuda de cada comando).
2. Los campos `exports` y `bin` del paquete npm en `cli/package.json`.

No hay endpoints, ni rutas, ni versión de API, ni autenticación de API.

### Alternativas

- **API REST para consultar skills.** Rechazada: requiere un servidor o funciones
  serverless, con su operación, su coste y su superficie de seguridad, para serving de
  datos que ya son públicos y estáticos.
- **API GraphQL.** Rechazada por la misma razón, con más superficie todavía.
- **Un endpoint JSON público generado en build para que el CLI lo consulte.**
  Rechazada: convertiría un artefacto del sitio en una dependencia de red del CLI.
  Cuando un cliente necesita datos, puede leer el repositorio o el paquete.

### Consecuencias

- **`modules/api/` no se crea, y su ausencia está justificada**, no olvidada.
- **Si alguna vez se publica un índice JSON como artefacto del sitio**, sigue siendo un
  archivo estático del sitio, no un módulo de API: no se versiona su contrato ni se
  documentan rutas.
- La documentación de la superficie programática del CLI vive en
  `modules/backend/03-api.md`, según ADR-01.
- Al no haber API, no hay política de versionado de API ni contrato de deprecación que
  mantener. El versionado del CLI sigue la semver habitual de npm.

---

## ADR-04 — La documentación se construye con Astro Starlight, con puente de tokens

### Contexto

El proyecto necesita un sitio de documentación multipágina con: barra lateral, tabla de
contenidos fija con *scrollspy*, navegación anterior/siguiente, enlaces de edición en
GitHub, búsqueda activada con `Ctrl`/`⌘+K`, cajón de navegación móvil y modo
claro/oscuro.

Al mismo tiempo, **todas las páginas del proyecto deben compartir el mismo encabezado,
pie y sistema de diseño** que la landing y el catálogo.

Estas dos exigencias se tensan. La documentación hereda estructura de una librería,
pero la identidad visual del sitio es propia.

### Decisión

**Starlight aporta la estructura y la búsqueda; un puente de CSS aporta la identidad
visual.**

En concreto:

- **Starlight** se usa por su estructura y funcionalidad: barra lateral, *scrollspy*,
  anterior/siguiente, búsqueda, cajón móvil, conmutador de tema y su índice.
- **Un puente de tokens** mapea las custom properties de Starlight sobre los tokens
  semánticos del proyecto definidos en `02-design.md` de `modules/frontend/`. Es decir:
  Starlight no define su propia paleta; consume la del sitio.
- **Componentes personalizados** para los elementos que el proyecto necesita y
  Starlight no resuelve: *callouts*, pestañas de gestor de paquetes y bloques de código
  con título de archivo.
- **Un espacio de encabezado personalizado** (*header slot*) para inyectar la
  navegación del sitio, de modo que el encabezado y el pie sean los mismos en la
  landing, el catálogo y la documentación.

### Alternativas

- **Páginas de documentación propias sobre colecciones de contenido.** Da control
  visual total, pero obliga a reconstruir desde cero la barra lateral, la tabla de
  contenidos, el *scrollspy*, el cajón móvil, la búsqueda y la accesibilidad asociada.
  Es un segundo sitio de documentación escrito a mano, con su propio presupuesto de
  mantenimiento.
- **Starlight sin tocar.** Aporta toda la funcionalidad sin esfuerzo, pero trae su
  propio encabezado y su propio lenguaje visual, que pelean directamente con el
  requisito de consistencia visual. El sitio terminaría con dos identidades.
- **Wiki externa (por ejemplo, la de GitHub).** Rompe la exigencia de que la
  documentación forme parte del mismo sitio, del mismo build y del mismo sistema de
  diseño; además obliga al lector a saltar de dominio.

### Consecuencias

- **La hoja de puente de tokens es un requisito duro de esta decisión.** Si se omite,
  la documentación se ve visiblemente distinta del resto del sitio y se incumple el
  requisito de consistencia. No es una mejora opcional ni un refinamiento posterior:
  es parte de la decisión.
- **Existe una dependencia de las custom properties de Starlight.** Una actualización
  mayor de Starlight puede renombrarlas y romper el puente. Debe comprobarse en cada
  actualización, y el fallo se detecta en revisión visual, no en el compilador.
- **La documentación es la única parte del sitio que envía JavaScript** al navegador
  (búsqueda y conmutador de tema). El presupuesto de rendimiento de
  `05-requisitos-no-funcionales.md` se aplica de forma estricta al resto de las páginas.
- Se acepta una dependencia de framework para la documentación a cambio de no mantener
  a mano *scrollspy*, buscador y navegación accesible.
- El *header slot* es el mecanismo que garantiza un único encabezado en todo el sitio.
  Si se añade un elemento de navegación, se añade ahí, no en una plantilla de Starlight.

---

## ADR-05 — Las colecciones de contenido de Astro son la fuente única del catálogo

### Contexto

El requisito central del proyecto es que **agregar una skill o una categoría no requiere
editar el frontend**. Cualquier diseño que obligue a tocar código para publicar
contenido contradice la premisa, y en un proyecto comunitario sin equipo central de
curación ese costo se paga en cada contribución.

Además, los datos de la landing deben ser consistentes con los del catálogo: la misma
skill no puede verse de una manera en la portada y de otra en su página de detalle.

### Decisión

**Una colección de contenido `skills`, con esquema Zod que valida los ocho campos de
frontmatter, es la fuente única de verdad.**

De ella se derivan, sin excepciones:

- La página de catálogo.
- Las páginas de detalle `/skills/[categoria]/[slug]`.
- Las páginas de categoría.
- El índice de búsqueda.
- El `sitemap.xml`.
- Las páginas de categoría de la documentación.

El esquema valida exactamente los ocho campos declarados: `name`, `description`,
`category`, `version`, `author`, `tags`, `compatibility` y `featured`.

### Alternativas

- **Catálogo escrito como un array de TypeScript en el frontend.** Descartada: cada
  skill nueva exigiría modificar código, exactamente lo que el requisito prohíbe.
- **Páginas MDX escritas a mano, una por skill.** Descartada: obliga a crear un archivo
  de código por cada skill y a mantener rutas duplicadas en un archivo central.
- **Leer el sistema de archivos en runtime.** Descartada: el sitio es estático; no
  existe runtime donde leer. Además, obligaría a enviar JavaScript al navegador.

### Consecuencias

- **Una `SKILL.md` mal formada rompe el build.** Es el comportamiento buscado: la
  validación es automática y sustituye, en parte, a la revisión manual. El mensaje de
  error debe nombrar el archivo y el campo que falla.
- **Una categoría nueva no requiere cambio de código en el catálogo.** Las páginas se
  generan desde las carpetas.
- **Una categoría nueva sí requiere una entrada en un mapa de metadatos** para su
  ícono y su descripción. Es el único punto donde agregar una categoría toca código, y
  es deliberado: son datos de presentación, no de contenido.
- **La invariante es verificable en revisión:** si una pull request que agrega una
  skill modifica `frontend/`, está mal planteada.
- El esquema Zod es el contrato de datos del proyecto. Cambiarlo afecta a todo el
  contenido existente y requiere migración de las `SKILL.md` afectadas.
- La consistencia entre landing, catálogo, detalle y `sitemap.xml` es una consecuencia
  de esta decisión, no un esfuerzo adicional: todos leen la misma colección.

---

## ADR-06 — Monorepo con npm workspaces

### Contexto

Un único repositorio publica dos artefactos que deben versionarse juntos: un sitio
estático y un paquete de npm. El comando de instalación
(`npx fwskills add <skill>`) y la documentación del sitio describen la misma versión
del catálogo. Si viven en repositorios separados, cada publicación puede quedar
desalineada respecto de la otra.

### Decisión

**Monorepo con npm workspaces en la raíz.** Workspaces declarados: `frontend/` y
`cli/`, ambos en el nivel raíz. Un único `package-lock.json` en la raíz. El paquete
del CLI conserva su versionado independiente dentro del monorepo.

`skills/` **no** es un workspace: es contenido versionado, sin `package.json`, y no
participa del `npm install`.

#### Por qué `cli/` y no `packages/cli/`

La primera redacción de esta decisión decía `packages/cli/`. Se cambió a `cli/` en
la raíz, y la razón es que **`packages/` no se gana un nivel con un solo paquete
publicable**:

- El sitio está declarado `private: true` y nunca se publica en npm. El único
  artefacto que sale es el CLI, así que `packages/` contendría un único
  directorio que puede vivir en la raíz sin nada que perder.
- **`frontend/` y `cli/` en la raíz son simétricos**: dos workspaces, misma
  profundidad, declarados igual. Con `frontend/` en la raíz y `packages/cli/`
  anidado, el repo queda asimétrico sin que la asimetría signifique nada.
- `skills/` ya está en la raíz, y es el origen de datos del CLI. Anidarlo dos
  niveles lo aleja visualmente de lo que consume.
- Ninguna herramienta exige `packages/`: npm y bun workspaces, Vite, los
  deploys, ninguno mira la ruta. Se declara en `workspaces` y listo.
- Si en el futuro aparece un segundo o tercer paquete publicable, mudarse a
  `packages/` es un cambio de una entrada de `workspaces` más un `sed`. Al revés,
  retrofitear es lo costoso.

Mover también el sitio a `packages/site/` sí haría simétrica la alternativa
"ambos dentro de `packages/`", pero se descartó: `frontend/` es la ruta base del
glob loader que lee `skills/`, aparece en el `tsconfig`, en la base del enlace
"Editar esta página" de la documentación y en los deploys. Ese rename cuesta más
que la simetría que compra.

### Alternativas

- **Dos repositorios (sitio y CLI).** Descartada: rompe las publicaciones atómicas de
  documentación y CLI. Podría ocurrir que la documentación anuncie una skill que el CLI
  publicado aún no puede instalar, que es el fallo exacto que el monorepo evita.
- **pnpm workspaces.** Descartada: agrega una herramienta a la cadena de herramientas
  sin ganancia en este tamaño de proyecto. El requisito de Node (`>=22.12.0`) ya
  implica npm disponible.
- **Yarn o Bun workspaces.** Descartada por el mismo motivo.
- **Un solo paquete que contenga sitio y CLI.** Descartada: el sitio no se publica en
  npm y arrastraría dependencias de Astro al paquete que el usuario instala con `npx`.

### Consecuencias

- **El `package.json` raíz debe declarar `workspaces`.** Sin él, el monorepo no
  resuelve dependencias ni ofrece `npm run <script> -w <workspace>`.
- **Una única instalación cubre todo:** `npm install` en la raíz, un solo lockfile, una
  sola resolución de versiones transitivas.
- **La documentación de `03-ejecucion-local.md` debe mantenerse al día** respecto del
  estado real: hoy los comandos se ejecutan desde `frontend/`, y pasarán a ejecutarse
  desde la raíz cuando se cree el workspace.
- **Hay una colisión de nombres que resolver al momento de crear `cli/`:**
  `frontend/package.json` ya se llama `fwskills`, y npm rechaza dos workspaces con el
  mismo nombre (`EDUPLICATEWORKSPACE`). Como el paquete publicado debe invocarse
  `npx fwskills`, el workspace del sitio debe adoptar un nombre distinto —por
  ejemplo `@fwskills/site`— y declararse `private`. Se resuelve en el mismo commit que
  introduce el workspace del CLI.
- Cada workspace mantiene su propio `version`, lo que permite publicar el CLI con
  independencia del sitio.

---

## ADR-07 — Modelo de tokens semánticos, con modo claro y modo oscuro

### Contexto

El bloque `<style is:global>` de `frontend/src/layouts/Layout.astro` (~372 líneas)
declara hoy los design tokens en `:root`. Ese modelo tiene dos defectos:

**Los nombres están atados a la apariencia y además mienten.** Por ejemplo, en el
archivo actual `--primary` vale `#04092e` y `--primary-dark` vale `#8aa2ff`: el token
llamado «dark» es más claro que el token llamado «primary». Nombres como
`--primary-dark`, `--primary-light`, `--bg-card`, `--cta-bg` y `--footer-bg` describen
el color o el contexto en lugar de la función, de modo que cualquier cambio de paleta
obliga a revisar los nombres y un nombre desactualizado sigue siendo válido para
 siempre.

**No hay modo claro.** `:root` define una sola paleta, oscura. No se puede ofrecer un
tema claro sin duplicar CSS con selectores ad hoc, lo que garantiza divergencia entre
la landing, el catálogo y la documentación.

El proyecto necesita un modo claro y un modo oscuro con la misma definición de roles, y
que Starlight pueda consumir (ADR-04).

### Decisión

**Migrar a un modelo de tokens semánticos con dos modos.**

Los tokens de color se redefinen por rol:

`base`, `surface`, `surface-elevated`, `border`, `border-strong`, `border-input`,
`text`, `text-secondary`, `text-muted`, `accent`, `accent-hover`, `success`, `warning`,
`error`, `on-accent`.

Cada conjunto se define **una vez por modo**, activado por un atributo `data-theme`
sobre `:root`, con `prefers-color-scheme` como valor inicial cuando el usuario no ha
expresado preferencia.

**Los tokens de escala no cambian de nombre.** `--space-*`, `--radius-*`, `--text-xs` a
`--text-5xl`, `--font-*`, `--max-width` y `--header-height` ya describen escala y no
apariencia, por lo que son correctos y se conservan. La excepción a revisar es
`--shadow-*`: las sombras actuales están calculadas para el fondo oscuro y necesitan
valores por modo.

**Los valores verificados exactos de cada token, en cada modo, viven en
`modules/frontend/02-design.md`.** Este documento no los repite: repetir una tabla de
valores en dos lugares garantiza que se desincronicen.

### Alternativas

- **Corregir solo los nombres engañosos** (`--primary-dark` → algo más exacto) y
  mantener el modelo por apariencia. Descartada: corrige el síntoma sin resolver el
  problema de fondo, que es la dependencia del nombre respecto del color.
- **Tokens por componente** (`--hero-title-color`, `--footer-text`). Descartada:
  multiplica los tokens y hace imposible un cambio de tema coherente; cada elemento
  tendría su propio valor por modo.
- **Mantener `:root` con una sola paleta y duplicar estilos con selectores de tema.**
  Descartada: garantiza divergencia entre páginas y no es extensible a Starlight.
- **Biblioteca de tokens externa (por ejemplo, un preset de Tailwind u otro).**
  Descartada: la paleta actual es específica del proyecto y los tokens necesitan ser
  puenteados hacia Starlight de cualquier forma; una dependencia adicional no aporta
  nada aquí.

### Consecuencias

- **La migración se hace en una sola pasada:** todo componente que referencie los
  nombres antiguos se actualiza a la vez. Una migración parcial deja el sitio con
  colores sin definir, que es peor que no migrar.
- **Contraste verificado:** `text-muted` está verificado a una relación mínima de
  **4.72:1**, por lo que cumple WCAG 2.1 AA y puede usarse en texto de cuerpo, pero no
  para nada por debajo de 13px, donde la legibilidad deja de ser suficiente.
- **Un componente nunca decide el tema:** consume `var(--accent)` y quien resuelve el
  tema es `data-theme` sobre `:root`. Esto hace que el conmutador de tema y
  `prefers-color-scheme` funcionen sin lógica por página.
- **El puente de tokens de ADR-04 mapea sobre estos mismos roles.** El orden importa:
  primero la migración de tokens, después el puente de Starlight. Invertirlo produce un
  puente que hay que reescribir.
- **Cambiar un color de marca pasa a ser una edición en un solo lugar**, en lugar de
  una búsqueda entre todos los componentes.
- Los tokens de escala se conservan, pero las sombras requieren definición por modo.
  Es parte del trabajo de migración, no una excepción posterior.
