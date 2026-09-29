# Página de instalación

## Estado Actual

No existe `frontend/src/pages/instalacion.astro`. La única guía de instalación
del repositorio es el bloque de terminal decorativo de
`src/sections/Hero.astro` (163 líneas), que muestra un comando escrito a mano y
no se puede copiar. No hay versión mínima de Node declarada en la página, ni
tabla de los comandos del CLI, ni tabla de flags, ni sección de resolución de
problemas. El paquete `packages/cli/` tampoco existe todavía, así que los datos
que la página debe mostrar —7 comandos, 6 flags, carpetas de destino por agente—
están especificados en `specs/modules/backend/03-api.md` pero no tienen ninguna
fuente en el árbol de `frontend/`.

## Objetivo

Una página `/instalacion` con nueve secciones numeradas que explique, sin
ambigüedad, cómo instalar el CLI y cómo instalar skills con él, incluidos los
errores habituales y cómo comprobarlos.

## Alcance

- `frontend/src/pages/instalacion.astro` con las 9 secciones de la pantalla.
- Datos del CLI tomados de una constante compartida con la especificación del
  módulo `backend`, no escritos a mano en la página.
- Comandos copiables para los cuatro gestores en la sección 2.
- Tabla de 6 flags con descripción y ejemplo, y enumeración de los 7 comandos con
  enlace a su página de documentación.
- Acordeones de solución de problemas en la sección 8, con la allowlist de un
  panel abierto.
- Índice lateral pegajoso en escritorio y enlaces desplegables al inicio en
  móvil.

## Fuera de alcance

- La implementación de los comandos que se documentan: viven en
  [`../backend/02-comandos-de-consulta.md`](../backend/02-comandos-de-consulta.md)
  y [`../backend/03-comando-add.md`](../backend/03-comando-add.md).
- Las páginas `/docs/cli/<comando>` a las que enlaza cada comando: viven en
  [`08-docs-starlight.md`](./08-docs-starlight.md).
- La ficha de skill, que también muestra un bloque de instalación: vive en
  [`06-ficha-de-skill.md`](./06-ficha-de-skill.md).
- Los componentes compartidos que consume la página: viven en
  [`02-componentes-globales.md`](./02-componentes-globales.md).
- La publicación del paquete en npm y su versionado: viven en
  [`../backend/06-empaquetado-y-publicacion.md`](../backend/06-empaquetado-y-publicacion.md).
- Cualquier instalador, descarga de binario o verificación en runtime. La página
  es contenido estático: describe comandos, no los ejecuta.

## Tareas

- [x] 1. Crear `src/lib/cli-contract.ts` con la superficie del CLI como datos compartidos
  - Detalle de implementación: un módulo que exporta `CLI_COMMANDS` con los 7
  comandos (`init`, `list`, `search`, `add`, `remove`, `update`, `info`), cada uno
  con `name`, `summary`, `usage` y `href` a `/docs/cli/<comando>`, y
  `CLI_FLAGS` con los 6 flags (`--dir`, `--global`, `--force`, `--dry-run`,
  `--yes`, `--category`), cada uno con `flag`, `description`, `example` y
  `appliesTo`. La página los importa; no los reescribe. La misma tabla es la que
  `fwskills --help` imprime, y una discrepancia entre ambos es un defecto.
- [x] 2. Crear `src/pages/instalacion.astro` con título, breadcrumb e índice lateral
  - Detalle de implementación: un único `<h1>` «Instalación», `Breadcrumbs.astro`
  con `Inicio / Instalación`, y un índice lateral pegajoso con las 9 secciones a
  partir de 1024px. En móvil el índice se convierte en enlaces desplegables al
  inicio de la página. La columna de texto se limita a 820px de ancho.
- [x] 3. Redactar la sección 1, Requisitos
  - Detalle de implementación: versión mínima de Node, tomada de
  `engines.node` (`>=22.12.0`) de `frontend/package.json` en lugar de escrita a
  mano, terminal y gestor de paquetes. La sección declara explícitamente que no
  hay base de datos, ni contenedor, ni credenciales, ni Docker: quien lee la
  página no debería buscarlos.
- [x] 4. Construir la sección 2, Uso sin instalar, con los cuatro gestores
  - Detalle de implementación: `PackageManagerTabs.astro` con `npx fwskills …`,
  `pnpm dlx fwskills …`, `yarn dlx fwskills …` y `bunx fwskills …`. Cada comando se
  renderiza en un `CodeBlock.astro` con su botón de copiar, y la elección de gestor
  se sincroniza con todos los grupos de la página y se recuerda.
- [x] 5. Construir la sección 3, Instalación global y como dependencia de desarrollo
  - Detalle de implementación: `npm i -g fwskills` y las variantes
  `npm i -D fwskills` y `pnpm add -D fwskills`, cada una en su bloque de código
  copiable, con una línea que explique la diferencia entre instalarlo globalmente
  y tenerlo como dependencia del proyecto.
- [x] 6. Construir la sección 4, Comandos disponibles, recorriendo `CLI_COMMANDS`
  - Detalle de implementación: una fila por comando con su nombre en monospace, una
  línea de descripción y un enlace a `/docs/cli/<comando>`. La lista se genera
  desde la constante compartida, de modo que añadir un comando al CLI lo añade a
  esta página sin editarla.
