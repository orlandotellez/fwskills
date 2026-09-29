# 04 — Pantallas

Siete pantallas, todas estáticas. Todas comparten `Layout.astro`, header, footer,
design system y modo claro/oscuro.

## Convención de estados

| Estado | ¿Existe aquí? | Nota |
|---|---|---|
| `loading` | **No, por definición** | No hay peticiones de datos en runtime. Un esqueleto de carga sería una mentira arquitectónica. |
| `empty` | Sí | Catálogo sin resultados tras filtrar; búsqueda sin coincidencias; sección de destacadas vacía. |
| `error` | Sí | Búsqueda sin coincidencias; fallo de `navigator.clipboard`; 404; fallo de la métrica de GitHub. |
| `degradado` | Sí | Métricas de GitHub no disponibles: se oculta la métrica, nunca se muestra `0` ni se rompe la página. |

Todo dato de las tablas de "Datos que muestra" lleva marcado `[BUILD]`
(resuelto en `astro build` y congelado en el HTML) o `[CLIENTE]` (calculado en el
navegador a partir de datos ya presentes en la página).

---

## Mapa de pantallas

| # | Pantalla | Ruta | Archivo | Bloques / secciones |
|---|---|---|---|---|
| 1 | Inicio | `/` | `src/pages/index.astro` | 8 |
| 2 | Catálogo | `/skills` | `src/pages/skills/index.astro` | 6 |
| 3 | Ficha de skill | `/skills/[categoria]/[slug]` | `src/pages/skills/[categoria]/[slug].astro` | 9 |
| 4 | Instalación | `/instalacion` | `src/pages/instalacion.astro` | 9 |
| 5 | Documentación | `/docs/...` | `src/content/docs/**` (Starlight) | 10 |
| 6 | Contribuir | `/contribuir` | `src/pages/contribuir.astro` | 8 |
| 7 | 404 | `/404` | `src/pages/404.astro` | 4 |

---

## 1 · Inicio — `/`

### Propósito

Explicar en una pantalla qué es fwskills, dejar instalar una skill en menos de
diez segundos de lectura, y conducir a las dos acciones que importan: **explorar
el catálogo** y **contribuir**.

### Datos que muestra

| Bloque | Contenido | Origen | Momento |
|---|---|---|---|
| Hero | Licencia (MIT), número de skills, número de contribuidores | Colección `skills` + GitHub API | `[BUILD]` |
| Hero | Comando `npx fwskills add <skill>` | Literal de `public/…`/tabla de comandos | `[BUILD]` |
| Categorías | Nombre, descripción corta, icono y **conteo de skills** por subcarpeta de `skills/` | `getCollection('skills')` agrupado por `category` | `[BUILD]` |
| Skills destacadas | Hasta 6 skills con `featured: true` | Colección `skills`, filtrada y ordenada | `[BUILD]` |
| Cómo funciona | 3 pasos fijos (`01 Elegí`, `02 Instalá`, `03 Usá`) | Contenido literal | `[BUILD]` |
| Flujo de trabajo | SVG encadenado: specs → design → desarrollo → qa → security | Definido en `src/lib/categories.ts` | `[BUILD]` |
| Comunidad | Métricas: skills, contribuidores, releases | Colección + GitHub API | `[BUILD]` |
| Comunidad | Avatares de contribuidores, imágenes locales cacheadas en build, `alt` con el nombre | GitHub API → `public/contributors/` | `[BUILD]` |
| Preguntas frecuentes | 5 acordeones | Contenido literal | `[BUILD]` |
| CTA final | — | Estático | `[BUILD]` |

Ningún contador depende de una petición del visitante. Si GitHub no responde, la
sección Comunidad muestra las skills (dato local) y **omite** las métricas
remotas en lugar de mostrar `0`.

### Acciones del usuario

| Acción | Resultado |
|---|---|
| Copiar el comando del hero | Vuelve "¡Copiado!" + `aria-live` |
| Cambiar de gestor en los tabs del hero | Cambia el comando a `pnpm dlx`, `yarn dlx` o `bunx`, y se recuerda |
| "Explorar skills" (primario) | `/skills` |
| "Ver en GitHub" (secundario) | Repositorio, `target="_blank" rel="noopener"` |
| "Explorar →" en una tarjeta de categoría | `/skills?categoria=<slug>` |
| Hover en una tarjeta de categoría | Borde `accent` + desplazamiento de 4px de la flecha |
| "Ver todas →" en Skills destacadas | `/skills` |
| "Explorar →" en un paso del flujo | Categoría correspondiente en `/skills?categoria=<slug>` |
| "Contribuí con tu skill" | `/contribuir` |
| Abrir un acordeón de FAQ | Se despliega con fundido + desplazamiento |
| "Ver todas las preguntas →" | `/docs/faq` |
| "Instalar ahora" / "Contribuir" (CTA final) | `/instalacion` / `/contribuir` |
| `Ctrl/⌘+K` | Abre el modal de búsqueda global |

