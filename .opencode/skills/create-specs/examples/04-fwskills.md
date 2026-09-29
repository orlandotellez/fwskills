# Prompt de specs: Skills comunitarias (repo + landing + paquete npm)

> /create-specs Generá las specs del siguiente proyecto.
>
> **Proyecto**: **landing page, catálogo y documentación** de un proyecto comunitario de skills para agentes de IA (nombre provisional: **"[NOMBRE_DEL_PROYECTO]"**), construido con **Astro**, **100% estático** (sin backend, sin base de datos, sin login, sin panel administrativo).
>
> El sitio vive en la carpeta `frontend/` de un repositorio que también tiene una carpeta `skills/`, organizada en subcarpetas por área (`specs`, `design`, `qa`, `security` y las que se agreguen). Cada skill es una carpeta con un archivo `SKILL.md` (con frontmatter: `name`, `description`, `category`, `version`, `author`, `tags`, `compatibility`, `featured`). **Todo el contenido del catálogo se genera en build time a partir de esas carpetas**: agregar una skill o una categoría nueva no requiere editar el frontend. Los datos dinámicos (estrellas de GitHub, contribuyentes, releases, fecha de última actualización) también se resuelven en build.
>
> Las skills se distribuyen como **paquete npm** con un comando `npx [NOMBRE_DEL_PROYECTO] add <skill>`. El sitio debe explicar la instalación y tener documentación completa.
>
> ---
>
> ## 0. Mapa del sitio
>
> 1. **Inicio** (`/`)
> 2. **Catálogo de skills** (`/skills`)
> 3. **Ficha de skill** (`/skills/[categoria]/[slug]`), una por cada skill
> 4. **Instalación** (`/instalacion`)
> 5. **Documentación** (`/docs/...`), multipágina con sidebar
> 6. **Contribuir** (`/contribuir`)
> 7. **404**
>
> Todas comparten header, footer, sistema de diseño y modo claro/oscuro.
>
> ---
>
> ## 1. Sistema de diseño (aplica a TODO el sitio)
>
> ### 1.1 Paleta (en lenguaje natural)
> Estilo **técnico, limpio y moderno**, pensado para desarrolladores. Modo claro: fondo casi blanco. Modo oscuro: fondo casi negro. Texto principal de alto contraste, texto secundario en gris neutro. **Un color de acento principal [ELEGIR: violeta / verde / azul eléctrico]** para enlaces, botones primarios y estados activos, y un acento secundario suave para etiquetas y resaltados. Bordes finos y discretos. Éxito en verde suave, error en rojo suave, advertencia en ámbar.
>
> **Regla**: no definas valores hex en este prompt. Traducí esta descripción a un sistema de diseño con roles semánticos (`base`, `surface`, `surface-elevated`, `border`, `text`, `text-secondary`, `text-muted`, `accent`, `success`, `warning`, `error`) para **modo claro y oscuro**, con contraste AA en todo el texto y una escala derivada del acento para hover, focus y fondos suaves. Incluí también la paleta del **resaltado de sintaxis** de los bloques de código.
>
> ### 1.2 Tipografía
> Una sans moderna (ej. **Inter**) para interfaz y texto, y una **monoespaciada** (ej. JetBrains Mono o Geist Mono) para código, comandos y nombres de skills.
> - Escala: display 60px/1.1 (hero), H1 44px/1.15, H2 34px/1.2, H3 24px/1.3, H4 19px/1.3, body 17px/1.6, body pequeño 15px/1.6, caption 13px/1.4, código 14px/1.6.
> - Jerarquía por tamaño y peso (500/600), nunca solo por color.
>
> ### 1.3 Espaciado, formas y sombras
> Secciones separadas por 96–120px en la landing. Contenedor máximo de 1200px (760–820px en texto largo de docs). Radios de 8–12px en tarjetas y 999px en chips. Sombras mínimas, preferir bordes finos. Sin neumorfismo ni sombras duras.
>
> ### 1.4 Animaciones
> Solo reveal al scroll (fade-up 400ms, `ease-out`) y hovers discretos. `prefers-reduced-motion: reduce` las desactiva. Sin parallax, sin autoplay, sin marquesinas.
>
> ### 1.5 Responsive
> Desktop ≥1024px · tablet 768–1023px · móvil <768px. Sin scroll horizontal no intencional (excepciones: bloques de código y chips de filtro en móvil).
>
> ### 1.6 Accesibilidad
> Contraste AA, focus visible en todo elemento interactivo, navegación completa por teclado, un solo `<h1>` por página, encabezados en orden jerárquico, `<label>` asociado a cada input, iconos decorativos con `aria-hidden`, mensajes dinámicos con `aria-live="polite"`.
>
> ### 1.7 SEO y rendimiento
> `<title>` y `meta description` únicos por página, Open Graph y Twitter Card (con `og:image` generada en build para cada skill), `sitemap.xml`, `robots.txt`, slugs en minúsculas con guiones y sin tildes. Objetivo Lighthouse ≥ 95 en todas las categorías.
>
> ---
>
> ## 2. Componentes globales
>
> ### 2.1 Header fijo
> - Logo/wordmark a la izquierda (linkea a Inicio).
> - Enlaces: **Skills · Instalación · Docs · Contribuir**. Ítem activo con subrayado permanente de 2px. Hover con subrayado animado.
> - Derecha: **buscador** (abre modal con atajo `Ctrl/⌘+K`, busca en skills y docs), enlace a **GitHub con contador de estrellas** (resuelto en build) y **toggle claro/oscuro** (respeta la preferencia del sistema y la recuerda).
> - Al hacer scroll de 40px+: fondo translúcido con `backdrop-filter: blur` y borde inferior fino.
> - **Móvil**: menú hamburguesa que anima a ✕, panel a pantalla completa, `aria-expanded`, foco atrapado, cierre con ✕, tocando fuera o con `Esc`, y scroll del body bloqueado mientras está abierto.
>
> ### 2.2 Bloque de código
> Fondo `surface-elevated`, etiqueta de lenguaje, botón **"Copiar"** con confirmación visual ("¡Copiado!") y `aria-live`, scroll horizontal interno si desborda, resaltado de sintaxis.
>
> ### 2.3 Tabs de gestor de paquetes
> `npm · pnpm · yarn · bun`. La elección se recuerda entre páginas (localStorage) y se sincroniza entre todos los bloques de la misma página.
>
> ### 2.4 Tarjeta de skill
> Nombre (monoespaciada), descripción (máx 2 líneas con elipsis), badges de categoría y versión, tags, botón **"Ver skill"** y botón rápido **"Copiar comando"**.
>
> ### 2.5 Badges
> Categoría (con color según categoría), versión, compatibilidad, autor.
>
> ### 2.6 Breadcrumbs
> En todas las páginas excepto Inicio. Caption 13px, separador `/`, último ítem sin link.
>
> ### 2.7 Acordeón
> Pregunta con ícono `+` que rota a `×`, contenido con fade y slide suave, `aria-expanded` y `aria-controls` correctos.
>
> ### 2.8 Footer
> Fondo `surface`, borde superior fino, 4 columnas (desktop) / 2 (tablet) / 1 (móvil), idéntico en todas las páginas.
> - **Marca**: wordmark, una línea descriptiva e íconos de GitHub, npm y comunidad (Discord u otra, opcional).
> - **Producto**: Skills · Instalación · Docs · Changelog.
> - **Comunidad**: Contribuir · Código de conducta · Gobernanza · Reportar un problema.
> - **Recursos**: GitHub · npm · Licencia · Seguridad.
> - Barra final: "© 2026 [NOMBRE_DEL_PROYECTO]. Proyecto open source bajo licencia [LICENCIA]. Hecho por la comunidad."
>
> ---
>
> ## 3. PÁGINA: INICIO (`/`)
>
> ### 3.1 Hero
> Layout de 2 columnas en desktop (texto + comando de instalación / visual), columna única en móvil. Min-height ~90vh.
> - Eyebrow: **SKILLS COMUNITARIAS PARA AGENTES DE IA**.
> - H1 display de 1–2 líneas con la propuesta de valor (proponé 3 alternativas y dejá una como principal).
> - Párrafo (máx 560px): qué es el proyecto, para quién y por qué es comunitario.
> - **Comando de instalación destacado**: bloque de código con copiar y tabs de gestor, `npx [NOMBRE_DEL_PROYECTO] add <skill>`.
> - Botones: **Explorar skills** (primario, a `/skills`) · **Ver en GitHub** (secundario).
> - Micro-línea: licencia, cantidad de skills y cantidad de contribuyentes (calculados en build).
>
> ### 3.2 Categorías
> - H2 **"Una skill para cada etapa"** + párrafo corto.
> - Grid de tarjetas, una por cada carpeta de `skills/` (**Specs · Design · QA · Security** y las que se agreguen), generadas automáticamente.
> - Cada tarjeta: ícono, nombre, descripción corta, cantidad de skills y enlace **"Explorar →"** a `/skills?categoria=slug`. Hover con borde de acento y flecha que se desplaza 4px.
> - Desktop: 4 columnas. Tablet: 2. Móvil: 1.
>
> ### 3.3 Skills destacadas
> - H2 **"Skills destacadas"** + enlace **"Ver todas →"**.
> - 6 skills marcadas con `featured: true`, usando la tarjeta de skill (2.4) con comando de instalación copiable.
> - Grid de 3 columnas (desktop) / 2 (tablet) / 1 (móvil).
>
> ### 3.4 Cómo funciona
> - H2 **"Así de simple"**. Tres pasos en 3 columnas (desktop) / apilados con línea conectora vertical (móvil).
> - **01 Elegí**: explorá el catálogo. **02 Instalá**: un comando (mini bloque de código). **03 Usá**: tu agente detecta la skill y la aplica.
> - Número grande tenue + ícono lineal + título + descripción.
>
> ### 3.5 Flujo de trabajo sugerido
> - H2 + párrafo. Diagrama SVG inline que encadena las categorías: **specs → design → desarrollo → qa → security**.
> - Cada etapa enlaza a su categoría en el catálogo. En móvil, el diagrama se vuelve vertical.
>
> ### 3.6 Comunidad
> - H2 **"Hecho por la comunidad"** + párrafo.
> - Métricas (skills, contribuyentes, releases) en fila de 3 números grandes.
> - Avatares de contribuyentes (imágenes locales cacheadas en build, con `alt` con el nombre).
> - CTA **"Contribuí con tu skill"** (a `/contribuir`).
>
> ### 3.7 Preguntas frecuentes (adelanto)
> - H2 + 4–5 acordeones: ¿Qué es una skill? · ¿Con qué agentes funciona? · ¿Es gratis? · ¿Cómo contribuyo? · ¿Cómo se revisa la calidad?
> - Enlace **"Ver todas las preguntas →"** a `/docs/faq`.
>
> ### 3.8 CTA final
> Banda con fondo de acento, texto centrado: H2, párrafo corto y botones **Instalar ahora** (a `/instalacion`) + **Contribuir** (a `/contribuir`).
>
> ---
>
> ## 4. PÁGINA: CATÁLOGO (`/skills`)
>
> - **Cabecera**: H1 **"Catálogo de skills"** + párrafo + breadcrumb.
> - **Barra de filtros**:
>   - Chips por categoría (generados automáticamente, con "Todas"), scroll horizontal en móvil.
>   - Buscador en tiempo real (client-side, índice generado en build).
>   - Filtro por tags.
>   - Orden: alfabético · más recientes · destacadas.
> - El estado de filtros vive en la URL (`?categoria=&q=&tag=`) y es compartible.
> - **Grid**: 3 columnas (desktop) / 2 (tablet) / 1 (móvil), con la tarjeta de skill (2.4). Contador de resultados.
> - **Estado vacío**: mensaje claro + botón para limpiar filtros.
> - Todo generado desde el contenido de `skills/`, sin listas hardcodeadas.
>
> ---
>
> ## 5. PÁGINA: FICHA DE SKILL (`/skills/[categoria]/[slug]`)
>
> Plantilla única generada desde cada `SKILL.md`.
>
> - **Breadcrumb**: `Inicio / Skills / [Categoría] / [Skill]`.
> - **Cabecera**: H1 con el nombre, badges (categoría, versión, compatibilidad), autor(es) con enlace a GitHub, fecha de última actualización.
> - **Bloque de instalación**: tabs de gestor + copiar, `npx [NOMBRE_DEL_PROYECTO] add <categoria>/<skill>`, más instrucción alternativa de copia manual.
> - **Cuándo usarla / cuándo no**: extraído del frontmatter o de secciones convencionales del `SKILL.md`.
> - **Contenido**: el `SKILL.md` renderizado con resaltado de sintaxis, y **tabla de contenidos lateral sticky** en desktop (colapsada arriba en móvil).
> - **Archivos de la skill**: árbol (`references/`, `scripts/`, `assets/`) con enlace al código en GitHub.
> - **Acciones**: **Ver en GitHub** · **Editar esta skill** (abre la edición en GitHub) · **Reportar un problema** (issue prellenado).
> - **Skills relacionadas**: grid de 3 tarjetas por misma categoría o tags en común.
>
> ---
>
> ## 6. PÁGINA: INSTALACIÓN (`/instalacion`)
>
> Guía paso a paso, con tabs de gestor de paquetes y todos los comandos copiables. Layout de texto de 820px con índice lateral sticky en desktop.
>
> 1. **Requisitos**: versión mínima de Node.
> 2. **Uso sin instalar**: `npx [NOMBRE_DEL_PROYECTO] ...`.
> 3. **Instalación global y como dependencia de desarrollo**.
> 4. **Comandos disponibles**: `init`, `list`, `search`, `add <skill>`, `add --category <cat>`, `remove`, `update`, `info`, cada uno con su descripción y ejemplo.
> 5. **Dónde se instalan las skills**: carpeta de destino por defecto para cada agente compatible, y cómo cambiarla.
> 6. **Flags principales**: `--dir`, `--global`, `--force`, `--dry-run`, `--yes` (tabla de 3 columnas: flag / descripción / ejemplo).
> 7. **Verificar la instalación**.
> 8. **Solución de problemas comunes** (acordeones).
> 9. **Versionado y actualización de skills**.
>
> Cierre con CTA hacia `/skills` y `/docs`.
>
> ---
>
> ## 7. PÁGINAS: DOCUMENTACIÓN (`/docs/...`)
>
> Sitio de documentación multipágina. Evaluá **Astro Starlight** frente a una solución propia con content collections y recomendá una, justificando la decisión.
>
> **Layout de cada página** (3 zonas en desktop):
> - **Sidebar izquierdo** con navegación agrupada y colapsable, con el ítem activo resaltado (en móvil, drawer accesible).
> - **Contenido central** (máx 760px).
> - **Tabla de contenidos derecha** sticky con resaltado de la sección visible.
> - Debajo del contenido: navegación **anterior / siguiente** y enlace **"Editar esta página en GitHub"**.
> - Búsqueda integrada (`Ctrl/⌘+K`).
>
> **Secciones y páginas**:
> 1. **Introducción**: qué es una skill, filosofía del proyecto, casos de uso.
> 2. **Primeros pasos**: instalación y primera skill.
> 3. **Referencia del CLI**: una página por comando, con sintaxis, opciones, ejemplos y salida esperada.
> 4. **Anatomía de una skill**: estructura de carpetas, esquema del frontmatter (tabla de campos), buenas prácticas de redacción y ejemplos completos.
> 5. **Categorías**: una página por categoría (`specs`, `design`, `qa`, `security`) con su propósito y la lista de sus skills. Se genera automáticamente para categorías nuevas.
> 6. **Crear una skill**: tutorial guiado de cero a PR.
> 7. **Compatibilidad**: agentes y herramientas soportadas, y cómo se instalan en cada uno.
> 8. **Versionado y releases**: SemVer, cómo se publican versiones.
> 9. **FAQ**: preguntas agrupadas por tema en acordeones.
> 10. **Changelog**: generado desde los releases del paquete.
>
> Componentes propios de docs: callouts (nota, consejo, advertencia, peligro), tabs de contenido, tablas responsivas con scroll interno, enlaces ancla en cada encabezado, bloques de código con título de archivo.
>
> ---
>
> ## 8. PÁGINA: CONTRIBUIR (`/contribuir`)
>
> - **Hero**: H1 **"Construyamos esto juntos"** + párrafo + botones **Ver issues abiertos** y **Leer CONTRIBUTING**.
> - **Flujo en pasos** (timeline vertical numerada): hacer fork → crear la carpeta de la skill en la categoría correcta → completar `SKILL.md` con el frontmatter → validar localmente (`npm run validate`) → abrir PR con la plantilla → revisión y merge.
> - **Checklist de calidad** de una skill: descripción clara, casos de uso, ejemplos, sin secretos ni datos personales, licencia compatible, probada con al menos un agente.
> - **Proponer una categoría nueva**: explicación del proceso y criterios de aceptación.
> - **Gobernanza**: tarjetas de roles (contribuyente, revisor, mantenedor), cómo se toman decisiones y cómo se reconoce a los contribuyentes.
> - **Seguridad**: cómo reportar una skill maliciosa o vulnerable y política sobre scripts ejecutables dentro de skills (revisión obligatoria).
> - **Recursos**: enlaces a `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, plantillas de issues y PR.
> - **Cierre**: banda de acento con CTA **"Abrir mi primer PR"**.
>
> ---
>
> ## 9. PÁGINA 404
>
> Mismo header y footer. Contenido centrado: ilustración lineal simple acorde a la paleta, H2 con un mensaje breve y con personalidad (ej. "Esta skill no existe... todavía"), párrafo corto, botón primario **"Volver al inicio"** y enlaces secundarios a **Catálogo** y **Docs**.
>
> ---
>
> ### REGLAS IMPORTANTES
>
> El sitio debe sentirse como una **herramienta de desarrollo seria y con identidad propia**, no como una plantilla genérica de documentación.
>
> Prioriza:
> 1. **Instalación en un comando**: el comando `npx` siempre visible, copiable y con tabs de gestor.
> 2. **Contenido dirigido por archivos**: agregar una skill o categoría = agregar una carpeta; catálogo, páginas de categoría, docs y buscador se actualizan solos.
> 3. **Documentación clara y navegable**, con búsqueda, ejemplos copiables y enlaces de edición a GitHub.
> 4. **Barra baja de contribución**: la página `/contribuir` debe permitir a alguien nuevo aportar una skill en menos de 15 minutos.
> 5. **Rendimiento y accesibilidad** verificables (Lighthouse, contraste AA, teclado completo, modo claro/oscuro).
> 6. **Consistencia visual** en todas las páginas (mismos bloques de código, badges, tarjetas y acordeones).
> 7. Todo estático: sin backend, sin base de datos, sin login, sin cuentas de usuario. Cualquier dato dinámico se resuelve en build time.
>
> No agregar panel administrativo, sistema de comentarios, ratings ni telemetría.
>
> Diseñar el **sitio completo**: Inicio, Catálogo, ficha individual por cada skill, Instalación, Documentación, Contribuir y 404, todo bajo el mismo sistema de diseño, header y footer.
