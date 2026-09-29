# 01 — Descripción del proyecto

## Qué es

fwskills es un repositorio comunitario de skills para agentes de IA, con dos
entregables que se construyen y se versionan juntos:

- **Un sitio estático** (`frontend/`) hecho con Astro 7, TypeScript y cero JavaScript
  en runtime. Contiene la landing, el catálogo de skills, las páginas de detalle por
  skill y la documentación del proyecto.
- **Un CLI en Node/TypeScript** (`cli/`) distribuido como paquete npm, que se
  invoca como `npx fwskills add <skill>` para instalar una skill en el proyecto del
  usuario.

La unidad de contenido del repositorio es la **skill**: una carpeta que contiene un
archivo `SKILL.md`. Las carpetas se organizan en subcarpetas por área —`specs`,
`design`, `qa`, `security`, y las que se agreguen— de modo que agregar un área nueva no
obliga a reorganizar lo existente.

Todo el catálogo se genera en tiempo de build a partir de esas carpetas. La regla
innegociable del proyecto es: **agregar una skill o una categoría no debe requerir
editar el frontend** (ADR-05). Los datos que podrían cambiar con el tiempo —estrellas
de GitHub, colaboradores, releases y fecha de actualización— también se resuelven en
tiempo de build, no con llamadas desde el navegador.

## Para quién

| Actor | Qué necesita | Qué encuentra |
| --- | --- | --- |
| **Visitante** | Evaluar si el repositorio le sirve antes de instalar nada. | La landing, el catálogo completo, el detalle de cada skill y la documentación, sin registro ni formulario. |
| **Desarrollador que instala** | Incorporar una skill a su proyecto sin copiar archivos a mano. | El CLI: `npx fwskills add <skill>`. |
| **Contribuyente de skills** | Compartir una skill con la comunidad. | La plantilla de `SKILL.md` con sus ocho campos de frontmatter y las categorías existentes como referencia. |
| **Mantenedor del repositorio** | Revisar y publicar contribuciones. | El proceso de revisión descrito en `04-buenas-practicas.md`; el build falla si una `SKILL.md` no cumple el esquema, lo que reduce la revisión manual. |
| **Agente de IA** | Leer la skill una vez instalada y seguir sus instrucciones. | El archivo `SKILL.md` instalado en el proyecto del usuario, cuyo frontmatter declara `compatibility` para saber si puede aplicarla. |

## Problema que resuelve

Las skills para agentes de IA se distribuyen hoy de forma fragmentada: archivos
pegados en conversaciones, enlaces sueltos en respuestas de chatbot y carpetas
repartidas entre Machines sin índice ni metadatos uniformes. Eso produce tres
problemas concretos:

1. **No hay descubrimiento.** Sin un catálogo con búsqueda y filtros, nadie encuentra
   la skill que ya existe.
2. **No hay instalación reproducible.** Copiar un archivo a mano produce proyectos que
   divergen: la misma skill en versiones distintas en dos máquinas.
3. **No hay contrato verificable.** Un `SKILL.md` sin metadatos estructurados no se
   puede validar, indexar ni clasificar automáticamente.

fwskills ataca los tres con una única decisión de diseño: **`SKILL.md` con frontmatter
de ocho campos es la unidad atómica de distribución**. El mismo archivo alimenta el
catálogo del sitio, la validación del build y la instalación por CLI. No hay una
segunda fuente de verdad que pueda desincronizarse.

El proyecto resuelve además un problema de **descentralización**: al no existir un
equipo central que apruebe cada skill, la validación se automatiza y se delega. El
build es el gate.

## Funcionalidades principales

1. **Landing estática** con secciones reutilizables: `Header`, `Hero`, `Features`,
   `DesignSkills`, `HowItWorks`, `CTA` y `Footer`, componibles desde
   `src/pages/index.astro`.
2. **Catálogo generado desde el repositorio**, derivado de las carpetas `skills/**` a
   través de una colección de contenido de Astro con esquema Zod que valida los ocho
   campos de frontmatter.
3. **Páginas de detalle por skill**, con ruta `/skills/[categoria]/[slug]`, una por
   skill, generadas también desde la misma colección.
4. **Páginas de categoría** y filtro por categoría, sin código nuevo al agregar un
   área.
5. **Búsqueda en el sitio** con índice generado en build y activación por `Ctrl`/`⌘+K`,
   sin dependencia de un servicio de búsqueda remoto.
6. **Documentación multipágina** construida con Astro Starlight, con barra lateral,
   tabla de contenidos fija con scrollspy, navegación anterior/siguiente, enlaces de
   edición en GitHub, cajón móvil y modo claro/oscuro, compartiendo encabezado, pie y
   sistema de diseño del resto del sitio (ADR-04).
7. **Modo claro y modo oscuro** mediante tokens semánticos definidos una vez por modo
   y activados con un atributo `data-theme`, con `prefers-color-scheme` como valor
   por defecto (ADR-07).
8. **CLI distribuido como paquete npm** que instala skills localmente:
   `npx fwskills add <skill>`, con `--help` como contrato legible por máquinas.
9. **SEO y metadatos generados en build**: URL canónica desde `PUBLIC_SITE_URL`,
   `sitemap.xml` y datos dinámicos del repositorio resueltos en tiempo de compilación.
10. **Verificación de tipos integrada** mediante `astro check`
    (`@astrojs/check` + TypeScript en modo estricto), disponible sin instalar nada
    nuevo.

## Fuera de alcance

Lo siguiente está excluido de forma explícita, no por falta de tiempo:

- **Backend, servidor o API HTTP.** El sitio es 100 % estático. No hay endpoints
  (ADR-01, ADR-03).
- **Base de datos, esquema, migraciones u ORM.** No hay persistencia; el modelo de
  datos es el sistema de archivos (ADR-02).
- **Autenticación, cuentas de usuario, sesiones o panel de administración.**
- **Comentarios, valoraciones, reseñas o puntuación de skills.**
- **Telemetría, analítica de terceros o cookies de seguimiento.**
- **Edición del catálogo desde el navegador.** Publicar una skill es un cambio en el
  repositorio, revisado por pull request.
- **Un modelo de roles o permisos de escritura** para los contribuyentes de skills.
- **Distribución de skills fuera de npm.** El canal de instalación es el CLI.
- **Interfaz de administración de usuarios o contenido.**