### Navegación desde/hacia

- **Desde**: cualquier enlace directo, el botón "Volver al inicio" del 404, el
  wordmark del header.
- **Hacia**: `/skills`, `/skills?categoria=…`, `/instalacion`, `/contribuir`,
  `/docs/faq`, repositorio de GitHub.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | Si no hay ninguna skill con `featured: true`, el bloque de destacadas se sustituye por una llamada a `/skills` |
| `error` | Métricas de GitHub no disponibles → sección renderizada sin las tres cifras remotas, con enlace al repositorio |
| `responsive` | Hero 2 columnas ≥1024px (min-height ~90vh); grillas 3/2/1; pasos apilados con línea vertical conectora en móvil; flujo de trabajo en vertical |

---

## 2 · Catálogo — `/skills`

### Propósito

Enumerar **todas** las skills del repositorio y permitir encontrarlas sin
scroll: filtrar por categoría, buscar por texto y filtrar por tag, con el
resultado siempre en una URL compartible.

### Datos que muestra

| Dato | Origen | Momento |
|---|---|---|
| Todas las skills (nombre, descripción, categoría, versión, tags, ruta) | `getCollection('skills')` serializado en la página | `[BUILD]` |
| Índice de búsqueda (`/search-index.json`) | `src/lib/search-index.ts` | `[BUILD]` |
| Chips de categoría con su conteo | Derivados de los subdirectorios de `skills/` | `[BUILD]` |
| Lista de tags disponibles | Unión de todos los `tags` de la colección | `[BUILD]` |
| Grid de tarjetas, contador de resultados | Todo el conjunto vive en el HTML; el contador se recalcula al filtrar | `[CLIENTE]` |

### Acciones del usuario

| Acción | Resultado |
|---|---|
| Escribir en el buscador | Filtrado en vivo sobre el conjunto embebido; normaliza a minúsculas, busca en nombre, descripción y tags |
| Pulsar un chip de categoría | Activa ese valor; el chip activo usa `accent-soft` con texto `accent` |
| Pulsar "Todas" | Quita el filtro de categoría |
| Elegir un tag | Asigna `?tag=` |
| Elegir orden (alfabético / más reciente / destacadas) | Reordena el grid |
| Copiar comando desde la tarjeta | Copia `npx fwskills add <categoria>/<slug>` sin navegar |
| Abrir una tarjeta | Ficha de la skill |
| "limpiar filtros" (estado vacío) | Borra todos los parámetros de la URL y repone el grid completo |

### Navegación desde/hacia

- **Desde**: "Explorar skills" del hero; tarjeta de categoría con `?categoria=`;
  breadcrumb de la ficha de skill; enlace del footer.
- **Hacia**: `/skills/[categoria]/[slug]`; `?categoria=`, `?q=`, `?tag=` son
  estados compartibles y enlazables.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | Mensaje claro: "No hay skills que coincidan con los filtros." + botón "limpiar filtros" |
| `error` | Si el buscador no puede leer el índice embebido, la búsqueda se desactiva con un texto explicativo; el catálogo completo sigue navegable |
| `responsive` | Grilla 3/2/1; la barra de filtros hace scroll horizontal en móvil (único elemento con scroll horizontal permitido, junto a los bloques de código) |

---

## 3 · Ficha de skill — `/skills/[categoria]/[slug]`

### Propósito

Documentar una skill completa y permettre instalarla con un clic, sin abandonar
la página.

### Datos que muestra

