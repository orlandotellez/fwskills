# Página de contribuir

## Estado Actual

No existe `frontend/src/pages/contribuir.astro`. El repositorio no tiene
`CONTRIBUTING.md`, ni `CODE_OF_CONDUCT.md`, ni carpeta `.github/` con plantillas de
issue y pull request, ni `LICENSE`. La única guía de contribución disponible está
en `specs/docs/04-buenas-practicas.md`, que es documentación interna de
especificación y no está publicada. Quien llega a `github.com` buscando cómo
contribuir una skill no encuentra ni el proceso, ni el checklist de calidad, ni
la política de scripts ejecutables, ni a quién reportar una skill maliciosa.

## Objetivo

Una página `/contribuir` con ocho bloques que convierta «quiero contribuir» en un
primer pull request sin ninguna duda, y que defina con precisión qué es una skill
aceptable, quién decide y cómo se reportan los problemas.

## Alcance

- `frontend/src/pages/contribuir.astro` con los 8 bloques de la pantalla.
- Línea de tiempo de 6 pasos, cada uno con su enlace a la plantilla o al
  repositorio.
- Checklist de calidad de una skill.
- Proceso de propuesta de categoría nueva.
- Gobernanza con roles de contribuyente, revisor y mantenedor.
- Seguridad: reporte de skill maliciosa y política de scripts ejecutables.
- Recursos y banda final de acento.
- Enlaces a `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` y a las plantillas del
  repositorio.

## Fuera de alcance

- La existencia física de `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE` y las
  plantillas en `.github/`: son archivos del repositorio. Esta página los enlaza;
  crearlos es parte del mismo cambio y su ausencia hace que los enlaces devuelvan
  404.
- `npm run validate`, el paso 4 de la línea de tiempo: se implementa en
  [`../backend/05-validacion-de-skills.md`](../backend/05-validacion-de-skills.md).
- La colección y el esquema que validan una `SKILL.md`: viven en
  [`03-colecciones-de-contenido.md`](./03-colecciones-de-contenido.md).
- La ficha que documenta los 8 campos de frontmatter, `/docs/anatomia-de-una-skill`:
  vive en [`08-docs-starlight.md`](./08-docs-starlight.md).
- Los componentes compartidos que consume la página: viven en
  [`02-componentes-globales.md`](./02-componentes-globales.md).
- Cualquier sistema de cuentas, roles técnicos, permisos de escritura o
  administración del contenido. Publicar una skill es un cambio en el
  repositorio, revisado por pull request.
- Cualquier almacenamiento de las casillas del checklist: la página las muestra
  como texto de referencia, sin persistencia, porque no hay backend donde
  guardarlas.

## Tareas

- [ ] 1. Crear `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE` y las plantillas del repositorio
  - Detalle de implementación: `LICENSE` con la licencia MIT; `CONTRIBUTING.md`
  con el proceso completo de contribución; `CODE_OF_CONDUCT.md` con la norma de
  conducta; `.github/PULL_REQUEST_TEMPLATE.md` con el checklist de calidad de la
  página y `.github/ISSUE_TEMPLATE/` con las plantillas de skill maliciosa y de
  problema general. Todos están fuera de `frontend/` porque son archivos del
  repositorio, no del sitio, y la página se limita a enlazarlos.
- [ ] 2. Crear `src/pages/contribuir.astro` con título, breadcrumb y bloque Hero
  - Detalle de implementación: un único `<h1>` «Construyamos esto juntos», un
  párrafo introductorio y dos botones: «Ver issues abiertos» al repositorio y
  «Leer CONTRIBUTING» a `CONTRIBUTING.md`. `Breadcrumbs.astro` con
  `Inicio / Contribuir`. El número de skills y de contribuidores, si aparecen,
  salen de la colección y de las métricas de build, nunca de una cifra escrita a
  mano.
- [ ] 3. Construir la línea de tiempo vertical de 6 pasos
  - Detalle de implementación: `fork → crear la carpeta en la categoría correcta →
  rellenar el SKILL.md con su frontmatter → validar localmente con npm run
  validate → abrir un PR con la plantilla → revisión y merge`. Cada paso lleva su
  enlace: la plantilla de pull request, el repositorio y la plantilla de issue.
  La línea de tiempo es vertical en todas las plataformas, con la línea conectora
  visible en móvil.
- [ ] 4. Redactar el checklist de calidad de una skill
  - Detalle de implementación: seis puntos comprobables —descripción clara de la
  tarea que resuelve, casos de uso concretos, ejemplos ejecutables, sin secretos
  ni datos personales, licencia compatible y probada con al menos un agente
  compatible—. Se muestra como lista de referencia, **sin casillas
  interactivas**: no hay backend donde persistirlas, y una casilla que se borra al
  recargar sería peor que un texto.
