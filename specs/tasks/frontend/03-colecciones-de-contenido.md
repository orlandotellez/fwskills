# Colecciones de contenido

## Estado Actual

No existe `skills/` en la raíz del repositorio, ni `frontend/src/content.config.ts`,
ni `src/lib/`, ni carpeta `src/content/`. El catálogo no tiene ninguna fuente: la
landing actual muestra contenido literal escrito a mano en
`src/sections/DesignSkills.astro` (94 líneas) y `src/sections/Features.astro`. La
única estructura de contenido existente es la tabla de skills de diseño del
propio repositorio, en `.opencode/skills/design/`. Sin colección no hay catálogo,
no hay páginas por skill, no hay índice de búsqueda y no hay `sitemap.xml`.

## Objetivo

Una colección de contenido `skills` con esquema Zod que valide exactamente los
ocho campos de frontmatter, de la que se deriven el catálogo, una página por
skill, el índice de búsqueda, las categorías y el `sitemap.xml`, de modo que
publicar una skill o una categoría nueva no toque `frontend/`.

## Alcance

- `frontend/src/content.config.ts` con la colección `skills` y su esquema Zod de
  8 campos.
- Carga desde `skills/**/SKILL.md`, que vive un nivel por encima de `frontend/`.
- `getStaticPaths` en la página de detalle, una ruta por entrada.
- Build que falla con un mensaje que nombre archivo y campo cuando una
  `SKILL.md` no valida.
- `frontend/src/lib/catalog.ts`: agrupación por categoría, conteos, destacadas y
  skills relacionadas.
- `frontend/src/lib/categories.ts`: el único mapa de metadatos de categoría
  (nombre, descripción e icono), y la regla de que ninguna otra pieza de
  `frontend/` necesita cambiar cuando aparece una categoría.
- `frontend/src/lib/search-index.ts`: índice unificado de skills y documentación
  serializado a `search-index.json`.

## Fuera de alcance

- La plantilla de la ficha que consume la colección: vive en
  [`06-ficha-de-skill.md`](./06-ficha-de-skill.md).
- La interfaz del catálogo: vive en [`05-catalogo.md`](./05-catalogo.md).
- Las páginas de inicio y de documentación que leen las categorías: `/` en
  [`04-inicio.md`](./04-inicio.md) y `/docs/**` en
  [`08-docs-starlight.md`](./08-docs-starlight.md).
- Las páginas de docs `/docs/categorias/<slug>`: las genera Starlight a partir del
  índice que produce `categories.ts`, pero su andamiaje es de Starlight.
- El validador de frontmatter del CLI, que es deliberadamente una implementación
  independiente de la misma regla: vive en
  [`../backend/05-validacion-de-skills.md`](../backend/05-validacion-de-skills.md).
- Cualquier base de datos. No existe el módulo `db/` (ADR-02): el modelo de datos
  del catálogo es el sistema de archivos y una `SKILL.md` malformada rompe el
  build, no se persiste en ningún lado.

## Tareas

- [ ] 1. Crear el árbol `skills/` con las cuatro categorías y al menos una skill por categoría
  - Detalle de implementación: `skills/specs/crear-specs/SKILL.md`, `skills/design/minimal-light/SKILL.md`, `skills/qa/junit-reportes/SKILL.md` y `skills/security/analisis-deps/SKILL.md`, cada una con un frontmatter de exactamente 8 campos y un cuerpo con las secciones que consume la ficha. Los slugs van en minúsculas, con guiones y sin acentos. `skills/` no lleva `package.json` y no es un workspace: es contenido versionado.
- [ ] 2. Declarar la colección `skills` con el esquema Zod de los 8 campos en `frontend/src/content.config.ts`
  - Detalle de implementación: `defineCollection({ loader: glob({ pattern: '**/SKILL.md', base: '../skills' }), schema: z.object({ name: z.string().min(1), description: z.string().min(1), category: z.string(), version: z.string(), author: z.union([z.string(), z.array(z.string())]), tags: z.array(z.string()), compatibility: z.array(z.string()), featured: z.boolean() }) })`. `category` se declara como `z.string()` y **no** como `z.enum(['specs','design','qa','security'])`: la lista de la carpeta es la que manda, y un enum cerrado obligaría a editar TypeScript cada vez que aparece un área nueva. La correspondencia se valida contra los subdirectorios reales en `src/lib/catalog.ts`.
- [ ] 3. Confirmar la carga desde fuera de la raíz del proyecto Astro y fijar el alternativa si el loader la restringe
  - Detalle de implementación: verificar que `glob` acepta `base: '../skills'`. Si la versión instalada lo restringe al interior de `frontend/`, se sustituye por un `load` propio que lea con `node:fs` desde `../skills` y devuelva las mismas entradas. El contrato de la colección no cambia en ninguna de las dos rutas: `getCollection('skills')` sigue devolviendo lo mismo.
- [ ] 4. Hacer que el build falle con un mensaje que nombre el archivo y el campo
  - Detalle de implementación: un campo ausente, un tipo equivocado (`featured:
  "sí"`), una `category` que no corresponde a la subcarpeta que contiene el
  archivo, un `version` que no es semver o un slug con mayúsculas abortan
  `astro build` con un mensaje que nombre la ruta de la `SKILL.md` y el campo
  concreto. No hay valores por defecto: es preferible un build roto a una página
  que miente sobre una skill.