| Dato | Origen | Momento |
|---|---|---|
| `name`, `description`, `category`, `version`, `author`, `tags`, `compatibility` | Frontmatter de `SKILL.md`, validado por Zod | `[BUILD]` |
| Cuerpo del `SKILL.md` | Renderizado con resaltado de sintaxis | `[BUILD]` |
| Secciones "Cuándo usarla" / "Cuándo no" | Frontmatter o secciones convencionales del `SKILL.md` | `[BUILD]` |
| Árbol de archivos de la skill (`references/`, `scripts/`, `assets/`) con enlaces a GitHub | Filesystem en build + URL del repo | `[BUILD]` |
| Fecha de última actualización | GitHub API (último commit del path), o fecha de build como respaldo | `[BUILD]` |
| Tabla de contenidos pegajosa | Extraída del `SKILL.md` en build | `[BUILD]` |
| Skills relacionadas (3) | Misma categoría o tags compartidos | `[BUILD]` |
| `og:image` específica de la skill | Generada en build | `[BUILD]` |

### Acciones del usuario

| Acción | Resultado |
|---|---|
| Copiar `npx fwskills add <categoria>/<skill>` | "¡Copiado!" + `aria-live` |
| Cambiar de gestor en los tabs | Comando equivalente; se recuerda entre páginas |
| Seguir las instrucciones de copia manual | Bloque con la ruta de destino a mano |
| Pulsar un enlace del TOC lateral | Desplaza a la sección; resalta la activa |
| "Ver en GitHub" | Abre el `SKILL.md` en GitHub |
| "Editar esta skill" | Abre GitHub con la ruta de edición del `SKILL.md` |
| "Reportar un problema" | Abre un issue con título pre-rellenado: skill + categoría + versión |
| Seguir un enlace del árbol de archivos | Abre el archivo en GitHub |
| Abrir una skill relacionada | Otra ficha |

### Navegación desde/hacia

- **Desde**: el catálogo; `/docs/categorias/<slug>`; el buscador `Ctrl/⌘+K`;
  enlaces a GitHub.
- **Hacia**: breadcrumb (`Inicio / Skills / <Categoría> / <Skill>`), `/skills`,
  `/docs/anatomia-de-una-skill`, `/docs/crear-una-skill`, `/docs/compatibilidad`,
  `/docs/versionado`, la página de su categoría, GitHub.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | No aplica: la ruta existe porque `getStaticPaths` la generó. Un slug inexistente cae al 404 |
| `error` | Si el `SKILL.md` fuera inválido, el build ya falló; en runtime no hay estado de error de contenido |
| `responsive` | Sidebar TOC pegajoso en escritorio; en móvil se colapsa **por encima** del contenido |

---

## 4 · Instalación — `/instalacion`

### Propósito

Explicar, sin ambigüedad, cómo instalar el CLI y cómo instalar skills con él,
incluidos los errores habituales.

### Datos que muestra

| Dato | Origen | Momento |
|---|---|---|
| Versión mínima de Node | `engines.node` de `package.json` (`>=22.12.0`) | `[BUILD]` |
| Comandos por gestor (npx / pnpm dlx / yarn dlx / bunx) | Generados desde una tabla única | `[BUILD]` + `[CLIENTE]` en el tab activo |
| Carpetas de destino por agente | Detección en build + defaults del CLI | `[BUILD]` |
| Tabla de flags (6) | Constante compartida con el módulo `backend` | `[BUILD]` |
| Lista de comandos (7) | Constante compartida con el módulo `backend` | `[BUILD]` |

### Secciones

| # | Sección | Contenido |
|---|---|---|
| 1 | Requisitos | Versión mínima de Node, terminal, gestor de paquetes |
| 2 | Uso sin instalar | `npx fwskills …`, `pnpm dlx`, `yarn dlx`, `bunx`; cada comando es copiable |
| 3 | Instalación global y como dependencia de desarrollo | `npm i -g fwskills`; `npm i -D fwskills` y `pnpm add -D` |
| 4 | Comandos disponibles | Los 7 comandos con una línea de descripción y enlace a `/docs/cli/<comando>` |
| 5 | Dónde se instalan las skills | Carpeta de destino por defecto de cada agente compatible y cómo cambiarla con `--dir` |
| 6 | Flags principales | Tabla de 3 columnas: flag / descripción / ejemplo (6 filas) |
| 7 | Verificar la instalación | `npx fwskills list` y `npx fwskills info <categoria>/<skill>` |
| 8 | Solución de problemas comunes | Acordeones: destino no detectado, archivos existentes, permisos, Node antiguo, skill no encontrada |
| 9 | Versionado y actualización | `npx fwskills update`, `update <skill>`, caché |
| — | Cierre | CTA a `/skills` y `/docs` |

