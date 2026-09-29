# 03 — Arquitectura

## Estructura de carpetas

### Árbol actual `[EXISTE]`

```
fwskills/
├── .agents/skills/               # destino de skills para agentes (detectado por el CLI)
├── .atl/                         # estado local del runtime de IA (gitignored)
├── .gitignore                    # contiene: .atl/ y odd
├── .opencode/skills/             # destino de skills para opencode (detectado por el CLI)
├── .pi/skills/                   # destino de skills para pi (detectado por el CLI)
└── frontend/
    ├── .env.example              # PUBLIC_SITE_URL, PUBLIC_SITE_DESCRIPTION
    ├── astro.config.mjs          # defineConfig({ site: … })
    ├── package.json              # fwskills 1.0.0, type module, engines.node >=22.12.0
    ├── tsconfig.json             # astro/tsconfigs/strict, exclude dist
    ├── public/
    │   └── favicon.svg
    ├── README.md
    ├── template.json
    └── src/
        ├── layouts/
        │   └── Layout.astro      # 372 líneas; head + SEO + design tokens + utilidades CSS
        ├── sections/
        │   ├── CTA.astro         # 47 líneas
        │   ├── DesignSkills.astro# 94 líneas
        │   ├── Features.astro    # 68 líneas
        │   ├── Footer.astro      # 93 líneas
        │   ├── Header.astro      # 90 líneas (pill de vidrio flotante, 3 enlaces ancla)
        │   ├── Hero.astro        # 163 líneas
        │   └── HowItWorks.astro  # 85 líneas
        └── pages/
            └── index.astro       # 21 líneas; compone Layout + secciones
```

Lo que **no** existe hoy: `skills/`, `cli/`, `src/content/`,
`src/components/`, `src/lib/`, `src/styles/`, configuración de Starlight,
cualquier linter, cualquier runner de tests, `sitemap.xml`, `robots.txt`.

### Árbol objetivo `[ESPECIFICADO]`

```
fwskills/
├── skills/                              # FUENTE DE VERDAD DEL CATÁLOGO
│   ├── specs/
│   │   └── crear-specs/SKILL.md
│   ├── design/
│   │   └── minimal-light/SKILL.md
│   ├── qa/
│   │   └── .../SKILL.md
│   └── security/
│       └── .../SKILL.md
│   # añadir una skill = añadir una carpeta. Sin tocar frontend/.
│   # añadir una categoría = añadir una subcarpeta. Sin tocar frontend/.
├── cli/                               # npx fwskills (ver ../backend/)
├── frontend/
│   ├── astro.config.mjs                # site + integraciones (starlight, sitemap)
│   ├── package.json
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── robots.txt                  # [POR AÑADIR]
│   │   └── fonts/                      # [POR AÑADIR] Inter + JetBrains Mono autoalojadas
│   └── src/
│       ├── content.config.ts           # colección `skills` con esquema Zod
│       ├── lib/                        # capa de datos, solo build time
│       │   ├── catalog.ts              # skills + categorías derivadas de la colección
│       │   ├── github.ts               # stars / contributors / releases (API GitHub)
│       │   ├── search-index.ts         # índice unificado skills + docs → JSON
│       │   └── categories.ts           # slug ↔ nombre ↔ descripción ↔ icono
│       ├── layouts/
│       │   └── Layout.astro            # head + SEO + tokens semánticos claro/oscuro
│       ├── components/                 # los 8 componentes globales
│       │   ├── SiteHeader.astro
│       │   ├── CodeBlock.astro
│       │   ├── PackageManagerTabs.astro
│       │   ├── SkillCard.astro
│       │   ├── Badge.astro
│       │   ├── Breadcrumbs.astro
│       │   ├── Accordion.astro
│       │   └── SiteFooter.astro
│       ├── scripts/                    # Islandas: JS mínimo, sin framework
│       │   ├── theme.ts                # prefijo, toggle, data-theme, localStorage
│       │   ├── header.ts               # scroll >40px, menú móvil, foco atrapado
│       │   ├── search.ts               # modal Ctrl/⌘+K sobre el índice de build
│       │   ├── package-manager.ts     # tabs sincronizados + localStorage
│       │   ├── copy.ts                 # delegated click → clipboard + aria-live
│       │   ├── accordion.ts
│       │   └── catalog-filters.ts      # ?categoria=&q=&tag= ↔ DOM
│       ├── styles/
│       │   ├── tokens.css              # :root oscuro + [data-theme="light"] + prefers-color-scheme
│       │   ├── base.css                # reset, tipografía, foco visible
│       │   └── utilities.css           # .container, .section, grid responsivo
│       ├── content/
│       │   └── docs/                   # Markdown de Starlight
│       │       ├── docs.config.ts      # [POR AÑADIR] (ADR-04)
│       │       ├── introduccion.md
│       │       ├── primeros-pasos.md
│       │       ├── cli/{init,list,search,add,remove,update,info}.md
│       │       ├── anatomia-de-una-skill.md
│       │       ├── categorias/{specs,design,qa,security}.md
│       │       ├── crear-una-skill.md
│       │       ├── compatibilidad.md
│       │       ├── versionado.md
│       │       ├── faq.md
│       │       └── changelog.md
│       └── pages/
│           ├── index.astro            # Inicio
│           ├── skills/
│           │   ├── index.astro        # Catálogo
│           │   └── [categoria]/
│           │       └── [slug].astro   # Ficha de skill
│           ├── instalacion.astro
│           ├── contribuir.astro
│           └── 404.astro
└── CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE (MIT)
```

