# Ficha de skill

## Estado Actual

No existe `frontend/src/pages/skills/[categoria]/[slug].astro` ni la carpeta
`src/content/`. El repositorio no tiene hoy ninguna página de detalle de skill:
lo más cercano es el bloque de la terminal en `src/sections/Hero.astro` (163
líneas), que muestra un comando escrito a mano. No hay `SKILL.md` que renderizar,
ni esquema Zod que lo valide, ni `getStaticPaths` que derive una ruta por skill,
ni tabla de contenidos, ni árbol de archivos, ni skills relacionadas. La única
referencia real a una skill es la tabla de skills de diseño del propio
repositorio, en `.opencode/skills/design/`.

## Objetivo

Una plantilla única que convierta cada `SKILL.md` en una página completa y
instalable de un clic: metadatos, instalación, cuerpo renderizado, índice de
contenido, árbol de archivos, tres acciones y skills relacionadas.

## Alcance

- `frontend/src/pages/skills/[categoria]/[slug].astro` con los 9 bloques de la
  pantalla.
- Encabezado con nombre en monospace, badges de categoría, versión y
  compatibilidad, autor y fecha de última actualización.
- Bloque de instalación con los cuatro gestores, comando copiable y ruta de
  destino manual.
- Secciones «Cuándo usarla» y «Cuándo no usarla», derivadas del frontmatter o de
  las secciones convencionales del `SKILL.md`.
- Cuerpo del `SKILL.md` renderizado como Markdown con resaltado de sintaxis.
- Índice de contenidos pegajoso en escritorio, colapsado por encima del
  contenido en móvil.
- Árbol de archivos de la skill con enlaces a GitHub.
- Tres acciones: «Ver en GitHub», «Editar esta skill» y «Reportar un problema».
- Tres skills relacionadas, por misma categoría o tags compartidos.

## Fuera de alcance

- La colección y el esquema Zod que validan el `SKILL.md`: viven en
  [`03-colecciones-de-contenido.md`](./03-colecciones-de-contenido.md).
- Los componentes `CodeBlock`, `PackageManagerTabs`, `Badge`, `Breadcrumbs`,
  `SiteHeader` y `SiteFooter`: viven en
  [`02-componentes-globales.md`](./02-componentes-globales.md).
- La generación de la `og:image` específica de cada skill, que se resuelve en
  build: vive en
  [`10-seo-y-404.md`](./10-seo-y-404.md).
- La fecha de última actualización cuando viene de la API de GitHub: vive en
  [`11-datos-en-build-time.md`](./11-datos-en-build-time.md). Aquí se acepta
  `lastUpdated: Date | null` y se cae a la fecha de build cuando es `null`.
- La tabla de estilos de la documentación en `/docs`: es Starlight, en
  [`08-docs-starlight.md`](./08-docs-starlight.md).
- Cualquier edición del contenido de la skill desde el navegador: publicar es un
  cambio en el repositorio, revisado por pull request.

## Tareas

- [ ] 1. Crear la plantilla con `getStaticPaths` y el bloque de encabezado
  - Detalle de implementación: `src/pages/skills/[categoria]/[slug].astro` declara
  `getStaticPaths()` sobre `getCollection('skills')` con
  `params: { categoria, slug }` y `props: { skill }`. El encabezado muestra
  `name` en `var(--font-mono)` a 17px, la descripción, `Badge.astro` de categoría,
  versión y compatibilidad, el autor enlazado a su perfil de GitHub y la fecha de
  última actualización. Un slug inexistente nunca llega a renderizarse: cae al 404
  de la tarea 9.
- [ ] 2. Construir el bloque de instalación con comando copiable, tabs de gestor y ruta manual
  - Detalle de implementación: `PackageManagerTabs.astro` con los cuatro gestores
  y `CodeBlock.astro` con `[data-copy]` sobre
  `npx fwskills add <categoria>/<slug>`, que muestra «¡Copiado!» y lo anuncia en
  `aria-live="polite"`. Debajo, un bloque de código con la ruta de destino a mano,
  derivado de la carpeta de agente por defecto, y un enlace a
  `/docs/cli/add` para quien quiera ver las opciones.
- [ ] 3. Renderizar las secciones «Cuándo usarla» y «Cuándo no usarla»
  - Detalle de implementación: la plantilla busca en el `SKILL.md` las secciones
  convencionales por encabezado y, si no existen, las deriva de los primeros dos
  elementos de la lista `tags` y de la descripción. Si ninguna de las dos fuentes
  existe, la sección se omite en lugar de renderizar un texto vacío. La distinción
  importa: «cuándo no usarla» es la información que evita una mala instalación.
- [ ] 4. Renderizar el cuerpo del `SKILL.md` con resaltado de sintaxis
  - Detalle de implementación: el `body` de la entrada de la colección se pasa por
  el renderizador de Markdown de Astro con `markdown.shikiConfig` de
  `astro.config.mjs`, que sustituye los colores por los roles `--syn-*`. El
  contenido es de terceros: se inyecta como Markdown ya renderizado, nunca como
  HTML arbitrario, y los enlaces externos reciben `rel="noopener noreferrer"`.
  Los nombres de skill y los comandos en línea salen en `--font-mono`.