### Acciones del usuario

| Acción | Resultado |
|---|---|
| Copiar cualquier comando | "¡Copiado!" + `aria-live` |
| Cambiar de gestor | Sincroniza **todos** los grupos de tabs de la página y se recuerda |
| Navegar por el índice lateral | Desplaza a la sección |
| Desplegar un acordeón de la sección 8 | Animación + `aria-expanded` |
| Seguir un enlace de comando | `/docs/cli/<comando>` |

### Navegación desde/hacia

- **Desde**: "Instalar ahora" del hero y del CTA final; comando del hero;
  bloque de instalación de cada ficha de skill.
- **Hacia**: `/skills`, `/docs`, `/docs/cli/<comando>`.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | No aplica |
| `error` | La sección 8 cubre los fallos del CLI, pero el contenido de la página es estático y nunca está en error |
| `responsive` | Columna de texto de 820px con índice lateral pegajoso ≥1024px; en móvil el índice se convierte en enlaces desplegables al inicio |

---

## 5 · Documentación — `/docs/...`

### Propósito

Documentar el CLI comando por comando y explicar cómo crear, versionar y
publicar una skill, con navegación profunda, buscador y ejemplos copiables.

### Datos que muestra

| Dato | Origen | Momento |
|---|---|---|
| Contenido Markdown | `src/content/docs/**` | `[BUILD]` |
| Índice de búsqueda global (incluye las skills) | `search-index.json` | `[BUILD]` |
| Índice lateral agrupado | `docs.config.ts` (ADR-04) | `[BUILD]` |
| Índice derecho de la página | Generado por Starlight del propio Markdown | `[BUILD]` |
| Anterior / siguiente | Derivado del orden de la navegación | `[BUILD]` |
| Contadores de GitHub del encabezado de docs | GitHub API | `[BUILD]` |

### Las 10 secciones

| # | Sección | Ruta | Qué documenta |
|---|---|---|---|
| 1 | Introducción | `/docs/introduccion` | Qué es fwskills, qué es una skill, cómo encaja el CLI |
| 2 | Primeros pasos | `/docs/primeros-pasos` | Del cero a la primera skill instalada, con comandos copiables |
| 3 | CLI — un comando por página | `/docs/cli/{init,list,search,add,remove,update,info}` | Referencia completa de los 7 comandos: sintaxis, opciones, ejemplos, errores |
| 4 | Anatomía de una skill | `/docs/anatomia-de-una-skill` | Los 8 campos de frontmatter, el cuerpo del `SKILL.md`, las carpetas `references/`, `scripts/`, `assets/` |
| 5 | Categorías | `/docs/categorias/{specs,design,qa,security}` | Qué resuelve cada área, qué se espera de una skill de cada una |
| 6 | Crear una skill | `/docs/crear-una-skill` | Guion completo: carpeta, frontmatter, validación local, PR |
| 7 | Compatibilidad | `/docs/compatibilidad` | Agentes soportados, qué significa el campo `compatibility` |
| 8 | Versionado | `/docs/versionado` | Semver en las skills, `update`, releases del CLI |
| 9 | FAQ | `/docs/faq` | Versión larga de las preguntas de Inicio |
| 10 | Changelog | `/docs/changelog` | Novedades del CLI y del sitio por versión |

### Acciones del usuario

| Acción | Resultado |
|---|---|
| `Ctrl/⌘+K` | Abre el buscador; navegación por flechas; Enter lleva a la página |
| Desplegar el sidebar en móvil | Drawer accesible con foco atrapado y cierre con `Esc` |
| Seguir un enlace de anclaje | Todos los encabezados tienen ancla copiable |
| Copiar código | Botón "Copiar" con "¡Copiado!" |
| Cambiar de pestaña de contenido | Pestañas dentro de la página, sin recarga |
| Anterior / siguiente | Navegación entre páginas del docs, al pie del contenido |
| "Editar esta página en GitHub" | Abre el `.md` correspondiente en GitHub |

### Navegación desde/hacia

- **Desde**: el header; el CTA de cierre de `/instalacion`; "Ver todas las
  preguntas →" de Inicio; enlaces desde las fichas de skill.
- **Hacia**: cualquier sección de docs; GitHub; `/skills`.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | El buscador sin resultados muestra un mensaje y sugiere limpiar la consulta |
| `error` | Una ruta `/docs/inexistente` cae al 404 del sitio |
| `responsive` | Escritorio: tres zonas (sidebar / contenido ≤760px / TOC pegajoso). Tablet: sidebar colapsable. Móvil: sidebar como drawer, TOC colapsado antes del contenido |