### Regla de dependencia entre carpetas

`skills/` **no conoce** `frontend/` ni `cli/`. La dependencia va en un
solo sentido: los dos consumidores leen el árbol de skills. Por eso un
`SKILL.md` es, a la vez, la fuente del catálogo web y el payload que descarga
el CLI.

---

## Capas

El sitio tiene cuatro capas. Ninguna depende hacia arriba.

```
┌─────────────────────────────────────────────────────────┐
│ 4 · SCRIPTS  (src/scripts/)                             │
│     Islas de mejora progresiva. Sin framework.           │
│     Se cargan como <script type="module"> y se enganchan │
│     al DOM ya renderizado.                               │
├─────────────────────────────────────────────────────────┤
│ 3 · SECCIONES  (src/pages/, src/components/)            │
│     Composición y markup. Leen datos de la capa 2 y     │
│     aplican tokens de la capa 4bis. Sin lógica de datos.│
├─────────────────────────────────────────────────────────┤
│ 2 · CONTENIDO  (src/content.config.ts, src/lib/,        │
│                 content/docs/, skills/)                 │
│     Colecciones, esquemas Zod, consultas y datos         │
│     resueltos en build time. Sin acceso al DOM.         │
├─────────────────────────────────────────────────────────┤
│ 1 · CONFIGURACIÓN  (astro.config.mjs, tsconfig.json,    │
│                     .env, src/styles/tokens.css)        │
│     Variables, tokens, integraciones.                    │
└─────────────────────────────────────────────────────────┘
```

| Capa | Responsabilidad | No puede |
|---|---|---|
| 1 · Configuración | Declarar integraciones, `site`, tokens CSS, variables | Importar contenido |
| 2 · Contenido | Leer `skills/`, `skills/**/SKILL.md` y `content/docs/**`; derivar categorías, índice de búsqueda y métricas de GitHub | Tocar el DOM |
| 3 · Secciones | Renderizar markup semántico con tokens y componentes base | Inventar datos; no hay fuente alternativa a la capa 2 |
| 4 · Scripts | Interacción local: tema, menú, modal, copiar, tabs, filtros | Hacer `fetch` a una API propia (no existe); el único dato que consumen es el JSON del índice generado en build |

No existe una capa de servidor. No hay API interna, ni route handler, ni
llamada de red desde el navegador a un backend propio.

---

## Estado global

