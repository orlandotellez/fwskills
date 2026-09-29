# Tareas de implementación

Este directorio es la **única fuente de trabajo de implementación** de fwskills.
Cada archivo es un área de funcionalidad con una lista de tareas y una lista de
criterios de terminación. La especificación de `specs/docs/` y `specs/modules/`
define **qué** es el sistema; este directorio define **en qué orden se construye**.

## Cómo se usan y se actualizan estas listas

| Regla | Detalle |
|---|---|
| El progreso se registra marcando las casillas **en el mismo archivo** | `- [ ]` pasa a `- [x]`. No hay un tablero externo, ni un archivo de estado, ni un número en otro sitio. El archivo de tareas es el registro. |
| Un archivo de tarea **nunca se borra ni se renombra** | Si un área crece, se le añaden tareas. Si un área se completa, el archivo queda con todas las casillas marcadas y se conserva como registro de lo que se hizo. Un enlace a una tarea que ya no existe es un enlace roto. |
| Una tarea se marca cuando su **criterio de Done** está cumplido, no cuando el código está escrito | Ver "Qué es un criterio de Done bueno" más abajo. |
| El número de la casilla es el **orden de ejecución**, no el identificador | Ver la sección siguiente. |
| Una tarea que se descubre durante la ejecución se **añade** al archivo del área correspondiente, con el número siguiente disponible | No se reescribe el histórico de números ya marcados. |
| Los archivos de `specs/modules/` y `specs/docs/` **no se editan desde aquí** | Si una tarea revela que una especificación está mal, se corrige la especificación en su propio pass. Este directorio no replica ni reinterpreta la especificación: se apoya en ella. |

## El número es el orden de ejecución

Cada tarea raíz es una casilla numerada:

```markdown
- [ ] 3. Sustituir el bloque `:root` por tokens semánticos
  - Detalle de implementación: `frontend/src/styles/tokens.css`, bloque `:root` con los 15 roles
```

El número significa tres cosas concretas:

1. **Se puede hacer en ese orden sin romper lo anterior.** Las tareas están
   ordenadas por dependencia, no por dificultad. Una tarea que necesita una
   anterior aparece después.
2. **Alguien puede ejecutar un subconjunto contiguo.** Si una persona toma las
   tareas 1 a 4, obtiene un resultado coherente y revisable. Si toma la 7 sin la 5,
   obtiene un sitio sin contraste.
3. **Una revisión puede detenerse en un número.** Unrangue de tareas es una
   unidad de revisión coherente.

Los subpuntos con `  - Detalle de implementación:` no llevan número: son la
condición concreta que hace verificable la tarea, no pasos adicionales del plan.
Si un detalle necesita más de una línea, sigue siendo el mismo paso.

## Qué es un criterio de Done bueno

Un criterio de Done es una afirmación que **otra persona puede comprobar sin
preguntar nada**. La prueba es sencilla: si para verificarlo hay que abrir el
código y razonar sobre si está bien, el criterio está mal escrito.

| Criterio débil | Criterio fuerte |
|---|---|
| "El contraste mejora" | "`.btn-primary:hover` mide 8.24:1 en los dos temas, calculado con la fórmula WCAG 2.1, y el valor medido aparece en `modules/frontend/02-design.md`" |
| "El catálogo filtra" | "`/skills?q=spec` deja visibles solo las tarjetas cuya `name` o `description` normalizada contiene `spec`, y `?q=` aparece en la barra de direcciones" |
| "El CLI es utilizable" | "`npx fwskills add no-existe/xyz` sale con código 3 y escribe el mensaje en stderr, con stdout vacío" |
| "Se documenta" | "`/docs/cli/add.md` documenta la sintaxis, los 5 flags aplicables, 2 ejemplos y la tabla de códigos de salida" |

Tres reglas adicionales:

- **Un criterio se cierra con un comando o con una lectura de artefacto.** Un
  comando (`npm run check`, `npx fwskills add ... --dry-run`), una aserción de
  prueba, o un archivo generado cuyo contenido se puede inspeccionar
  (`dist/sitemap.xml`, `npm pack --dry-run`).
- **Un criterio de seguridad nombra el caso malicioso.** "Rechaza
  `specs/../../etc`" es un criterio; "valida la entrada" no lo es.
- **Un criterio de accesibilidad nombra el requisito WCAG o el ratio.** "El hover
  es accesible" no es un criterio; "2.42:1 hoy, 8.24:1 después" sí.