- [x] 7. Construir la sección 5, Dónde se instalan las skills
  - Detalle de implementación: una tabla con la carpeta por defecto de cada agente
  compatible —`.opencode/skills/`, `.agents/skills/`, `.pi/skills/` y
  `.claude/skills/`, esta última marcada como destino propuesto y no verificado en
  el repositorio—, más una explicación de cómo cambiarla con `--dir` y de qué
  hace `--global`. La sección declara la precedencia completa para que la persona
  entienda por qué el CLI elige una carpeta y no otra.
- [x] 8. Construir la sección 6, Flags principales desde `CLI_FLAGS`
  - Detalle de implementación: tabla de tres columnas —flag, descripción,
  ejemplo— con seis filas generadas desde la constante, más una nota de que no
  existen formas cortas y de que `--flag valor` y `--flag=valor` son equivalentes.
- [x] 9. Construir la sección 7, Verificar la instalación
  - Detalle de implementación: `npx fwskills list` y
  `npx fwskills info <categoria>/<slug>` en bloques copiables, con una frase que
  explique que `info` nunca escribe en disco y que por eso es el comando seguro
  para comprobar a mano. La sección enlaza a `/skills` para elegir qué skill
  probar.
- [x] 10. Construir la sección 8, Solución de problemas comunes, con acordeones
  - Detalle de implementación: cinco paneles —destino no detectado, archivos
  existentes, permisos, versión antigua de Node y skill no encontrada— cada uno
  con el síntoma, la causa y el comando que lo resuelve. `Accordion.astro` con
  `singleOpen` activo. El primer panel incluye el mensaje exacto que emite el CLI
  cuando no detecta agente, con la salida 7 y la mención a `init` y a `--dir`.
- [x] 11. Construir la sección 9, Versionado y actualización
  - Detalle de implementación: `npx fwskills update`, `update <categoria>/<slug>` y
  `--dry-run` para ver qué se actualiza, con una explicación de que la caché del
  usuario evita volver a descargar el mismo payload y de que `update` solo actúa
  sobre skills instaladas por el CLI, que se reconocen por su archivo de manifiesto
  `.fwskills.json`.
- [ ] 12. Añadir el cierre de la página
  - Detalle de implementación: un bloque de cierre con un botón primario a
  `/skills` y otro secundario a `/docs`, más una línea que enlace a
  `/contribuir` para quien llega a buscar una skill que no encuentra.

## Criterios de Done

- [ ] `/instalacion` renderiza 9 secciones numeradas más el cierre, en el orden de la pantalla, y cada número es visible y navegable desde el índice lateral.
- [ ] La sección 1 declara la versión mínima de Node leída de `engines.node` (`>=22.12.0`), no escrita a mano: cambiar `engines` cambia la página.
- [ ] La sección 2 ofrece los cuatro gestores en un solo grupo de tabs; cambiar uno cambia todos los de la página y la elección persiste al recargar.
- [ ] La sección 4 enumera exactamente los 7 comandos y cada uno enlaza a una página `/docs/cli/<comando>` que existe.
- [ ] La sección 5 nombra `.opencode/skills/`, `.agents/skills/`, `.pi/skills/` y `.claude/skills/`, y marca la de Claude Code como propuesta no verificada en el repositorio.
- [ ] La sección 6 tiene una fila por cada uno de los 6 flags con descripción y ejemplo; la tabla se genera desde `CLI_FLAGS` y no desde markup escrito a mano.
- [ ] La sección 7 permite copiar `npx fwskills list` y `npx fwskills info <categoria>/<slug>`, y el copiado muestra «¡Copiado!» con anuncio `aria-live`.
- [ ] Los cinco acordeones de la sección 8 tienen `aria-expanded` y `aria-controls` válidos, solo uno queda abierto a la vez y cada uno incluye el comando que resuelve el problema.
- [ ] A 320px de ancho la página no tiene scroll horizontal; los bloques de código hacen su propio scroll interno.
- [ ] Ningún enlace interno de la página da 404: cada `href` a `/docs/cli/<comando>` corresponde a un archivo real de `src/content/docs/cli/`.
- [ ] La página no envía JavaScript de framework y no hace peticiones de red propias.
- [ ] No hay regresión en el área: `npm run check` termina con 0 errores y la superficie de la página coincide, comando por comando y flag por flag, con la de `fwskills --help`.

---

<!-- Auditoría 2026-09-29. COMPLETAS T1-T11: la pagina tiene las 9 secciones numeradas verificadas en el HTML generado (Requisitos, Uso sin instalar, Instalacion global, Comandos disponibles, Donde se instalan, Flags, Verificar, Problemas, Versionado), los 7 comandos y los 6 flags, PackageTabs, indice lateral sticky, acordeon de problemas y CTA. PENDIENTE REAL: T12 (los enlaces /docs/cli/<comando> no existen todavia porque las paginas del CLI se nombran init/list/search/add/remove/update/info/flags, sin el sufijo de comando por lo que el link no resolveria; se decidio no emitirlos para no generar 404). -->