Resumen; el modelo completo está en [`06-estado.md`](./06-estado.md).

| Ámbito | Dónde vive | Ejemplo |
|---|---|---|
| Compartible y compartible por URL | Parámetros de la URL | `?categoria=specs&q=spec&tag=arquitectura` en `/skills` |
| Preferencia del usuario | `localStorage` | `fwskills:theme`, `fwskills:pm` |
| Efímero, ligado a un componente | Atributo en el nodo (`data-*`, `aria-expanded`, `hidden`) | Menú móvil abierto, acordeón abierto, modal abierto |
| Ninguno | Variable en el frontmatter del componente | Datos del build |

**No hay store global.** No hay framework de estado, ni signals, ni context, ni
singleton. Si dos componentes necesitan compartir algo que no es ni URL ni
preferencia, se rediseña: o se sube a la URL, o se resuelve con CSS.

---

## Data fetching

### En runtime no hay data fetching. Punto.

El navegador **no pide datos a ningún lado**. No hay `fetch` a una API propia,
no hay endpoint, no hay base de datos. Después del `HTML`, el navegador pide, como
mucho:

| Recurso | Quién lo pide | Cuándo |
|---|---|---|
| `/search-index.json` | El modal `Ctrl/⌘+K` | Al abrir el modal por primera vez en la sesión |
| Avatares de contribuidores (`.webp`/`.png`) | `<img>` | Al renderizar la sección Comunidad de Inicio |
| `og:image` de cada skill (`.png`/`.webp`) | La red social, no el visitante | Al compartir un enlace |
| Fuente Inter / JetBrains Mono | `<link rel="preload">` | Autoalojadas, sin terceros |

Todo lo demás está en el HTML.

### La tubería de contenido en build time

```
skills/<categoria>/<slug>/SKILL.md
        │
        ├─(1) glob loader ─────────► colección `skills` (entries)
        │
        ├─(2) esquema Zod ─────────► 8 campos validados o build abortado
        │
        ├─(3) getCollection('skills')► array tipado en memoria de build
        │
        ├─(4) getStaticPaths() ─────► una ruta por skill
        │
        ├─(5) catálogo/índice ──────► /skills, search-index.json, /docs/categorias/*
        │
        └─(6) GitHub REST API ──────► stars, contributors, releases, last-updated
                     (con caché; nunca falla el build)
```

**Paso 1 — carga.** `src/content.config.ts` declara la colección con un loader
`glob` apuntando al árbol de skills, que vive **un nivel por encima** de
`frontend/`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const skills = defineCollection({
  loader: glob({ pattern: '**/SKILL.md', base: '../skills' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(['specs', 'design', 'qa', 'security']),
    version: z.string(),
    author: z.string().or(z.array(z.string())),
    tags: z.array(z.string()),
    compatibility: z.array(z.string()),
    featured: z.boolean(),
  }),
});