---

## 6 · Contribuir — `/contribuir`

### Propósito

Convertir "quiero contribuir" en un primer PR sin ninguna duda, y definir con
precisión qué es una skill aceptable, quién decide y cómo se reportan problemas.

### Datos que muestra

| Dato | Origen | Momento |
|---|---|---|
| Número de skills y de contributors (si aparece) | Colección + GitHub API | `[BUILD]` |
| Checklist de calidad | Contenido literal | `[BUILD]` |
| Rutas de plantilla de issue y PR | Rutas fijas en el repositorio | `[BUILD]` |
| Enlaces a `CONTRIBUTING.md` y `CODE_OF_CONDUCT.md` | Rutas fijas | `[BUILD]` |

### Los 8 bloques

| # | Bloque | Contenido |
|---|---|---|
| 1 | Hero | H1 "Construyamos esto juntos", párrafo, botones "Ver issues abiertos" y "Leer CONTRIBUTING" |
| 2 | Línea de tiempo | Vertical numerada: fork → crear la carpeta en la categoría correcta → rellenar el `SKILL.md` con su frontmatter → validar localmente (`npm run validate`) → abrir un PR con la plantilla → revisión y merge |
| 3 | Checklist de calidad de una skill | Descripción clara, casos de uso, ejemplos, sin secretos ni datos personales, licencia compatible, probada con al menos un agente |
| 4 | Proponer una nueva categoría | Proceso y criterios de aceptación |
| 5 | Gobernanza | Tarjetas de rol (contribuyente, revisor, mantenedor), cómo se toman las decisiones, cómo se acredita a quienes contribuyen |
| 6 | Seguridad | Cómo reportar una skill maliciosa o vulnerable, y la política sobre scripts ejecutables dentro de una skill |
| 7 | Recursos | `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, plantillas de issue y PR |
| 8 | Banda final | Fondo de acento, CTA "Abrir mi primer PR" |

### Acciones del usuario

| Acción | Resultado |
|---|---|
| Seguir un paso de la línea de tiempo | Enlaces al repositorio y a la plantilla de PR |
| Marcar mentalmente el checklist | No es interactivo: es texto de referencia, deliberadamente sin checkboxes persistidos (no hay backend donde guardarlos) |
| Reportar una skill maliciosa | Enlace prefijado a un issue con la categoría "security" |
| Abrir el primer PR | Enlace a la plantilla de PR del repositorio |

### Navegación desde/hacia

- **Desde**: "Contribuí con tu skill" (Inicio), columna Comunidad del footer,
  enlaces del CLI hacia `/docs/crear-una-skill`.
- **Hacia**: repositorio, issues, plantillas, `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `/docs/crear-una-skill`.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | No aplica |
| `error` | No aplica (contenido estático) |
| `responsive` | Línea de tiempo vertical en todas las plataformas; tarjetas de rol en 3/2/1; banda final con apilado de botones |

---

## 7 · 404

### Propósito

Cerrar el camino con el mismo tono del sitio: una persona que llega a una URL
inexistente debe entender qué pasó y tener dos salidas en un clic.

### Datos que muestra

| Dato | Origen | Momento |
|---|---|---|
| Ilustración de línea | SVG inline en la paleta (`base`, `surface-elevated`, `accent`) | `[BUILD]` |
| Mensaje | Literal: "Esta skill no existe… todavía" | `[BUILD]` |
| Enlaces de salida | `/skills`, `/docs`, `/` | `[BUILD]` |

### Acciones del usuario

| Acción | Resultado |
|---|---|
| "Volver al inicio" (primario) | `/` |
| Seguir el enlace secundario al catálogo | `/skills` |
| Seguir el enlace secundario a la documentación | `/docs` |

### Navegación desde/hacia

- **Desde**: cualquier URL inexistente del sitio, incluidos slugs de categoría o
  de skill que no existen.
- **Hacia**: `/`, `/skills`, `/docs`.

### Estados

| Estado | Comportamiento |
|---|---|
| `loading` | No aplica |
| `empty` | No aplica |
| `error` | Es, en sí mismo, la representación del estado de error |
| `responsive` | Contenido centrado en una sola columna, sin breadcrumbs, sin grid |