- [ ] 5. Extraer y montar la tabla de contenidos pegajosa
  - Detalle de implementación: en build se recorren los encabezados `h2` y `h3`
  del cuerpo renderizado y se genera un índice con anclas estables, con la
  sección activa resaltada al desplazarse. En escritorio el índice va en una
  columna lateral `position: sticky`; en móvil se colapsa y se sitúa **por
  encima** del contenido, de modo que se puede navegar sin volver arriba. La
  columna de texto se limita a 760–820px de ancho.
- [ ] 6. Construir el árbol de archivos de la skill con enlaces a GitHub
  - Detalle de implementación: en build se recorre `skills/<categoria>/<slug>/` y
  se listan `SKILL.md` y las carpetas `references/`, `scripts/` y `assets/` que
  existan, sin inventar las que no están. Cada entrada enlaza a su ruta en GitHub
  con `target="_blank" rel="noopener"`. Si la skill solo tiene `SKILL.md`, se
  muestra únicamente ese archivo, sin un árbol vacío.
- [ ] 7. Implementar las tres acciones de la ficha
  - Detalle de implementación: «Ver en GitHub» abre el `SKILL.md` en el
  repositorio; «Editar esta skill» abre GitHub con la ruta de edición; «Reportar
  un problema» abre un issue con la categoría `security` y un título
  pre-rellenado con skill, categoría y versión. Las tres son enlaces
  `target="_blank" rel="noopener"` con un icono decorativo `aria-hidden="true"`
  y un texto accesible en el propio enlace.
- [ ] 8. Añadir el bloque de skills relacionadas
  - Detalle de implementación: `getRelated(ref, 3)` de `src/lib/catalog.ts` ordena
  por coincidencia de categoría y de tags compartidos, y devuelve menos de tres
  antes que rellenar con contenido ajeno. Con cero relacionadas, el bloque se
  omite y no queda un contenedor vacío. Cada tarjeta es un `SkillCard.astro` que
  enlaza a otra ficha.
- [ ] 9. Añadir el breadcrumb completo y el enlace de vuelta
  - Detalle de implementación: `Breadcrumbs.astro` con la cadena
  `Inicio / Skills / <Categoría> / <Skill>`, donde los tres primeros son enlaces
  y el último no lo es, separado del título por `--space-md`. Un enlace «Volver al
  catálogo» cierra la navegación de vuelta a `/skills`, y los enlaces laterales
  apuntan a `/docs/anatomia-de-una-skill`, `/docs/crear-una-skill`,
  `/docs/compatibilidad`, `/docs/versionado` y a la página de su categoría.
- [ ] 10. Comprobar los estados de la pantalla
  - Detalle de implementación: no hay estado de carga ni estado vacío de
  contenido, porque la ruta existe solo si `getStaticPaths` la generó y porque una
  `SKILL.md` inválida ya rompió el build. El estado de error real es el 404: un
  slug o una categoría que no existen caen en `src/pages/404.astro`, definido en
  [`10-seo-y-404.md`](./10-seo-y-404.md). En responsive, el sidebar pegajoso se
  convierte en un colapsable situado antes del contenido.
- [ ] 11. Cubrir la derivación de rutas y las relacionadas con pruebas
  - Detalle de implementación: pruebas sobre `getStaticPaths` que comprueban que
  devuelve una entrada por skill de la colección con `categoria` igual al campo
  `category` y `slug` igual al identificador de la entrada, y pruebas sobre
  `getRelated` para los tres casos de coincidencia y para el caso sin coincidencia,
  que devuelve menos de tres elementos.

## Criterios de Done

- [ ] Existe un archivo generado por cada entrada de la colección en `dist/skills/<categoria>/<slug>/index.html`, y `getStaticPaths` no necesita ninguna lista escrita a mano.
- [ ] El encabezado muestra nombre en monospace, categoría, versión, compatibilidad, autor enlazado y fecha de última actualización; los badges salen de `Badge.astro`, no de clases sueltas.
- [ ] Copiar el comando de instalación muestra «¡Copiado!» y lo anuncia en `aria-live="polite"`; cambiar de gestor actualiza el comando y sincroniza todos los grupos de tabs de la página.
- [ ] El cuerpo del `SKILL.md` se renderiza con resaltado de sintaxis y cambia de paleta al alternar el tema, sin recargar la página.
- [ ] La tabla de contenidos lista los `h2` y `h3` del cuerpo, es pegajosa a partir de 1024px y, en móvil, aparece colapsada por encima del contenido.
- [ ] El árbol de archivos refleja exactamente lo que hay en `skills/<categoria>/<slug>/` —sin inventar `references/`, `scripts/` ni `assets/` que no existan— y cada entrada enlaza a GitHub.
- [ ] Las tres acciones abren sus destinos correctos en una pestaña nueva con `rel="noopener"`, y el enlace de reportar un problema llega con la categoría `security` y el título pre-rellenado con skill, categoría y versión.
- [ ] Las skills relacionadas son de la misma categoría o comparten tags, y nunca hay más de tres ni relleno de contenido ajeno.
- [ ] `/skills/specs/no-existe` devuelve el 404 del sitio y no una página vacía.
- [ ] La página tiene un único `<h1>`, la jerarquía de encabezados no salta niveles y el cuerpo no desborda horizontalmente a 320px de ancho.
- [ ] El cuerpo del `SKILL.md` se inyecta como Markdown renderizado y nunca como HTML arbitrario; los enlaces externos llevan `rel="noopener noreferrer"`.
- [ ] No hay regresión en el área: `npm run check` termina con 0 errores y `npm run build` genera una página por cada skill de la colección.
