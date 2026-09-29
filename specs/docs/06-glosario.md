# 06 — Glosario

Vocabulario utilizado en esta especificación. Los términos están aquí porque aparecen
en más de un documento del árbol; no se incluyen jerga que no se use en otro lugar.

**skill** — Unidad de distribución del repositorio. Es una carpeta que contiene un
archivo `SKILL.md` y que describe una tarea o un procedimiento que un agente de IA
puede aplicar. La skill es el producto que instala `npx fwskills add <skill>` y la
entidad que el sitio publica. El plural es *skills*.

**SKILL.md** — Nombre del archivo que define una skill. Contiene un bloque de
*frontmatter* con metadatos y, después, la instrucción en sí. Es el contrato entre el
repositorio, el sitio y el CLI: no existe un formato alternativo.

**frontmatter** — Bloque de metadatos al inicio de `SKILL.md`, delimitado por `---`, que
declara los atributos de la skill. En fwskills tiene **exactamente ocho campos**:
`name`, `description`, `category`, `version`, `author`, `tags`, `compatibility` y
`featured`. El esquema que los valida hace fallar el build si falta alguno o si tiene un
tipo incorrecto.

**categoría** — Agrupación de skills por área, representada por una subcarpeta de primer
nivel bajo `skills/`. Las categorías iniciales son `specs`, `design`, `qa` y `security`.
La categoría forma parte de la URL de la página de detalle
(`/skills/[categoria]/[slug]`) y es el valor del campo `category` en el frontmatter.

**CLI** — *Command Line Interface*. En fwskills, el paquete npm `packages/cli/` que se
instala y ejecuta con `npx`. Es el código no-navegador del proyecto y no expone
endpoints HTTP; su contrato público es la salida de `fwskills --help` y los campos
`exports` y `bin` del paquete.

**agente compatible** — Un agente de IA al que una skill puede aplicarse. La
compatibilidad se declara en el campo `compatibility` del frontmatter, de modo que un
agente o su usuario puede saber, antes de instalar, si la skill le resulta aplicable.

**colección de contenido (content collection)** — Mecanismo de Astro para modelar y
validar contenido basado en archivos. En fwskills existe una colección `skills` con un
esquema Zod que valida el frontmatter de cada `SKILL.md`. Es la fuente única de verdad
del catálogo: de ella se derivan la página de catálogo, las páginas de detalle, las
páginas de categoría, el índice de búsqueda y el `sitemap.xml`.

**build time** — Momento en el que se ejecuta la compilación del sitio. En fwskills es
la única vez que se resuelven los datos que podrían variar: número de estrellas,
colaboradores, releases y fecha de actualización. Después de la compilación, el sitio
es estático y no vuelve a preguntar nada.

**token semántico** — Variable CSS cuyo nombre describe la *función* que cumple el
valor y no su apariencia. Por ejemplo, `accent` en lugar de `azul-primario`. Cada token
se define una vez por modo —claro y oscuro— y se activa mediante un atributo
`data-theme`. Este modelo sustituye a los tokens nombrados por su aspecto (ADR-07).

**workspace** — Paquete declarado dentro de un monorepo de npm y resuelto desde un
único `package-lock.json`. En fwskills los workspaces son `frontend/` y
`packages/cli/`; `skills/` **no** es un workspace, porque es contenido y no código.

**static build** — Compilación que produce archivos finales (HTML, CSS, JS) sin
servidor detrás. No hay consultas en base de datos ni lógica de negocio en el
navegador: lo que se sirve es exactamente lo que se compiló.

**npx** — Herramienta incluida con npm que descarga y ejecuta un paquete sin
instalarlo primero en el proyecto. `npx fwskills add <skill>` ejecuta el binario
`fwskills` del paquete publicado en npm, de modo que el usuario no necesita una
instalación global.

**monoespaciada** — Característica de una tipografía en la que todos los glifos
ocupan el mismo ancho horizontal. En fwskills se usa para el bloque de terminal de la
sección `Hero` y para el código en línea, porque la alineación vertical es lo que hace
legible ese contenido. En el CSS actual se obtiene con la pila de fuentes de sistema,
sin cargar una tipografía monoespaciada desde un tercero.