- [ ] 5. Implementar `getStaticPaths` para derivar una página por skill
  - Detalle de implementación: en `frontend/src/pages/skills/[categoria]/[slug].astro`,
  `getStaticPaths()` hace `getCollection('skills')` y devuelve
  `params: { categoria: skill.data.category, slug: skill.id }` más
  `props: { skill }`. La URL resultante es `/skills/<categoria>/<slug>` con ambos
  segmentos en minúsculas y sin acentos. Como la colección se valida antes de
  generar, un `SKILL.md` malformado hace que `getStaticPaths` lance y el build
  falle entero: o se generan todas las páginas de skills, o ninguna.
- [ ] 6. Crear `src/lib/catalog.ts` con agrupación, conteos, destacadas y relacionadas
  - Detalle de implementación: `getSkillsByCategory()` agrupa por
  `skill.data.category` y devuelve el conteo por categoría contando los
  subdirectorios reales de `skills/`; `getFeatured(limit = 6)` filtra
  `featured === true` con un recorte determinista cuando hay más de seis;
  `getRelated(ref, limit = 3)` busca por la misma categoría y por tags
  compartidos, y devuelve menos de tres antes que rellenar con contenido
  ajeno. `validateCategoryFolders()` recorre la colección y falla si alguna
  entrada declara una `category` sin carpeta correspondiente.
- [ ] 7. Crear `src/lib/categories.ts` como único mapa de metadatos de categoría
  - Detalle de implementación: `Record<string, { nombre: string;
  descripcion: string; icono: keyof typeof iconos }>` con las cuatro
  categorías iniciales. El icono se resuelve contra los componentes de
  `lucide-astro`, con `lucide:box` como valor por defecto cuando falta una
  entrada, de modo que el mapa **no necesita crecer** para que una categoría
  función: solo pierde su icono y su descripción. Este archivo es el
  único punto donde añadir una categoría toca código, y es deliberado: son datos
  de presentación, no de contenido.
- [ ] 8. Crear `src/lib/search-index.ts` y serializarlo a `search-index.json`
  - Detalle de implementación: un endpoint estático en
  `frontend/src/pages/search-index.json.ts` que serializa un objeto por skill
  (`name`, `description`, `tags`, `category`, `slug`, `href`) más una entrada por
  página de `/docs`, con la normalización de mayúsculas y acentos aplicada en el
  cliente. El JSON crudo de la colección no se publica: solo los campos que la
  búsqueda necesita. El navegador lo pide una vez al abrir el modal `Ctrl/⌘+K`; no
  es una API, es un archivo del propio despliegue.
- [ ] 9. Verificar la invariante de que añadir contenido no es un cambio de código
  - Detalle de implementación: añadir `skills/qa/playwright-smoke/SKILL.md` en una
  rama de prueba, ejecutar `npm run build` y comprobar que aparece en
  `/skills`, que genera `/skills/qa/playwright-smoke`, que entra en
  `search-index.json` y en `sitemap.xml` **sin haber modificado ningún archivo de
  `frontend/`**. El criterio de revisión derivado es directo: una pull request de
  contenido que toca `frontend/` está mal planteada y contradice ADR-05.
- [ ] 10. Cubrir `catalog.ts` y `search-index.ts` con pruebas de unidad
  - Detalle de implementación: casos para categoría vacía, categoría con una
  skill, conteo correcto, menos de seis destacadas, más de seis con recorte
  determinista, ninguna destacada, relacionadas por misma categoría, por tags
  compartidos y sin coincidencia (que devuelve menos de tres, nunca relleno), y
  normalización de acentos y mayúsculas en el índice de búsqueda.

## Criterios de Done

- [ ] `skills/` existe con al menos cuatro skills repartidas en `specs`, `design`, `qa` y `security`, cada una con exactamente 8 campos de frontmatter.
- [ ] `getCollection('skills')` devuelve todas las entradas tipadas y `astro check` no reporta error de tipo sobre `skill.data.featured` ni sobre `skill.data.tags`.
- [ ] `npm run build` genera un archivo por skill en `dist/skills/<categoria>/<slug>/index.html`, y todos los slugs están en minúsculas y sin acentos.
- [ ] Una `SKILL.md` con un campo ausente, con `featured: "sí"` o con `category` distinta de su carpeta hace fallar `astro build` con un mensaje que nombra la ruta del archivo y el campo; ninguna página se genera parcialmente.
- [ ] Añadir una carpeta en `skills/` produce su página, su entrada en el catálogo, su entrada en `search-index.json` y su entrada en `sitemap.xml` sin modificar `frontend/`.
- [ ] `src/lib/categories.ts` es el único archivo de `frontend/` que necesita tocarse cuando aparece una categoría nueva, y una categoría ausente del mapa renderiza con el icono por defecto en lugar de romper el build.
- [ ] `search-index.json` es un archivo estático del sitio, no un endpoint con código de servidor, y contiene entradas tanto de skills como de páginas de documentación.
- [ ] `npm run validate` y `astro build` aplican la misma regla de 8 campos: una diferencia entre ambos es un defecto, no una decisión de implementación.
- [ ] `npm run check` termina con 0 errores y la suite de unidad de `src/lib/` pasa.
- [ ] No hay regresión en el área: el build sigue siendo 100 % estático, sin función de servidor y sin escritura en disco durante la generación.