- [ ] 5. Documentar el proceso de propuesta de una categoría nueva
  - Detalle de implementación: los pasos para abrir una issue que proponga un
  área, los criterios de aceptación —un área con al menos tres skills
  reutilizables y una descripción de qué resuelve— y el hecho explícito de que esa
  propuesta **sí** toca código, en un único archivo: `src/lib/categories.ts`, que
  es el punto de presentación de categorías. El contenido de la categoría, en
  cambio, no toca nada: añadir la carpeta es suficiente (ADR-05).
- [ ] 6. Construir el bloque de gobernanza con los tres roles
  - Detalle de implementación: tarjetas de rol —contribuyente, revisor y
  mantenedor— en grilla 3/2/1, con qué puede hacer cada uno y qué no. La sección
  explica cómo se toman las decisiones —revisión por pull request con al menos una
  aprobación—, cómo se acredita a quienes contribuyen y qué se espera de una
  persona que pasa de revisor a mantenedor.
- [ ] 7. Construir el bloque de seguridad con el reporte y la política de scripts
  - Detalle de implementación: dos partes. La primera explica cómo reportar una
  skill maliciosa o vulnerable, con un enlace a un issue pre-etiquetado con la
  categoría `security` y qué se espera después de reportar. La segunda declara la
  política de scripts ejecutables dentro de una skill: una skill puede incluir
  `scripts/`, los scripts deben declararse en el frontmatter, un script no
  declarado no se instala, todo script requiere revisión obligatoria antes de
  fusionar y una skill de la categoría `security` no incluye scripts. La sección
  dice con claridad que `npx fwskills add` copia los scripts y no los ejecuta:
  el punto de control es el pull request, no la instalación.
- [ ] 8. Construir el bloque de recursos y la banda final
  - Detalle de implementación: enlaces a `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, la plantilla de pull request, las plantillas de issue,
  `LICENSE` y la guía de seguridad. La banda final usa fondo `var(--accent-soft)`
  con texto `var(--accent)`, un único botón «Abrir mi primer PR» a la plantilla y,
  en móvil, los botones apilados.
- [ ] 9. Verificar que ningún enlace de la página da 404
  - Detalle de implementación: cada ruta enlazada —`CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `LICENSE`, la plantilla de pull request y las plantillas
  de issue— existe en el repositorio tras la tarea 1, y el recorrido E2E de
  navegación las recorre. Un enlace a un archivo que no existe en el repositorio es
  un enlace roto, y en una página cuyo propósito es dar primeros pasos, un enlace
  roto anula el propósito.
- [ ] 10. Añadir el enlace de salto al contenido y comprobar la jerarquía
  - Detalle de implementación: un único `<h1>`, un único `<main>`, encabezados `h2`
  por bloque y `h3` dentro de ellos, sin saltos de nivel. Cada icono decorativo
  lleva `aria-hidden="true"` y todo objetivo táctil mide al menos 44×44px en
  móvil.

## Criterios de Done

- [ ] `/contribuir` renderiza 8 bloques en orden: Hero, Línea de tiempo, Checklist de calidad, Nueva categoría, Gobernanza, Seguridad, Recursos y banda final.
- [ ] La línea de tiempo tiene 6 pasos numerados y cada uno enlaza a un destino real: la plantilla de pull request, el repositorio o la plantilla de issue.
- [ ] El paso 4 nombra `npm run validate` y ese comando existe y funciona sobre `skills/**/SKILL.md`.
- [ ] El checklist de calidad es texto de referencia: no hay inputs, ni casillas persistidas, ni ninguna llamada de red que las guarde.
- [ ] El bloque de nueva categoría dice con claridad que añadir contenido no toca `frontend/` y que la única excepción es `src/lib/categories.ts`, por ser datos de presentación.
- [ ] El bloque de gobernanza define los roles de contribuyente, revisor y mantenedor y explica el proceso de decisión por pull request.
- [ ] El bloque de seguridad enlaza a un issue con la categoría `security` ya seleccionada y declara la política de scripts ejecutables, incluida la prohibición de scripts en skills de la categoría `security`.
- [ ] La banda final tiene fondo `--accent-soft` con texto `--accent` y su botón apunta a la plantilla de pull request.
- [ ] Ningún enlace interno ni externo de la página devuelve 404: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `LICENSE` y las plantillas existen en el repositorio.
- [ ] La página tiene un único `<h1>`, la jerarquía de encabezados no salta niveles y a 320px de ancho no hay scroll horizontal.
- [ ] No hay regresión en el área: `npm run check` termina con 0 errores, `npm run build` genera `dist/contribuir/index.html` y el sitio sigue sin enviar JavaScript de framework en sus páginas públicas.