export const collections = { skills };
```

Punto a validar en la implementación: que el `base` del loader pueda situarse
fuera de la raíz del proyecto Astro. Si la versión de `astro/loaders` lo restringe
al interior de `frontend/`, la alternativa es un `load` propio que lea con
`node:fs` desde `../skills` — el contrato de la colección no cambia.

`category` se valida contra la lista cerrada **del snapshot actual**
(`specs`, `design`, `qa`, `security`) únicamente porque Zod necesita una lista
concreta para `z.enum`. **No es una fuente de verdad a la larga**: cuando el
proyecto admita categorías nuevas, se cambia a `z.string()` con una
validación cruzada contra los subdirectorios reales de `skills/` en
`src/lib/catalog.ts`. La verificación que manda es "la carpeta existe", no "está
en esta lista de TypeScript".

**Paso 2 — validación.** El esquema exige **exactamente 8 campos** de
frontmatter. Un campo faltante, un tipo equivocado (`featured: "sí"` en lugar de
`featured: true`), una `category` desconocida o un `tags` que no es un array
abortan el build con un mensaje que señala el archivo. No hay valor por defecto:
es preferible un build roto a una página que miente sobre una skill.

Los 8 campos:

| Campo | Tipo Zod | Restricción |
|---|---|---|
| `name` | `z.string()` | No vacío. Es lo que se muestra en monospace. |
| `description` | `z.string()` | No vacía; una o dos frases. Se recorta a 2 líneas en la tarjeta. |
| `category` | `z.enum([...])` *(ver nota)* | Debe existir como subcarpeta de `skills/`. |
| `version` | `z.string()` | Semver. Se muestra como badge. |
| `author` | `z.string()` \| `z.array(z.string())` | Una o varias personas; se enlazan a su perfil de GitHub. |
| `tags` | `z.array(z.string())` | Lista abierta. Alimenta el filtro por tag. |
| `compatibility` | `z.array(z.string())` | Lista de agentes con los que funciona. Alimenta el badge de compatibilidad. |
| `featured` | `z.boolean()` | Booleano estricto. `true` → aparece en "Skills destacadas" (máximo 6 en Inicio). |

**Paso 3 — consultas.** `getCollection('skills')` devuelve la lista ya validada y
tipada. Toda la capa de datos del sitio pasa por ahí:

- `src/lib/catalog.ts` agrupa por `category`, calcula el conteo por categoría,
  ordena las destacadas y resuelve las skills relacionadas (misma categoría o tags
  compartidos, 3 resultados).
- `src/lib/search-index.ts` serializa a `search-index.json` un objeto por skill
  (`name`, `description`, `tags`, `category`, `slug`, ruta) **y** las páginas de
  `/docs`, para que el modal del header tenga un único índice que consultar.

**Paso 4 — `getStaticPaths`.** `src/pages/skills/[categoria]/[slug].astro` deriva
una ruta por entrada de la colección:

```ts
export async function getStaticPaths() {
  const skills = await getCollection('skills');
  return skills.map((skill) => ({
    params: { categoria: skill.data.category, slug: skill.id },
    props: { skill },
  }));
}
```

Consecuencias:

- Una skill nueva produce su página **sin que nadie escriba una línea de código**.
- La URL es `/skills/<category>/<slug>`, y `<slug>` es el nombre de la carpeta,
  en minúsculas y con guiones, sin acentos (requisito de SEO).
- Como la colección se valida **antes** de la generación, un `SKILL.md`
  malformado hace que `getStaticPaths` lance y **`astro build` falle**. No hay
  ruta parcial: o se generan todas las páginas de skills, o no se genera ninguna.
  Es la misma validación que ejecuta `npm run validate` en local, paso 4 de la
  línea de tiempo de `/contribuir`.

`src/pages/skills/[categoria]/` no necesita `getStaticPaths`: el catálogo lista
todas las categorías de la colección, y por lo tanto cualquier slug de categoría
inválido nunca llega a renderizarse.

---

## Navegación

### Registro completo de rutas

| Ruta | Archivo | Tipo | Contenido |
|---|---|---|---|
| `/` | `src/pages/index.astro` | estática | Landing de 8 bloques |
| `/skills` | `src/pages/skills/index.astro` | estática | Catálogo con filtros en la URL |
| `/skills/[categoria]/[slug]` | `src/pages/skills/[categoria]/[slug].astro` | dinámica en build | Una página por skill, generada por `getStaticPaths` |
| `/instalacion` | `src/pages/instalacion.astro` | estática | Guía de 9 secciones del CLI |
| `/docs/` y `/docs/[...slug]` | `src/content/docs/**` vía Starlight (ADR-04) | generadas por Starlight | Documentación multipágina |
| `/contribuir` | `src/pages/contribuir.astro` | estática | Contribución, calidad, gobernanza, seguridad |
| `/404` | `src/pages/404.astro` | estática | Página de error |

Todas comparten `Layout.astro`, `SiteHeader.astro` y `SiteFooter.astro`.

### Rutas de documentación

Starlight genera la sección completa desde `src/content/docs/`. Prefijo de URL
configurado a `/docs` para que las rutaslings de la especificación se cumplan tal
cual.

| Ruta | Slug | Origen |
|---|---|---|
| `/docs` | — | Índice de la documentación |
| `/docs/introduccion` | `introduccion` | `introduccion.md` |
| `/docs/primeros-pasos` | `primeros-pasos` | `primeros-pasos.md` |
| `/docs/cli/init` | `cli/init` | `cli/init.md` |
| `/docs/cli/list` | `cli/list` | `cli/list.md` |
| `/docs/cli/search` | `cli/search` | `cli/search.md` |
| `/docs/cli/add` | `cli/add` | `cli/add.md` |
| `/docs/cli/remove` | `cli/remove` | `cli/remove.md` |
| `/docs/cli/update` | `cli/update` | `cli/update.md` |
| `/docs/cli/info` | `cli/info` | `cli/info.md` |
| `/docs/anatomia-de-una-skill` | `anatomia-de-una-skill` | `anatomia-de-una-skill.md` |
| `/docs/categorias/specs` | `categorias/specs` | `categorias/specs.md` |
| `/docs/categorias/design` | `categorias/design` | `categorias/design.md` |
| `/docs/categorias/qa` | `categorias/qa` | `categorias/qa.md` |
| `/docs/categorias/security` | `categorias/security` | `categorias/security.md` |
| `/docs/crear-una-skill` | `crear-una-skill` | `crear-una-skill.md` |
| `/docs/compatibilidad` | `compatibilidad` | `compatibilidad.md` |
| `/docs/versionado` | `versionado` | `versionado.md` |
| `/docs/faq` | `faq` | `faq.md` |
| `/docs/changelog` | `changelog` | `changelog.md` |

Cada grupo del sidebar de Starlight existe aunque tenga una página, porque el
modelo de "una página por comando" va a crecer.

### Navegación entre pantallas

| Desde | Hacia | Mecanismo |
|---|---|---|
| Cualquier página | Inicio | Wordmark del header; botón "Volver al inicio" en 404 |
| Inicio | Catálogo | Botón "Explorar skills"; tarjeta de categoría → `/skills?categoria=<slug>`; "Ver todas →" en Skills destacadas |
| Inicio | Instalación | CTA "Instalar ahora"; botón secundario del hero |
| Inicio | Docs | CTA a `/docs`; enlace del header; "Ver todas las preguntas →" a `/docs/faq` |
| Catálogo | Ficha | Tarjeta de skill (whole card es enlace) y botón "Ver skill" |
| Ficha | Catálogo | Breadcrumb `Skills`; botón "Volver al catálogo" |
| Ficha | Docs | Índice lateral: "Anatomía de una skill", "Crear una skill", "Compatibilidad", "Versionado", página de su categoría |
| Instalación | Docs | CTA de cierre a `/docs`; cada comando enlaza a `/docs/cli/<comando>` |
| Contribuir | GitHub | Issues abiertos, plantilla de PR, `CONTRIBUTING.md` |
| Cualquier página | GitHub | Header (con contador de estrellas), ficha de skill, "Editar esta skill", footer |

### Requisitos transversales de navegación

| Requisito | Cómo se cumple |
|---|---|
| Cada página tiene breadcrumb | Todas salvo Inicio |
| Ningún enlace interno da 404 | Cada `href` a `/docs/...` corresponde a un archivo real de `content/docs/`; esa correspondencia se comprueba con `npm run check` y con el recorrido E2E de navegación (ambos `[POR AÑADIR]`, ver [`05-quality.md`](./05-quality.md)) |
| Slugs | Minúsculas, con guiones, sin acentos ni `ñ` (`anatomia-de-una-skill`, no `anatomía-de-una-skill`) |
| Estado del ítem activo | El header marca con subrayado de 2px el ítem de la ruta actual |
| Redirecciones | `/docs/cli` (sin comando) redirige a `/docs/cli/init` |