## Cómo se abre una tarea que atraviesa módulos

fwskills tiene dos workspaces con código: el sitio (`frontend/`) y el CLI
(`packages/cli/`), más el contenido (`skills/`) y la especificación (`specs/`).
Un cambio que los toca se documenta en **varios archivos**, nunca en uno solo
monstruoso.

La convención es:

1. **Una tarea raíz por archivo, y cada archivo tiene un solo dueño.** La tarea
   raíz se escribe en el archivo del módulo donde vive el comportamiento
   principal. "El comando `add` valida el frontmatter" es del módulo `backend/`.
2. **El efecto secundario se declara como subpunto de tarea, con su archivo.**
   Si `backend/05-validacion-de-skills.md` implementa `npm run validate`, su tarea
   incluye la nota de que `frontend/package.json` declara ese script, para que
   quien ejecute desde el sitio sepa que también lo tiene.
3. **Una dependencia entre archivos se nombra por su ruta, no se asume.** Si
   `frontend/08-docs-starlight.md` necesita los tokens de
   `frontend/01-sistema-de-diseno.md`, su criterio de Done incluye "el puente
   mapea sobre los nombres de rol de `frontend/01`, no sobre los antiguos".
4. **Una tarea que necesita una decisión arquitectónica no se ejecuta primero.**
   Si aparece una decisión estructural nueva, se registra como ADR en
   `specs/docs/07-decisiones.md` y la tarea queda bloqueada hasta que exista.
5. **El contenido (`skills/`) no genera tareas de código.** Publicar una skill es
   añadir una carpeta. Si una skill obliga a tocar `frontend/`, la tarea está mal
   planteada: contradice ADR-05.

## Trazabilidad de los defectos verificados

Siete defectos medidos en el código actual. Cada uno tiene tarea propia con el
número medido en el enunciado, para que la casilla carregue prueba y no una
afirmación.

| Defecto | Medido | Tarea |
|---|---|---|
| `.btn-primary:hover` empareja `accent` con texto blanco | **2.42:1** | [`frontend/01-sistema-de-diseno.md`](./frontend/01-sistema-de-diseno.md) |
| `--text-muted` actual `#64748b` sobre `#000000` | **4.41:1** (y 4.16:1 sobre `#0a0a0a`) | [`frontend/01-sistema-de-diseno.md`](./frontend/01-sistema-de-diseno.md) |
| `--font-heading` declara `'Inter'` sin `@font-face`, `@import` ni `<link>` | Sin fuente cargada | [`frontend/01-sistema-de-diseno.md`](./frontend/01-sistema-de-diseno.md) |
| `scroll-behavior: smooth` global sin cobertura automatizada del contrato con `prefers-reduced-motion` | `Layout.astro:103-106` y `364-372` | [`frontend/01-sistema-de-diseno.md`](./frontend/01-sistema-de-diseno.md) |
| `frontend/package.json` declara `"name": "fwskills"` y el CLI debe publicarse como `fwskills` | `EDUPLICATEWORKSPACE` | [`backend/01-andamiaje-del-cli.md`](./backend/01-andamiaje-del-cli.md) |
| `PUBLIC_SITE_URL` cae en silencio a `https://example.com` | Build exitoso con dominio ajeno | [`frontend/10-seo-y-404.md`](./frontend/10-seo-y-404.md) |
| Sin linter, sin runner de pruebas, sin `npm run validate`, sin CI | `@astrojs/check` instalado sin script que lo invoque | [`frontend/01-sistema-de-diseno.md`](./frontend/01-sistema-de-diseno.md) (script de tipos) y [`backend/05-validacion-de-skills.md`](./backend/05-validacion-de-skills.md) (`npm run validate`) |

## Índice de archivos

### Frontend (`frontend/`)

| Archivo | Área | Depende de |
|---|---|---|
| [`01-sistema-de-diseno.md`](./frontend/01-sistema-de-diseno.md) | Tokens semánticos, modo claro/oscuro, contraste, tipografías, script de tipos | — |
| [`02-componentes-globales.md`](./frontend/02-componentes-globales.md) | Los 8 componentes compartidos y sus islas de JavaScript | 01 |
| [`03-colecciones-de-contenido.md`](./frontend/03-colecciones-de-contenido.md) | Colección `skills`, esquema Zod, `getStaticPaths`, mapa de categorías | 01 |
| [`04-inicio.md`](./frontend/04-inicio.md) | Landing de 8 bloques en `/` | 02, 03, 11 |
| [`05-catalogo.md`](./frontend/05-catalogo.md) | `/skills` con filtros, búsqueda y estado en la URL | 02, 03 |
| [`06-ficha-de-skill.md`](./frontend/06-ficha-de-skill.md) | `/skills/[categoria]/[slug]` | 02, 03, 11 |
| [`07-instalacion.md`](./frontend/07-instalacion.md) | `/instalacion` con 9 secciones | 02, 03 |
| [`08-docs-starlight.md`](./frontend/08-docs-starlight.md) | `/docs/**` con Starlight y puente de tokens (ADR-04) | 01, 02, 03 |
| [`09-contribuir.md`](./frontend/09-contribuir.md) | `/contribuir` con 8 bloques | 02, 03 |
| [`10-seo-y-404.md`](./frontend/10-seo-y-404.md) | Metadatos, `sitemap.xml`, `robots.txt`, fallo ruidoso de `PUBLIC_SITE_URL`, página 404 | 01, 04-09 |
| [`11-datos-en-build-time.md`](./frontend/11-datos-en-build-time.md) | Métricas de GitHub resueltas en build, con caché y degradación | 03 |

### Backend / CLI (`packages/cli/`)

| Archivo | Área | Depende de |
|---|---|---|
| [`01-andamiaje-del-cli.md`](./backend/01-andamiaje-del-cli.md) | Scaffold del paquete, workspaces, parser de argv, registro, códigos de salida, logger | — |
| [`02-comandos-de-consulta.md`](./backend/02-comandos-de-consulta.md) | `init`, `list`, `search`, `info` | 01 |
| [`03-comando-add.md`](./backend/03-comando-add.md) | `add`, `remove`, `update`, plan y `--dry-run` | 01, 02, 04 |
| [`04-deteccion-de-agentes.md`](./backend/04-deteccion-de-agentes.md) | Detección de agentes y precedencia de destinos | 01 |
| [`05-validacion-de-skills.md`](./backend/05-validacion-de-skills.md) | Frontmatter, path traversal, symlinks, `npm run validate` | 01 |
| [`06-empaquetado-y-publicacion.md`](./backend/06-empaquetado-y-publicacion.md) | Empaquetado, publicación en npm, versionado, lista de publicación | 02, 03, 04, 05 |

## Orden de arranque recomendado

El orden entre archivos no es estricto —dentro de cada archivo el orden sí lo es—
pero la secuencia de abajo es la que minimiza retrabajo:

1. `backend/01-andamiaje-del-cli.md`: sin el workspace del CLI, nada del
   monorepo es instalable, y la colisión de nombres sigue bloqueando.
2. `frontend/01-sistema-de-diseno.md`: todo componente posterior consume tokens
   semánticos. Construir sobre los tokens por apariencia obliga a migrar dos
   veces.
3. `frontend/03-colecciones-de-contenido.md`: sin la colección, `/skills` y la
   ficha no tienen datos.
4. `frontend/02-componentes-globales.md`: los componentes se construyen una vez y
   las cinco páginas restantes los componen.
5. `frontend/11-datos-en-build-time.md`: las métricas de GitHub alimentan el
   hero y la sección Comunidad de la landing.
6. `frontend/04` a `frontend/10`: las páginas, ya con datos y componentes.
7. `frontend/08-docs-starlight.md` puede ir en cualquier momento después de 01 y
   02, porque Starlight se apoya en el puente de tokens.
8. `backend/02` a `backend/06`: los comandos, con el andamiaje y el contrato de
   destinos ya fijados.

## Módulos que no existen

| Módulo | Estado | Consecuencia para estas tareas |
|---|---|---|
| `db/` | **No existe** (ADR-02) | Ninguna tarea de este directorio planifica esquema, migración ni ORM. El «modelo de datos» del catálogo es el sistema de archivos: `skills/<categoria>/<slug>/SKILL.md`. |
| `api/` | **No existe** (ADR-03) | Ninguna tarea expone endpoints HTTP. El contrato legible por máquinas del CLI es `fwskills --help` más los campos `bin` y `exports` del paquete. |

Que no haya base de datos no significa que falte validación: significa que la
validación vive en el esquema Zod de la colección y en el validador del
frontmatter del CLI, y que **un dato inválido rompe el build** en lugar de
persistir mal.
